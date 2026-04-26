package SmartTourismGuide.app.service;

import SmartTourismGuide.app.dto.response.UserContributionsResponseDto;
import SmartTourismGuide.app.dto.response.ContributionResponseDto;
import SmartTourismGuide.app.dto.update.UpdatePlaceDto;
import SmartTourismGuide.app.dto.update.UpdateHotelDto;
import SmartTourismGuide.app.dto.update.UpdateEventDto;

public interface UserContributionService {

    /** Fetch all places, events, hotels submitted by this user */
    UserContributionsResponseDto getMyContributions(Long userId);

    /** Edit a place the user submitted (only if still PENDING) */
    ContributionResponseDto updateMyPlace(Long placeId, Long userId, UpdatePlaceDto dto);

    /** Edit an event the user submitted (only if still PENDING) */
    ContributionResponseDto updateMyEvent(Long eventId, Long userId, UpdateEventDto dto);

    /** Edit a hotel the user submitted (only if still PENDING) */
    ContributionResponseDto updateMyHotel(Long hotelId, Long userId, UpdateHotelDto dto);
}