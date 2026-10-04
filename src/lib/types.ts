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

export interface AmbulanceType {
  id: 'basic' | 'icu';
  name: string;
  baseFare: number;
  perKm: number;
  description: string;
  features: string[];
}
