/*
# Convert to Private Ambulances Booking

## Purpose
Update the ambulances table data to private ambulance service providers:
- Replaces generic/emergency categories with private service names like
  "Sai Ambulance Service", "Life Ambulance", "Sanjeevani Ambulance Service".
- Sets type to 'private'.
- Focuses service features on patient transport, stretcher care, oxygen, and transfers.
- Removes 108 emergency assumptions.
*/

UPDATE ambulances
SET
  name = 'Sai Ambulance Service',
  type = 'private',
  image_url = '/ambulances/basic-vijayawada.jpg',
  base_address = 'MG Road, Vijayawada',
  base_fare = 450,
  per_km = 25,
  description = 'Private 24/7 patient transport service with air-conditioned comfort, oxygen support, and certified attendants.',
  features = ARRAY['Air Conditioned', 'Oxygen Support', 'Patient Stretcher', 'Trained Care Attendant', 'Clean & Sanitized']
WHERE name LIKE '%Vijayawada%' AND (name LIKE '%Basic%' OR name = 'Sai Ambulance Service');

UPDATE ambulances
SET
  name = 'Life Ambulance',
  type = 'private',
  image_url = '/ambulances/icu-vijayawada.jpg',
  base_address = 'Ring Road, Vijayawada',
  base_fare = 600,
  per_km = 30,
  description = 'Premium private patient transport for inter-hospital transfers, elderly care, and planned hospital visits.',
  features = ARRAY['Oxygen Support', 'Cardiac Monitor', 'Deluxe Stretcher Bed', 'Certified Paramedic', 'Smooth Suspension']
WHERE name LIKE '%Vijayawada%' AND (name LIKE '%ICU%' OR name = 'Life Ambulance');

UPDATE ambulances
SET
  name = 'Sai Ambulance Service - Vizag',
  type = 'private',
  image_url = '/ambulances/basic-vizag.jpg',
  base_address = 'Maharanipeta, Visakhapatnam',
  base_fare = 450,
  per_km = 25,
  description = 'Reliable private ambulance service for hospital discharge, clinic checkups, and non-emergency patient shifts.',
  features = ARRAY['Oxygen Support', 'Wheelchair & Stretcher', 'First Aid Attendant', 'City & Outstation Trips']
WHERE name LIKE '%Visakhapatnam%' OR name = 'Sai Ambulance Service - Vizag';

UPDATE ambulances
SET
  name = 'Sanjeevani Ambulance Service',
  type = 'private',
  image_url = '/ambulances/icu-guntur.jpg',
  base_address = 'Sambasiva Pet, Guntur',
  base_fare = 500,
  per_km = 28,
  description = 'Trusted private medical transit with bedside-to-bedside assistance and long-distance patient transfer capability.',
  features = ARRAY['Bed-to-Bed Transfer', 'Oxygen Support', 'Multi-para Monitor', 'AC Cabin', '24/7 On-Call Booking']
WHERE name LIKE '%Guntur%' OR name = 'Sanjeevani Ambulance Service';
