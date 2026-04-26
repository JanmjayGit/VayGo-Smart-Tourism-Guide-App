-- VayGo Hotel Entity Migration Script
-- Run this BEFORE restarting the Spring Boot backend


-- STEP 1: Migrate hotel records from places → hotels


INSERT INTO hotels (
    id,
    name,
    description,
    city,
    address,
    contact_info,
    opening_hours,
    price_range,
    latitude,
    longitude,
    image_url,
    amenities,
    price_per_night,
    rating,
    availability_status,
    verified,
    deleted,
    submitted_by_user_id,
    popularity,
    created_at,
    updated_at,
    deleted_at
)
SELECT
    places.id,
    places.name,
    places.description,
    places.city,
    places.address,
    places.contact_info,
    places.opening_hours,
    CAST(places.price_range AS CHAR),
    places.latitude,
    places.longitude,
    places.image_url,
    places.amenities,
    places.price_per_night,
    places.rating,
    places.availability_status,
    places.verified,
    places.deleted,
    places.submitted_by_user_id,
    places.popularity,
    places.created_at,
    places.updated_at,
    places.deleted_at
FROM places
WHERE places.category = 'HOTEL'
ON DUPLICATE KEY UPDATE hotels.id = hotels.id;

-- STEP 2: Migrate gallery images

INSERT INTO hotel_images (hotel_id, image_url)
SELECT
    place_photos.place_id,
    place_photos.photo_url
FROM place_photos
WHERE place_photos.place_id IN (
    SELECT places.id FROM places WHERE places.category = 'HOTEL'
)
ON DUPLICATE KEY UPDATE hotel_id = hotel_id;

-- STEP 3: Verify migration


SELECT
    (SELECT COUNT(*) FROM places WHERE places.category = 'HOTEL' AND places.deleted = false) AS places_hotel_count,
    (SELECT COUNT(*) FROM hotels WHERE hotels.deleted = false) AS hotels_table_count;

SELECT COUNT(*) AS orphaned_rooms
FROM rooms r
WHERE NOT EXISTS (
    SELECT 1 FROM hotels h WHERE h.id = r.hotel_id
);

SELECT COUNT(*) AS orphaned_bookings
FROM bookings b
WHERE NOT EXISTS (
    SELECT 1 FROM hotels h WHERE h.id = b.hotel_id
);

