package SmartTourismGuide.app.service.impl;

import SmartTourismGuide.app.dto.response.ContributionResponseDto;
import SmartTourismGuide.app.dto.response.UserContributionsResponseDto;
import SmartTourismGuide.app.dto.update.UpdateEventDto;
import SmartTourismGuide.app.dto.update.UpdateHotelDto;
import SmartTourismGuide.app.dto.update.UpdatePlaceDto;
import SmartTourismGuide.app.entity.Event;
import SmartTourismGuide.app.entity.Hotel;
import SmartTourismGuide.app.entity.Place;
import SmartTourismGuide.app.enums.PlaceStatus;
import SmartTourismGuide.app.exceptions.ResourceNotFoundException;
import SmartTourismGuide.app.repository.EventRepository;
import SmartTourismGuide.app.repository.HotelRepository;
import SmartTourismGuide.app.repository.PlaceRepository;
import SmartTourismGuide.app.service.UserContributionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserContributionServiceImpl implements UserContributionService {

    private final PlaceRepository placeRepository;
    private final EventRepository eventRepository;
    private final HotelRepository hotelRepository;

    // ── Fetch ─────────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public UserContributionsResponseDto getMyContributions(Long userId) {

        List<ContributionResponseDto> places = placeRepository
                .findBySubmittedByUserIdAndDeletedFalseOrderByCreatedAtDesc(userId)
                .stream().map(this::toPlaceDto).collect(Collectors.toList());

        List<ContributionResponseDto> events = eventRepository
                .findBySubmittedByUserIdAndDeletedFalseOrderByCreatedAtDesc(userId)
                .stream().map(this::toEventDto).collect(Collectors.toList());

        List<ContributionResponseDto> hotels = hotelRepository
                .findBySubmittedByUserIdAndDeletedFalseOrderByCreatedAtDesc(userId)
                .stream().map(this::toHotelDto).collect(Collectors.toList());

        return UserContributionsResponseDto.builder()
                .places(places).events(events).hotels(hotels).build();
    }

    // ── Update place ──────────────────────────────────────────────────────────

    @Override
    @Transactional
    public ContributionResponseDto updateMyPlace(Long placeId, Long userId, UpdatePlaceDto dto) {
        Place place = placeRepository.findById(placeId)
                .orElseThrow(() -> new ResourceNotFoundException("Place", "id", placeId));
        assertOwner(place.getSubmittedByUserId(), userId, "Place");
        assertPlaceEditable(place);

        if (dto.getName()         != null) place.setName(dto.getName());
        if (dto.getDescription()  != null) place.setDescription(dto.getDescription());
        if (dto.getCategory()     != null) place.setCategory(dto.getCategory());
        if (dto.getCity()         != null) place.setCity(dto.getCity());
        if (dto.getAddress()      != null) place.setAddress(dto.getAddress());
        if (dto.getContactInfo()  != null) place.setContactInfo(dto.getContactInfo());
        if (dto.getOpeningHours() != null) place.setOpeningHours(dto.getOpeningHours());
        if (dto.getPriceRange()   != null) place.setPriceRange(dto.getPriceRange());
        if (dto.getLatitude()     != null) place.setLatitude(dto.getLatitude());
        if (dto.getLongitude()    != null) place.setLongitude(dto.getLongitude());
        if (dto.getImageUrl()     != null) place.setImageUrl(dto.getImageUrl());
        if (dto.getImageUrls()    != null) place.setImageUrls(dto.getImageUrls());

        return toPlaceDto(placeRepository.save(place));
    }

    // ── Update event ──────────────────────────────────────────────────────────

    @Override
    @Transactional
    public ContributionResponseDto updateMyEvent(Long eventId, Long userId, UpdateEventDto dto) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", eventId));
        assertOwner(event.getSubmittedByUserId(), userId, "Event");
        assertEventEditable(event);

        if (dto.getName()             != null) event.setName(dto.getName());
        if (dto.getDescription()      != null) event.setDescription(dto.getDescription());
        if (dto.getCategory()         != null) event.setCategory(dto.getCategory());
        if (dto.getEventDate()        != null) event.setEventDate(dto.getEventDate());
        if (dto.getEndDate()          != null) event.setEndDate(dto.getEndDate());
        if (dto.getEventTime()        != null) event.setEventTime(dto.getEventTime());
        if (dto.getCity()             != null) event.setCity(dto.getCity());
        if (dto.getVenue()            != null) event.setVenue(dto.getVenue());
        if (dto.getAddress()          != null) event.setAddress(dto.getAddress());
        if (dto.getLatitude()         != null) event.setLatitude(dto.getLatitude());
        if (dto.getLongitude()        != null) event.setLongitude(dto.getLongitude());
        if (dto.getOrganizerName()    != null) event.setOrganizerName(dto.getOrganizerName());
        if (dto.getOrganizerContact() != null) event.setOrganizerContact(dto.getOrganizerContact());
        if (dto.getTicketInfo()       != null) event.setTicketInfo(dto.getTicketInfo());
        if (dto.getEntryFee()         != null) event.setEntryFee(dto.getEntryFee());
        if (dto.getIsFree()           != null) event.setIsFree(dto.getIsFree());
        if (dto.getImageUrl()         != null) event.setImageUrl(dto.getImageUrl());
        if (dto.getWebsiteUrl()       != null) event.setWebsiteUrl(dto.getWebsiteUrl());

        return toEventDto(eventRepository.save(event));
    }

    // ── Update hotel ──────────────────────────────────────────────────────────

    @Override
    @Transactional
    public ContributionResponseDto updateMyHotel(Long hotelId, Long userId, UpdateHotelDto dto) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel", "id", hotelId));
        assertOwner(hotel.getSubmittedByUserId(), userId, "Hotel");
        assertHotelEditable(hotel);

        if (dto.getName()          != null) hotel.setName(dto.getName());
        if (dto.getDescription()   != null) hotel.setDescription(dto.getDescription());
        if (dto.getCity()          != null) hotel.setCity(dto.getCity());
        if (dto.getAddress()       != null) hotel.setAddress(dto.getAddress());
        if (dto.getContactInfo()   != null) hotel.setContactInfo(dto.getContactInfo());
        if (dto.getOpeningHours()  != null) hotel.setOpeningHours(dto.getOpeningHours());
        if (dto.getPriceRange()    != null) hotel.setPriceRange(String.valueOf(dto.getPriceRange()));
        if (dto.getLatitude()      != null) hotel.setLatitude(dto.getLatitude());
        if (dto.getLongitude()     != null) hotel.setLongitude(dto.getLongitude());
        if (dto.getImageUrl()      != null) hotel.setImageUrl(dto.getImageUrl());
        if (dto.getImageUrls()     != null) hotel.setImageUrls(dto.getImageUrls());
        if (dto.getAmenities()     != null) hotel.setAmenities(dto.getAmenities());
        if (dto.getPricePerNight() != null) hotel.setPricePerNight(dto.getPricePerNight());

        return toHotelDto(hotelRepository.save(hotel));
    }

    // ── Guards ────────────────────────────────────────────────────────────────

    private void assertOwner(Long ownerId, Long requesterId, String entity) {
        if (ownerId == null || !ownerId.equals(requesterId))
            throw new IllegalStateException("You do not own this " + entity);
    }

    private void assertPlaceEditable(Place place) {
        PlaceStatus status = place.getStatus();
        if (status == PlaceStatus.APPROVED)
            throw new IllegalStateException("Place has already been approved and cannot be edited.");
        if (status == PlaceStatus.REJECTED)
            throw new IllegalStateException("Place was rejected and cannot be edited.");
    }

    private void assertEventEditable(Event event) {
        if (Boolean.TRUE.equals(event.getVerified()))
            throw new IllegalStateException("Event has already been approved and cannot be edited.");
    }

    private void assertHotelEditable(Hotel hotel) {
        if (Boolean.TRUE.equals(hotel.getVerified()))
            throw new IllegalStateException("Hotel has already been approved and cannot be edited.");
    }

    // ── Mappers ───────────────────────────────────────────────────────────────

    private ContributionResponseDto toPlaceDto(Place p) {
        // KEY FIX: Use PlaceStatus enum directly — PENDING/APPROVED/REJECTED
        // Do NOT use verified boolean for places — that's for admin-created places
        String status;
        if (p.getStatus() != null) {
            status = p.getStatus().name(); // "PENDING" | "APPROVED" | "REJECTED"
        } else {
            status = Boolean.TRUE.equals(p.getVerified()) ? "APPROVED" : "PENDING";
        }

        return ContributionResponseDto.builder()
                .id(p.getId())
                .type("PLACE")
                .name(p.getName())
                .city(p.getCity())
                .imageUrl(p.getImageUrl())
                .imageUrls(p.getImageUrls())
                .category(p.getCategory() != null ? p.getCategory().name() : null)
                .status(status)
                .verified(p.getVerified())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }

    private ContributionResponseDto toEventDto(Event e) {
        String status = Boolean.TRUE.equals(e.getVerified()) ? "APPROVED" : "PENDING";
        return ContributionResponseDto.builder()
                .id(e.getId()).type("EVENT").name(e.getName()).city(e.getCity())
                .imageUrl(e.getImageUrl())
                .category(e.getCategory() != null ? e.getCategory().name() : null)
                .status(status).verified(e.getVerified())
                .createdAt(e.getCreatedAt()).updatedAt(e.getUpdatedAt())
                .build();
    }

    private ContributionResponseDto toHotelDto(Hotel h) {
        String status = Boolean.TRUE.equals(h.getVerified()) ? "APPROVED" : "PENDING";
        return ContributionResponseDto.builder()
                .id(h.getId()).type("HOTEL").name(h.getName()).city(h.getCity())
                .imageUrl(h.getImageUrl()).imageUrls(h.getImageUrls())
                .status(status).verified(h.getVerified())
                .createdAt(h.getCreatedAt()).updatedAt(h.getUpdatedAt())
                .build();
    }
}