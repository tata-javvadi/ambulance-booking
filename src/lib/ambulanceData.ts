import type { Location, Ambulance, AmbulanceWithDistance } from './types';
import { supabase } from './supabase';
import { withAmbulanceImage } from './ambulanceImages';

export async function fetchAmbulances(): Promise<Ambulance[]> {
  const { data, error } = await supabase
    .from('ambulances')
    .select('*')
    .eq('is_available', true)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return [];
  }

  return (data as Ambulance[]).map(withAmbulanceImage);
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
