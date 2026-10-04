export interface Location {
  displayName: string;
  lat: number;
  lon: number;
  shortName: string;
}

export interface RouteInfo {
  distanceKm: number;
  durationMin: number;
}

export interface Ambulance {
  id: string;
  name: string;
  type: 'basic' | 'icu';
  image_url: string | null;
  base_lat: number;
  base_lon: number;
  base_address: string;
  base_fare: number;
  per_km: number;
  description: string;
  features: string[];
  phone: string;
  is_available: boolean;
  created_at: string;
}

export interface AmbulanceWithDistance extends Ambulance {
  distanceToPickupKm: number;
}
