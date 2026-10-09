/*
# Create ambulances table (single-tenant, no auth)

## Purpose
Stores dynamic ambulance details — name, type, image URL, base location (lat/lon + address),
base fare, per-km rate, description, features, phone number, and availability — so the app
can display and sort ambulances by proximity to the user's pickup location without hardcoding.

## New Tables
1. `ambulances`
   - `id` (uuid, primary key)
   - `name` (text, not null) — display name, e.g. "Basic Ambulance"
   - `type` (text, not null) — "basic" | "icu"
   - `image_url` (text, nullable) — optional image link for the ambulance
   - `base_lat` (double precision, not null) — latitude of the ambulance's base/station
   - `base_lon` (double precision, not null) — longitude of the ambulance's base/station
   - `base_address` (text, not null) — human-readable base location name
   - `base_fare` (integer, not null) — flat base fare in INR
   - `per_km` (integer, not null) — fare per kilometer in INR
   - `description` (text, not null) — short description of the ambulance
   - `features` (text[], not null default '{}') — list of features as array of strings
   - `phone` (text, not null) — contact phone number for booking
   - `is_available` (boolean, not null default true) — whether the ambulance is currently available
   - `created_at` (timestamptz, default now())

## Security
- Enable RLS on `ambulances`.
- This is a single-tenant app with no sign-in screen, so all policies use `TO anon, authenticated`
  with `USING (true)` / `WITH CHECK (true)` because the data is intentionally public.
- SELECT: anyone can read ambulance listings.
- INSERT: anyone can add ambulance records (admin-style MVP, no auth).
- UPDATE: anyone can update ambulance records.
- DELETE: anyone can delete ambulance records.

## Seed Data
Inserts 4 sample ambulances across different cities in Andhra Pradesh:
  1. Basic Ambulance — Vijayawada (₹300 base + ₹20/km)
  2. ICU Ambulance — Vijayawada (₹500 base + ₹40/km)
  3. Basic Ambulance — Visakhapatnam (₹300 base + ₹20/km)
  4. ICU Ambulance — Guntur (₹500 base + ₹40/km)

## Important Notes
1. All four CRUD policies are separate (SELECT / INSERT / UPDATE / DELETE), never FOR ALL.
2. `features` uses PostgreSQL text[] so features can be stored as an array.
3. `base_lat` / `base_lon` enable haversine distance sorting in the frontend.
4. The phone number is stored per-ambulance so different ambulances can have different contacts.
*/

CREATE TABLE IF NOT EXISTS ambulances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL DEFAULT 'basic',
  image_url text,
  base_lat double precision NOT NULL,
  base_lon double precision NOT NULL,
  base_address text NOT NULL,
  base_fare integer NOT NULL,
  per_km integer NOT NULL,
  description text NOT NULL,
  features text[] NOT NULL DEFAULT '{}',
  phone text NOT NULL,
  is_available boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ambulances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_ambulances" ON ambulances;
CREATE POLICY "anon_select_ambulances"
ON ambulances FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_ambulances" ON ambulances;
CREATE POLICY "anon_insert_ambulances"
ON ambulances FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_ambulances" ON ambulances;
CREATE POLICY "anon_update_ambulances"
ON ambulances FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_ambulances" ON ambulances;
CREATE POLICY "anon_delete_ambulances"
ON ambulances FOR DELETE
TO anon, authenticated USING (true);

-- Seed data: 4 ambulances across Andhra Pradesh cities (local test images in /public/ambulances)
INSERT INTO ambulances (name, type, image_url, base_lat, base_lon, base_address, base_fare, per_km, description, features, phone, is_available) VALUES
(
  'Basic Ambulance - Vijayawada',
  'basic',
  '/ambulances/basic-vijayawada.svg',
  16.5062,
  80.6480,
  'Vijayawada, Andhra Pradesh',
  300,
  20,
  'For non-emergency patient transport with essential first-aid support',
  ARRAY['Trained driver', 'First-aid kit', 'Oxygen cylinder', 'Stretcher'],
  '+919876543210',
  true
),
(
  'ICU Ambulance - Vijayawada',
  'icu',
  '/ambulances/icu-vijayawada.svg',
  16.5062,
  80.6480,
  'Vijayawada, Andhra Pradesh',
  500,
  40,
  'Advanced life support with critical care equipment for emergencies',
  ARRAY['Cardiac monitor', 'Ventilator', 'Defibrillator', 'Emergency medicines', 'Trained paramedic'],
  '+919876543210',
  true
),
(
  'Basic Ambulance - Visakhapatnam',
  'basic',
  '/ambulances/basic-vizag.svg',
  17.6868,
  83.2185,
  'Visakhapatnam, Andhra Pradesh',
  300,
  20,
  'For non-emergency patient transport with essential first-aid support',
  ARRAY['Trained driver', 'First-aid kit', 'Oxygen cylinder', 'Stretcher'],
  '+919876543210',
  true
),
(
  'ICU Ambulance - Guntur',
  'icu',
  '/ambulances/icu-guntur.svg',
  16.3067,
  80.4365,
  'Guntur, Andhra Pradesh',
  500,
  40,
  'Advanced life support with critical care equipment for emergencies',
  ARRAY['Cardiac monitor', 'Ventilator', 'Defibrillator', 'Emergency medicines', 'Trained paramedic'],
  '+919876543210',
  true
)
ON CONFLICT DO NOTHING;
