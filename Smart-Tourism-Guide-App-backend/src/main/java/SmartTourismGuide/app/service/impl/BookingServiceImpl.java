package SmartTourismGuide.app.service.impl;

import SmartTourismGuide.app.dto.request.CreateBookingDto;
import SmartTourismGuide.app.dto.request.CreateRoomDto;
import SmartTourismGuide.app.dto.response.BookingResponseDto;
import SmartTourismGuide.app.dto.response.HotelResponseDto;
import SmartTourismGuide.app.dto.response.RoomResponseDto;
import SmartTourismGuide.app.entity.Booking;
import SmartTourismGuide.app.entity.Hotel;
import SmartTourismGuide.app.entity.Room;
import SmartTourismGuide.app.enums.BookingStatus;
import SmartTourismGuide.app.enums.PaymentStatus;
import SmartTourismGuide.app.exceptions.ResourceNotFoundException;
import SmartTourismGuide.app.mapper.HotelMapper;
import SmartTourismGuide.app.repository.BookingRepository;
import SmartTourismGuide.app.repository.HotelRepository;
import SmartTourismGuide.app.repository.RoomRepository;
import SmartTourismGuide.app.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final HotelRepository hotelRepository;

    // ─── Booking Flow ─────────────────────────────────────────────────────

    @Override
    @Transactional
    public BookingResponseDto createBooking(CreateBookingDto dto, Long userId) {
        if (!dto.getCheckOut().isAfter(dto.getCheckIn())) {
            throw new IllegalArgumentException("Check-out date must be after check-in date");
        }

        Room room = roomRepository.findById(dto.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Room", "id", dto.getRoomId()));

        Hotel hotel = room.getHotel(); // Hotel entity — no category check needed

        if (room.getAvailableRooms() <= 0) {
            throw new IllegalStateException("No rooms of this type are available");
        }

        boolean overlap = bookingRepository.existsOverlappingBooking(
                room.getId(), dto.getCheckIn(), dto.getCheckOut());
        if (overlap) {
            throw new IllegalStateException("Room is already booked for the selected dates");
        }

        long totalDays = ChronoUnit.DAYS.between(dto.getCheckIn(), dto.getCheckOut());
        BigDecimal totalPrice = room.getPricePerNight().multiply(BigDecimal.valueOf(totalDays));

        Booking booking = new Booking();
        booking.setUserId(userId);
        booking.setHotel(hotel);
        booking.setRoom(room);
        booking.setCheckIn(dto.getCheckIn());
        booking.setCheckOut(dto.getCheckOut());
        booking.setTotalDays((int) totalDays);
        booking.setTotalPrice(totalPrice);
        booking.setGuests(dto.getGuests());
        booking.setHotelName(hotel.getName());
        booking.setRoomTypeName(room.getRoomType().name());
        booking.setBookingStatus(BookingStatus.PENDING);
        booking.setPaymentStatus(PaymentStatus.UNPAID);

        Booking savedBooking = bookingRepository.save(booking);

        // Simulate Payment — auto-confirm
        savedBooking.setPaymentStatus(PaymentStatus.PAID);
        savedBooking.setBookingStatus(BookingStatus.CONFIRMED);
        room.setAvailableRooms(room.getAvailableRooms() - 1);
        roomRepository.save(room);
        bookingRepository.save(savedBooking);

        return toDto(savedBooking, hotel);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponseDto> getUserBookings(Long userId) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(b -> toDto(b, b.getHotel()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BookingResponseDto cancelBooking(Long bookingId, Long userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        if (!booking.getUserId().equals(userId)) {
            throw new IllegalStateException("You cannot cancel another user's booking");
        }
        if (booking.getBookingStatus() == BookingStatus.CANCELLED) {
            throw new IllegalStateException("Booking is already cancelled");
        }
        if (!booking.getCheckIn().isAfter(LocalDate.now())) {
            throw new IllegalStateException("Cannot cancel a booking that has already started");
        }

        booking.setBookingStatus(BookingStatus.CANCELLED);
        booking.setPaymentStatus(PaymentStatus.REFUNDED);

        Room room = booking.getRoom();
        room.setAvailableRooms(room.getAvailableRooms() + 1);
        roomRepository.save(room);
        bookingRepository.save(booking);

        return toDto(booking, booking.getHotel());
    }

    // ─── Room Management (Admin) ──────────────────────────────────────────

    @Override
    @Transactional
    public RoomResponseDto addRoom(CreateRoomDto dto) {
        Hotel hotel = hotelRepository.findById(dto.getHotelId())
                .orElseThrow(() -> new ResourceNotFoundException("Hotel", "id", dto.getHotelId()));

        Room room = new Room();
        room.setHotel(hotel);
        room.setRoomType(dto.getRoomType());
        room.setTotalRooms(dto.getTotalRooms());
        room.setAvailableRooms(dto.getTotalRooms());
        room.setPricePerNight(dto.getPricePerNight());
        room.setDescription(dto.getDescription());
        room.setAmenities(dto.getAmenities());

        return HotelMapper.toRoomResponseDto(roomRepository.save(room));
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomResponseDto> getRoomsByHotel(Long hotelId) {
        return roomRepository.findByHotelId(hotelId)
                .stream()
                .map(HotelMapper::toRoomResponseDto)
                .collect(Collectors.toList());
    }

    // ─── Hotel Verification (Admin) ───────────────────────────────────────

    @Override
    @Transactional
    public HotelResponseDto submitHotel(Long userId, String name, String city, String address,
            String description, String imageUrl, Double latitude, Double longitude) {
        Hotel hotel = new Hotel();
        hotel.setName(name);
        hotel.setCity(city);
        hotel.setAddress(address);
        hotel.setDescription(description);
        hotel.setImageUrl(imageUrl);
        hotel.setLatitude(latitude != null ? new BigDecimal(latitude.toString()) : BigDecimal.ZERO);
        hotel.setLongitude(longitude != null ? new BigDecimal(longitude.toString()) : BigDecimal.ZERO);
        hotel.setVerified(false);
        hotel.setSubmittedByUserId(userId);
        hotel.setDeleted(false);
        hotel.setAvailabilityStatus(false);
        hotel.setPopularity(0L);
        return HotelMapper.toHotelResponseDto(hotelRepository.save(hotel));
    }

    @Override
    @Transactional(readOnly = true)
    public List<HotelResponseDto> getUnverifiedHotels() {
        return hotelRepository.findByDeletedFalseAndVerifiedFalse()
                .stream()
                .map(HotelMapper::toHotelResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public HotelResponseDto verifyHotel(Long hotelId) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel", "id", hotelId));
        hotel.setVerified(true);
        hotel.setAvailabilityStatus(true);
        return HotelMapper.toHotelResponseDto(hotelRepository.save(hotel));
    }

    @Override
    @Transactional
    public void rejectHotel(Long hotelId) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel", "id", hotelId));
        hotel.setDeleted(true);
        hotelRepository.save(hotel);
    }

    // ─── Private helpers ──────────────────────────────────────────────────

    private BookingResponseDto toDto(Booking booking, Hotel hotel) {
        return BookingResponseDto.builder()
                .id(booking.getId())
                .hotelId(hotel.getId())
                .hotelName(booking.getHotelName() != null ? booking.getHotelName() : hotel.getName())
                .hotelCity(hotel.getCity())
                .hotelImageUrl(hotel.getImageUrl())
                .roomId(booking.getRoom().getId())
                .roomType(booking.getRoomTypeName() != null ? booking.getRoomTypeName()
                        : booking.getRoom().getRoomType().name())
                .checkIn(booking.getCheckIn())
                .checkOut(booking.getCheckOut())
                .totalDays(booking.getTotalDays())
                .totalPrice(booking.getTotalPrice())
                .guests(booking.getGuests())
                .bookingStatus(booking.getBookingStatus())
                .paymentStatus(booking.getPaymentStatus())
                .createdAt(booking.getCreatedAt())
                .build();
    }
}
