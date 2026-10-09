import type { Location, Ambulance, AmbulanceWithDistance } from './types';
import { supabase } from './supabase';
import { withAmbulanceImage } from './ambulanceImages';

export const FALLBACK_AMBULANCES: Omit<Ambulance, 'images'>[] = [
  {
    id: 'amb-1',
    name: 'Basic Ambulance - Vijayawada',
    type: 'basic',
    image_url: '/ambulances/basic-vijayawada.jpg',
    base_lat: 16.5062,
    base_lon: 80.648,
    base_address: 'Old Government Hospital, MG Road, Vijayawada',
    base_fare: 500,
    per_km: 25,
    description: 'Equipped with first aid kit, oxygen cylinder, stretcher, and trained EMT driver.',
    features: ['Oxygen Support', 'First Aid Kit', 'Wheelchair / Stretcher', 'Trained Paramedic Driver'],
    phone: '+919876543210',
    is_available: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'amb-2',
    name: 'ICU Ambulance - Vijayawada',
    type: 'icu',
    image_url: '/ambulances/icu-vijayawada.jpg',
    base_lat: 16.515,
    base_lon: 80.6321,
    base_address: 'Ramesh Hospitals, Ring Road, Vijayawada',
    base_fare: 1500,
    per_km: 45,
    description: 'Advanced Cardiac & Critical Life Support (ACLS) unit with ICU ventilator and defibrillator.',
    features: ['ICU Ventilator', 'Cardiac Monitor', 'Defibrillator', 'Emergency Doctor / Paramedic', 'Infusion Pump'],
    phone: '+919876543211',
    is_available: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'amb-3',
    name: 'Basic Ambulance - Visakhapatnam',
    type: 'basic',
    image_url: '/ambulances/basic-vizag.jpg',
    base_lat: 17.6868,
    base_lon: 83.2185,
    base_address: 'King George Hospital (KGH), Maharanipeta, Visakhapatnam',
    base_fare: 550,
    per_km: 26,
    description: 'Standard emergency ambulance with oxygen and vital support equipment.',
    features: ['Oxygen Support', 'Stretcher Bed', 'Emergency First Aid', '24/7 Rapid Dispatch'],
    phone: '+919876543212',
    is_available: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'amb-4',
    name: 'ICU Ambulance - Guntur',
    type: 'icu',
    image_url: '/ambulances/icu-guntur.jpg',
    base_lat: 16.3067,
    base_lon: 80.4365,
    base_address: 'Government General Hospital (GGH), Sambasiva Pet, Guntur',
    base_fare: 1400,
    per_km: 42,
    description: 'Comprehensive Mobile ICU with oxygen manifold, multi-para patient monitor, and critical care staff.',
    features: ['Advanced Ventilator', 'Multi-para Monitor', 'Suction Machine', 'Emergency Resuscitation Kit', 'Critical Care Staff'],
    phone: '+919876543213',
    is_available: true,
    created_at: new Date().toISOString(),
  },
];

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

    return (data as Ambulance[]).map(withAmbulanceImage);
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
