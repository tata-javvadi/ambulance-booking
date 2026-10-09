/*
# Add test image URLs for seeded ambulances

## Purpose
Populate `image_url` on existing seed rows so Choose Ambulance search results
show vehicle images. Paths point at local assets in the app's /public/ambulances folder.

## Changes
- UPDATE image_url for the four seeded Andhra Pradesh ambulances
*/

UPDATE ambulances
SET image_url = '/ambulances/basic-vijayawada.svg'
WHERE name = 'Basic Ambulance - Vijayawada'
  AND (image_url IS NULL OR image_url = '');

UPDATE ambulances
SET image_url = '/ambulances/icu-vijayawada.svg'
WHERE name = 'ICU Ambulance - Vijayawada'
  AND (image_url IS NULL OR image_url = '');

UPDATE ambulances
SET image_url = '/ambulances/basic-vizag.svg'
WHERE name = 'Basic Ambulance - Visakhapatnam'
  AND (image_url IS NULL OR image_url = '');

UPDATE ambulances
SET image_url = '/ambulances/icu-guntur.svg'
WHERE name = 'ICU Ambulance - Guntur'
  AND (image_url IS NULL OR image_url = '');
