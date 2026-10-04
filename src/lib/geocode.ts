import type { Location } from './types';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

export async function searchLocations(query: string): Promise<Location[]> {
  if (query.trim().length < 3) return [];

  const params = new URLSearchParams({
    q: query.trim(),
    format: 'json',
    addressdetails: '1',
    limit: '8',
    countrycodes: 'in',
    viewbox: '76.0,12.0,85.0,20.0',
    bounded: '1',
  });

  try {
    const res = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
      headers: { 'Accept-Language': 'en' },
    });

    if (!res.ok) return [];

    const data = await res.json();
    return data
      .filter((item: { display_name: string; lat: string; lon: string; address?: Record<string, string> }) => {
        const state = item.address?.state || item.address?.['state_district'] || '';
        return state.toLowerCase().includes('andhra pradesh');
      })
      .map((item: { display_name: string; lat: string; lon: string; address?: Record<string, string> }) => {
        const addr = item.address || {};
        const parts = [
          addr.village || addr.town || addr.city || addr.suburb || addr.county,
          addr.district || addr.state_district,
          addr.state,
        ].filter(Boolean);
        return {
          displayName: item.display_name,
          shortName: parts.slice(0, 3).join(', '),
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
        };
      });
  } catch {
    return [];
  }
}
