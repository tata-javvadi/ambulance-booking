import type { Location, Ambulance, AmbulanceWithDistance } from './types';
import { supabase } from './supabase';
import { withAmbulanceImage } from './ambulanceImages';

export const FALLBACK_AMBULANCES: Omit<Ambulance, 'images'>[] = [
  {
    id: 'amb-1',
    name: 'Sai Ambulance Service',
    type: 'private',
    image_url: '/ambulances/basic-vijayawada.jpg',
    base_lat: 16.5062,
    base_lon: 80.648,
    base_address: 'MG Road, Vijayawada',
    base_fare: 450,
    per_km: 25,
    description: 'Private 24/7 patient transport service with air-conditioned comfort, oxygen support, and certified attendants.',
    features: ['Air Conditioned', 'Oxygen Support', 'Patient Stretcher', 'Trained Care Attendant', 'Clean & Sanitized'],
    phone: '+919876543210',
    is_available: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'amb-2',
    name: 'Life Ambulance',
    type: 'private',
    image_url: '/ambulances/icu-vijayawada.jpg',
    base_lat: 16.515,
    base_lon: 80.6321,
    base_address: 'Ring Road, Vijayawada',
    base_fare: 600,
    per_km: 30,
    description: 'Premium private patient transport for inter-hospital transfers, elderly care, and planned hospital visits.',
    features: ['Oxygen Support', 'Cardiac Monitor', 'Deluxe Stretcher Bed', 'Certified Paramedic', 'Smooth Suspension'],
    phone: '+919876543211',
    is_available: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'amb-3',
    name: 'Sai Ambulance Service - Vizag',
    type: 'private',
    image_url: '/ambulances/basic-vizag.jpg',
    base_lat: 17.6868,
    base_lon: 83.2185,
    base_address: 'Maharanipeta, Visakhapatnam',
    base_fare: 450,
    per_km: 25,
    description: 'Reliable private ambulance service for hospital discharge, clinic checkups, and scheduled patient shifts.',
    features: ['Oxygen Support', 'Wheelchair & Stretcher', 'First Aid Attendant', 'City & Outstation Trips'],
    phone: '+919876543212',
    is_available: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'amb-4',
    name: 'Sanjeevani Ambulance Service',
    type: 'private',
    image_url: '/ambulances/icu-guntur.jpg',
    base_lat: 16.3067,
    base_lon: 80.4365,
    base_address: 'Sambasiva Pet, Guntur',
    base_fare: 500,
    per_km: 28,
    description: 'Trusted private medical transit with bedside-to-bedside assistance and long-distance patient transfer capability.',
    features: ['Bed-to-Bed Transfer', 'Oxygen Support', 'Multi-para Monitor', 'AC Cabin', '24/7 On-Call Booking'],
    phone: '+919876543213',
    is_available: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'amb-5',
    name: 'Care Private Ambulance',
    type: 'private',
    image_url: '/ambulances/amr-ambulance.jpg',
    base_lat: 13.6288,
    base_lon: 79.4192,
    base_address: 'Alipiri Road, Tirupati',
    base_fare: 480,
    per_km: 26,
    description: 'Dedicated private patient mobility service for outstation medical travel and non-emergency appointments.',
    features: ['Foldable Wheelchair', 'Oxygen Cylinder', 'Experienced Driver', 'Family Seating'],
    phone: '+919876543214',
    is_available: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'amb-6',
    name: 'Suraksha Ambulance Service',
    type: 'private',
    image_url: '/ambulances/stockholm_ambulance.jpg',
    base_lat: 16.9891,
    base_lon: 82.2475,
    base_address: 'Main Road, Kakinada',
    base_fare: 460,
    per_km: 25,
    description: 'Private patient transport specializing in discharge transit, nursing home moves, and dialysis trips.',
    features: ['Hydraulic Stretcher', 'Oxygen Support', 'Clean Sanitized Van', 'Punctual Dispatch'],
    phone: '+919876543215',
    is_available: true,
    created_at: new Date().toISOString(),
  },
];

const LEGACY_NAME_MAP: Record<string, string> = {
  'Basic Ambulance - Vijayawada': 'Sai Ambulance Service',
  'ICU Ambulance - Vijayawada': 'Life Ambulance',
  'Basic Ambulance - Visakhapatnam': 'Sai Ambulance Service - Vizag',
  'ICU Ambulance - Guntur': 'Sanjeevani Ambulance Service',
};

function normalizePrivateAmbulance(amb: Ambulance): Ambulance {
  const newName = LEGACY_NAME_MAP[amb.name] || amb.name;
  return {
    ...amb,
    name: newName,
    type: 'private',
  };
}

export async function fetchAmbulances(): Promise<Ambulance[]> {
  try {
    const { data, error } = await supabase
      .from('ambulances')
      .select('*')
      .eq('is_available', true)
      .order('created_at', { ascending: true });

    if (error || !data || data.length === 0) {
      return (FALLBACK_AMBULANCES as Ambulance[]).map(withAmbulanceImage);
    }

    return (data as Ambulance[])
      .map(normalizePrivateAmbulance)
      .map(withAmbulanceImage);
  } catch {
    return (FALLBACK_AMBULANCES as Ambulance[]).map(withAmbulanceImage);
  }
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function sortAmbulancesByProximity(
  ambulances: Ambulance[],
  pickup: Location,
): AmbulanceWithDistance[] {
  return ambulances
    .map((amb) => ({
      ...amb,
      distanceToPickupKm: haversineKm(pickup.lat, pickup.lon, amb.base_lat, amb.base_lon),
    }))
    .sort((a, b) => a.distanceToPickupKm - b.distanceToPickupKm);
}
