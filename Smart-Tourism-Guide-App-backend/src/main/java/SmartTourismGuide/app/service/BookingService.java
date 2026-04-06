//package SmartTourismGuide.app.service;
//
//import SmartTourismGuide.app.dto.request.CreateBookingDto;
//import SmartTourismGuide.app.dto.request.CreateRoomDto;
//import SmartTourismGuide.app.dto.response.BookingResponseDto;
//import SmartTourismGuide.app.dto.response.HotelResponseDto;
//import SmartTourismGuide.app.dto.response.RoomResponseDto;
//
//import java.util.List;
//
//public interface BookingService {
//
//    BookingResponseDto createBooking(CreateBookingDto dto, Long userId);
//
//    List<BookingResponseDto> getUserBookings(Long userId);
//
//    BookingResponseDto cancelBooking(Long bookingId, Long userId);
//
//    // Room management (admin)
//    RoomResponseDto addRoom(CreateRoomDto dto);
//
//    List<RoomResponseDto> getRoomsByHotel(Long hotelId);
//
//    // Hotel verification (admin)
//    HotelResponseDto submitHotel(Long userId, String name, String city, String address,
//            String description, String imageUrl,
//            Double latitude, Double longitude);
//
//    List<HotelResponseDto> getUnverifiedHotels();
//
//    HotelResponseDto verifyHotel(Long hotelId);
//
//    void rejectHotel(Long hotelId);
//}


package SmartTourismGuide.app.service;

import SmartTourismGuide.app.dto.request.CreateBookingDto;
import SmartTourismGuide.app.dto.request.CreateRoomDto;
import SmartTourismGuide.app.dto.response.BookingResponseDto;
import SmartTourismGuide.app.dto.response.HotelResponseDto;
import SmartTourismGuide.app.dto.response.RoomResponseDto;
import SmartTourismGuide.app.dto.update.UpdateRoomDto;

import java.time.LocalDate;
import java.util.List;

public interface BookingService {

    BookingResponseDto createBooking(CreateBookingDto dto, Long userId);

    BookingResponseDto payBooking(Long bookingId, Long userId);

    List<BookingResponseDto> getUserBookings(Long userId);

    BookingResponseDto cancelBooking(Long bookingId, Long userId);

    List<RoomResponseDto> getAvailableRooms(Long hotelId, LocalDate checkIn, LocalDate checkOut, Integer guests);

    // Room management (admin)
    RoomResponseDto addRoom(CreateRoomDto dto);

    List<RoomResponseDto> getRoomsByHotel(Long hotelId);

    // Hotel verification (admin)
    HotelResponseDto submitHotel(Long userId, String name, String city, String address,
                                 String description, String imageUrl,
                                 Double latitude, Double longitude);

    List<HotelResponseDto> getUnverifiedHotels();

    HotelResponseDto verifyHotel(Long hotelId);

    void rejectHotel(Long hotelId);

    RoomResponseDto updateRoom(Long roomId, UpdateRoomDto dto);
    void deleteRoom(Long roomId);

}
