//package SmartTourismGuide.app.service.impl;
//
//import SmartTourismGuide.app.dto.request.CreateBookingDto;
//import SmartTourismGuide.app.dto.request.CreateRoomDto;
//import SmartTourismGuide.app.dto.response.BookingResponseDto;
//import SmartTourismGuide.app.dto.response.HotelResponseDto;
//import SmartTourismGuide.app.dto.response.RoomResponseDto;
//import SmartTourismGuide.app.entity.Booking;
//import SmartTourismGuide.app.entity.Hotel;
//import SmartTourismGuide.app.entity.Room;
//import SmartTourismGuide.app.enums.BookingStatus;
//import SmartTourismGuide.app.enums.PaymentStatus;
//import SmartTourismGuide.app.exceptions.ResourceNotFoundException;
//import SmartTourismGuide.app.mapper.HotelMapper;
//import SmartTourismGuide.app.repository.BookingRepository;
//import SmartTourismGuide.app.repository.HotelRepository;
//import SmartTourismGuide.app.repository.RoomRepository;
//import SmartTourismGuide.app.service.BookingService;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.math.BigDecimal;
//import java.time.LocalDate;
//import java.time.temporal.ChronoUnit;
//import java.util.List;
//import java.util.stream.Collectors;
//
//@Service
//@RequiredArgsConstructor
//public class BookingServiceImpl implements BookingService {
//
//    private final BookingRepository bookingRepository;
//    private final RoomRepository roomRepository;
//    private final HotelRepository hotelRepository;
//
//    // ─── Booking Flow ─────────────────────────────────────────────────────
//
//    @Override
//    @Transactional
//    public BookingResponseDto createBooking(CreateBookingDto dto, Long userId) {
//        if (!dto.getCheckOut().isAfter(dto.getCheckIn())) {
//            throw new IllegalArgumentException("Check-out date must be after check-in date");
//        }
//
//        Room room = roomRepository.findById(dto.getRoomId())
//                .orElseThrow(() -> new ResourceNotFoundException("Room", "id", dto.getRoomId()));
//
//        Hotel hotel = room.getHotel(); // Hotel entity — no category check needed
//
//        if (room.getAvailableRooms() <= 0) {
//            throw new IllegalStateException("No rooms of this type are available");
//        }
//
//        boolean overlap = bookingRepository.existsOverlappingBooking(
//                room.getId(), dto.getCheckIn(), dto.getCheckOut());
//        if (overlap) {
//            throw new IllegalStateException("Room is already booked for the selected dates");
//        }
//
//        long totalDays = ChronoUnit.DAYS.between(dto.getCheckIn(), dto.getCheckOut());
//        BigDecimal totalPrice = room.getPricePerNight().multiply(BigDecimal.valueOf(totalDays));
//
//        Booking booking = new Booking();
//        booking.setUserId(userId);
//        booking.setHotel(hotel);
//        booking.setRoom(room);
//        booking.setCheckIn(dto.getCheckIn());
//        booking.setCheckOut(dto.getCheckOut());
//        booking.setTotalDays((int) totalDays);
//        booking.setTotalPrice(totalPrice);
//        booking.setGuests(dto.getGuests());
//        booking.setHotelName(hotel.getName());
//        booking.setRoomTypeName(room.getRoomType().name());
//        booking.setBookingStatus(BookingStatus.PENDING);
//        booking.setPaymentStatus(PaymentStatus.UNPAID);
//
//        Booking savedBooking = bookingRepository.save(booking);
//
//        // Simulate Payment — auto-confirm
//        savedBooking.setPaymentStatus(PaymentStatus.PAID);
//        savedBooking.setBookingStatus(BookingStatus.CONFIRMED);
//        room.setAvailableRooms(room.getAvailableRooms() - 1);
//        roomRepository.save(room);
//        bookingRepository.save(savedBooking);
//
//        return toDto(savedBooking, hotel);
//    }
//
//    @Override
//    @Transactional(readOnly = true)
//    public List<BookingResponseDto> getUserBookings(Long userId) {
//        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId)
//                .stream()
//                .map(b -> toDto(b, b.getHotel()))
//                .collect(Collectors.toList());
//    }
//
//    @Override
//    @Transactional
//    public BookingResponseDto cancelBooking(Long bookingId, Long userId) {
//        Booking booking = bookingRepository.findById(bookingId)
//                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));
//
//        if (!booking.getUserId().equals(userId)) {
//            throw new IllegalStateException("You cannot cancel another user's booking");
//        }
//        if (booking.getBookingStatus() == BookingStatus.CANCELLED) {
//            throw new IllegalStateException("Booking is already cancelled");
//        }
//        if (!booking.getCheckIn().isAfter(LocalDate.now())) {
//            throw new IllegalStateException("Cannot cancel a booking that has already started");
//        }
//
//        booking.setBookingStatus(BookingStatus.CANCELLED);
//        booking.setPaymentStatus(PaymentStatus.REFUNDED);
//
//        Room room = booking.getRoom();
//        room.setAvailableRooms(room.getAvailableRooms() + 1);
//        roomRepository.save(room);
//        bookingRepository.save(booking);
//
//        return toDto(booking, booking.getHotel());
//    }
//
//    // ─── Room Management (Admin) ──────────────────────────────────────────
//
//    @Override
//    @Transactional
//    public RoomResponseDto addRoom(CreateRoomDto dto) {
//        Hotel hotel = hotelRepository.findById(dto.getHotelId())
//                .orElseThrow(() -> new ResourceNotFoundException("Hotel", "id", dto.getHotelId()));
//
//        Room room = new Room();
//        room.setHotel(hotel);
//        room.setRoomType(dto.getRoomType());
//        room.setTotalRooms(dto.getTotalRooms());
//        room.setAvailableRooms(dto.getTotalRooms());
//        room.setPricePerNight(dto.getPricePerNight());
//        room.setDescription(dto.getDescription());
//        room.setAmenities(dto.getAmenities());
//
//        return HotelMapper.toRoomResponseDto(roomRepository.save(room));
//    }
//
//    @Override
//    @Transactional(readOnly = true)
//    public List<RoomResponseDto> getRoomsByHotel(Long hotelId) {
//        return roomRepository.findByHotelId(hotelId)
//                .stream()
//                .map(HotelMapper::toRoomResponseDto)
//                .collect(Collectors.toList());
//    }
//
//    // ─── Hotel Verification (Admin) ───────────────────────────────────────
//
//    @Override
//    @Transactional
//    public HotelResponseDto submitHotel(Long userId, String name, String city, String address,
//            String description, String imageUrl, Double latitude, Double longitude) {
//        Hotel hotel = new Hotel();
//        hotel.setName(name);
//        hotel.setCity(city);
//        hotel.setAddress(address);
//        hotel.setDescription(description);
//        hotel.setImageUrl(imageUrl);
//        hotel.setLatitude(latitude != null ? new BigDecimal(latitude.toString()) : BigDecimal.ZERO);
//        hotel.setLongitude(longitude != null ? new BigDecimal(longitude.toString()) : BigDecimal.ZERO);
//        hotel.setVerified(false);
//        hotel.setSubmittedByUserId(userId);
//        hotel.setDeleted(false);
//        hotel.setAvailabilityStatus(false);
//        hotel.setPopularity(0L);
//        return HotelMapper.toHotelResponseDto(hotelRepository.save(hotel));
//    }
//
//    @Override
//    @Transactional(readOnly = true)
//    public List<HotelResponseDto> getUnverifiedHotels() {
//        return hotelRepository.findByDeletedFalseAndVerifiedFalse()
//                .stream()
//                .map(HotelMapper::toHotelResponseDto)
//                .collect(Collectors.toList());
//    }
//
//    @Override
//    @Transactional
//    public HotelResponseDto verifyHotel(Long hotelId) {
//        Hotel hotel = hotelRepository.findById(hotelId)
//                .orElseThrow(() -> new ResourceNotFoundException("Hotel", "id", hotelId));
//        hotel.setVerified(true);
//        hotel.setAvailabilityStatus(true);
//        return HotelMapper.toHotelResponseDto(hotelRepository.save(hotel));
//    }
//
//    @Override
//    @Transactional
//    public void rejectHotel(Long hotelId) {
//        Hotel hotel = hotelRepository.findById(hotelId)
//                .orElseThrow(() -> new ResourceNotFoundException("Hotel", "id", hotelId));
//        hotel.setDeleted(true);
//        hotelRepository.save(hotel);
//    }
//
//    // ─── Private helpers ──────────────────────────────────────────────────
//
//    private BookingResponseDto toDto(Booking booking, Hotel hotel) {
//        return BookingResponseDto.builder()
//                .id(booking.getId())
//                .hotelId(hotel.getId())
//                .hotelName(booking.getHotelName() != null ? booking.getHotelName() : hotel.getName())
//                .hotelCity(hotel.getCity())
//                .hotelImageUrl(hotel.getImageUrl())
//                .roomId(booking.getRoom().getId())
//                .roomType(booking.getRoomTypeName() != null ? booking.getRoomTypeName()
//                        : booking.getRoom().getRoomType().name())
//                .checkIn(booking.getCheckIn())
//                .checkOut(booking.getCheckOut())
//                .totalDays(booking.getTotalDays())
//                .totalPrice(booking.getTotalPrice())
//                .guests(booking.getGuests())
//                .bookingStatus(booking.getBookingStatus())
//                .paymentStatus(booking.getPaymentStatus())
//                .createdAt(booking.getCreatedAt())
//                .build();
//    }
//}


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
import SmartTourismGuide.app.dto.update.UpdateRoomDto;

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

    @Override
    @Transactional
    public BookingResponseDto createBooking(CreateBookingDto dto, Long userId) {
        validateDates(dto.getCheckIn(), dto.getCheckOut());

        Hotel hotel = hotelRepository.findByIdAndDeletedFalse(dto.getHotelId())
                .orElseThrow(() -> new ResourceNotFoundException("Hotel", "id", dto.getHotelId()));

        Room room = roomRepository.findById(dto.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Room", "id", dto.getRoomId()));

        if (!room.getHotel().getId().equals(hotel.getId())) {
            throw new IllegalArgumentException("Selected room does not belong to the selected hotel");
        }

        validateGuests(dto.getGuests(), room);
        int availableForDates = calculateAvailableRoomsForDates(room, dto.getCheckIn(), dto.getCheckOut());
        if (availableForDates <= 0) {
            throw new IllegalStateException("No rooms of this type are available for the selected dates");
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
        return toDto(savedBooking, hotel);
    }

    @Override
    @Transactional
    public BookingResponseDto payBooking(Long bookingId, Long userId) {
        Booking booking = bookingRepository.findByIdAndUserId(bookingId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        if (booking.getBookingStatus() == BookingStatus.CANCELLED) {
            throw new IllegalStateException("Cancelled booking cannot be paid");
        }
        if (booking.getPaymentStatus() == PaymentStatus.PAID) {
            throw new IllegalStateException("Booking is already paid");
        }

        Room room = roomRepository.findByIdForUpdate(booking.getRoom().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Room", "id", booking.getRoom().getId()));

        int availableForDates = calculateAvailableRoomsForDates(room, booking.getCheckIn(), booking.getCheckOut());
        if (availableForDates <= 0) {
            throw new IllegalStateException("No rooms available anymore for the selected dates");
        }

        booking.setPaymentStatus(PaymentStatus.PAID);
        booking.setBookingStatus(BookingStatus.CONFIRMED);

        // Kept only as a cached inventory field; date-aware availability is derived from bookings.
        if (room.getAvailableRooms() != null && room.getAvailableRooms() > 0) {
            room.setAvailableRooms(room.getAvailableRooms() - 1);
            roomRepository.save(room);
        }

        Booking saved = bookingRepository.save(booking);
        return toDto(saved, saved.getHotel());
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
        Booking booking = bookingRepository.findByIdAndUserId(bookingId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        if (booking.getBookingStatus() == BookingStatus.CANCELLED) {
            throw new IllegalStateException("Booking is already cancelled");
        }
        if (!booking.getCheckIn().isAfter(LocalDate.now())) {
            throw new IllegalStateException("Cannot cancel a booking that has already started");
        }

        boolean wasConfirmedAndPaid = booking.getBookingStatus() == BookingStatus.CONFIRMED
                && booking.getPaymentStatus() == PaymentStatus.PAID;

        booking.setBookingStatus(BookingStatus.CANCELLED);
        booking.setPaymentStatus(wasConfirmedAndPaid ? PaymentStatus.REFUNDED : PaymentStatus.UNPAID);

        if (wasConfirmedAndPaid) {
            Room room = roomRepository.findByIdForUpdate(booking.getRoom().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Room", "id", booking.getRoom().getId()));

            room.setAvailableRooms(room.getAvailableRooms() + 1);
            roomRepository.save(room);
        }

        Booking saved = bookingRepository.save(booking);
        return toDto(saved, saved.getHotel());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomResponseDto> getAvailableRooms(Long hotelId, LocalDate checkIn, LocalDate checkOut, Integer guests) {
        validateDates(checkIn, checkOut);

        hotelRepository.findByIdAndDeletedFalse(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel", "id", hotelId));

        int safeGuests = guests == null || guests < 1 ? 1 : guests;

        return roomRepository.findByHotelId(hotelId)
                .stream()
                .filter(room -> room.getCapacity() == null || room.getCapacity() >= safeGuests)
                .map(room -> {
                    int availableForDates = calculateAvailableRoomsForDates(room, checkIn, checkOut);
                    return HotelMapper.toRoomResponseDto(room, availableForDates);
                })
                .filter(RoomResponseDto::isAvailable)
                .collect(Collectors.toList());
    }

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
        room.setCapacity(dto.getCapacity());
        room.setImageUrls(dto.getImageUrls());

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

    private int calculateAvailableRoomsForDates(Room room, LocalDate checkIn, LocalDate checkOut) {
        long confirmedOverlaps = bookingRepository.countConfirmedOverlappingBookings(room.getId(), checkIn, checkOut);
        int total = room.getTotalRooms() != null ? room.getTotalRooms() : 0;
        return Math.max(0, total - (int) confirmedOverlaps);
    }

    private void validateDates(LocalDate checkIn, LocalDate checkOut) {
        if (checkIn == null || checkOut == null) {
            throw new IllegalArgumentException("Check-in and check-out dates are required");
        }
        if (!checkOut.isAfter(checkIn)) {
            throw new IllegalArgumentException("Check-out date must be after check-in date");
        }
        if (checkIn.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Check-in date cannot be in the past");
        }
    }

    private void validateGuests(int guests, Room room) {
        if (guests < 1) {
            throw new IllegalArgumentException("At least 1 guest is required");
        }
        if (room.getCapacity() != null && guests > room.getCapacity()) {
            throw new IllegalArgumentException("Selected room cannot accommodate the requested number of guests");
        }
    }

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

    // new methods
    @Override
    @Transactional
    public RoomResponseDto updateRoom(Long roomId, UpdateRoomDto dto) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room", "id", roomId));

        int oldTotalRooms = room.getTotalRooms() != null ? room.getTotalRooms() : 0;
        int oldAvailableRooms = room.getAvailableRooms() != null ? room.getAvailableRooms() : 0;
        int bookedRooms = Math.max(0, oldTotalRooms - oldAvailableRooms);

        if (dto.getTotalRooms() < bookedRooms) {
            throw new IllegalArgumentException("Total rooms cannot be less than already booked rooms");
        }

        room.setRoomType(dto.getRoomType());
        room.setTotalRooms(dto.getTotalRooms());
        room.setAvailableRooms(dto.getTotalRooms() - bookedRooms);
        room.setPricePerNight(dto.getPricePerNight());
        room.setDescription(dto.getDescription());
        room.setAmenities(dto.getAmenities());
        room.setCapacity(dto.getCapacity());
        room.setImageUrls(dto.getImageUrls());

        return HotelMapper.toRoomResponseDto(roomRepository.save(room));
    }

    @Override
    @Transactional
    public void deleteRoom(Long roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room", "id", roomId));

        long activeBookings = bookingRepository.countConfirmedOverlappingBookings(
                room.getId(),
                LocalDate.now(),
                LocalDate.now().plusYears(10)
        );

        if (activeBookings > 0) {
            throw new IllegalStateException("Cannot delete a room type with active confirmed bookings");
        }

        roomRepository.delete(room);
    }

}
