import type { RouteInfo, Location } from './types';

const OSRM_URL = 'https://router.project-osrm.org/route/v1/driving';

export async function getRoute(pickup: Location, destination: Location): Promise<RouteInfo | null> {
  const coords = `${pickup.lon},${pickup.lat};${destination.lon},${destination.lat}`;
  const params = new URLSearchParams({
    overview: 'simplified',
    geometries: 'geojson',
  });

  try {
    const res = await fetch(`${OSRM_URL}/${coords}?${params.toString()}`);

    if (!res.ok) return null;

    const data = await res.json();

    if (!data.routes || data.routes.length === 0) return null;

    const route = data.routes[0];
    return {
      distanceKm: route.distance / 1000,
      durationMin: route.duration / 60,
    };
  } catch {
    return null;
  }
}

export function calculateFare(baseFare: number, perKm: number, distanceKm: number): number {
  return Math.round(baseFare + perKm * distanceKm);
}

export function formatDuration(min: number): string {
  const hrs = Math.floor(min / 60);
  const mins = Math.round(min % 60);
  if (hrs > 0) {
    return `${hrs}h ${mins}m`;
  }
  return `${mins} min`;
}
