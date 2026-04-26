package SmartTourismGuide.app.mapper;

import SmartTourismGuide.app.dto.request.CreateEventRequest;
import SmartTourismGuide.app.dto.request.UpdateEventRequest;
import SmartTourismGuide.app.dto.response.EventDto;
import SmartTourismGuide.app.dto.response.EventSummaryDto;
import SmartTourismGuide.app.entity.Event;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class EventMapper {

    public Event toEntity(CreateEventRequest request) {
        return Event.builder()
                .name(request.getName())
                .description(request.getDescription())
                .category(request.getCategory())
                .eventDate(request.getEventDate())
                .endDate(request.getEndDate())
                .eventTime(request.getEventTime())
                .city(request.getCity())
                .venue(request.getVenue())
                .address(request.getAddress())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .organizerName(request.getOrganizerName())
                .organizerContact(request.getOrganizerContact())
                .ticketInfo(request.getTicketInfo())
                .entryFee(request.getEntryFee())
                .isFree(request.getIsFree() != null ? request.getIsFree() : false)
                .imageUrl(request.getImageUrl())
                .websiteUrl(request.getWebsiteUrl())
                .deleted(false)
                .build();
    }

    public void updateEntity(Event event, UpdateEventRequest request) {
        if (request.getName() != null) {
            event.setName(request.getName());
        }
        if (request.getDescription() != null) {
            event.setDescription(request.getDescription());
        }
        if (request.getCategory() != null) {
            event.setCategory(request.getCategory());
        }
        if (request.getEventDate() != null) {
            event.setEventDate(request.getEventDate());
        }
        if (request.getEndDate() != null) {
            event.setEndDate(request.getEndDate());
        }
        if (request.getEventTime() != null) {
            event.setEventTime(request.getEventTime());
        }
        if (request.getCity() != null) {
            event.setCity(request.getCity());
        }
        if (request.getVenue() != null) {
            event.setVenue(request.getVenue());
        }
        if (request.getAddress() != null) {
            event.setAddress(request.getAddress());
        }
        if (request.getLatitude() != null) {
            event.setLatitude(request.getLatitude());
        }
        if (request.getLongitude() != null) {
            event.setLongitude(request.getLongitude());
        }
        if (request.getOrganizerName() != null) {
            event.setOrganizerName(request.getOrganizerName());
        }
        if (request.getOrganizerContact() != null) {
            event.setOrganizerContact(request.getOrganizerContact());
        }
        if (request.getTicketInfo() != null) {
            event.setTicketInfo(request.getTicketInfo());
        }
        if (request.getEntryFee() != null) {
            event.setEntryFee(request.getEntryFee());
        }
        if (request.getIsFree() != null) {
            event.setIsFree(request.getIsFree());
        }
        if (request.getImageUrl() != null) {
            event.setImageUrl(request.getImageUrl());
        }
        if (request.getWebsiteUrl() != null) {
            event.setWebsiteUrl(request.getWebsiteUrl());
        }
    }

    public EventDto toDto(Event event) {
        return EventDto.builder()
                .id(event.getId())
                .name(event.getName())
                .description(event.getDescription())
                .category(event.getCategory())
                .eventDate(event.getEventDate())
                .endDate(event.getEndDate())
                .eventTime(event.getEventTime())
                .city(event.getCity())
                .venue(event.getVenue())
                .address(event.getAddress())
                .latitude(event.getLatitude() != null ? event.getLatitude().doubleValue() : null)
                .longitude(event.getLongitude() != null ? event.getLongitude().doubleValue() : null)
                .organizerName(event.getOrganizerName())
                .organizerContact(event.getOrganizerContact())
                .ticketInfo(event.getTicketInfo())
                .entryFee(event.getEntryFee())
                .isFree(event.getIsFree())
                .imageUrl(event.getImageUrl())
                .imageUrls(
                        event.getImages() != null
                                ? event.getImages().stream()
                                        .map(img -> img.getImageUrl())
                                        .toList()
                                :List.of())
                .websiteUrl(event.getWebsiteUrl())
                .createdAt(event.getCreatedAt())
                .updatedAt(event.getUpdatedAt())
                .verified(event.getVerified())
                .build();
    }

    public EventSummaryDto toSummaryDto(Event event) {
        return EventSummaryDto.builder()
                .id(event.getId())
                .name(event.getName())
                .category(event.getCategory())
                .eventDate(event.getEventDate())
                .city(event.getCity())
                .venue(event.getVenue())
                .isFree(event.getIsFree())
                .imageUrl(event.getImageUrl())
                .imageUrls(
                        event.getImages()
                                .stream()
                                .map(img -> img.getImageUrl())
                                .toList())
                .build();
    }
}
