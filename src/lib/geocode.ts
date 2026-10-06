import type { Location } from './types';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

const SETTLEMENT_TYPES = new Set([
  'city',
  'town',
  'village',
  'hamlet',
  'suburb',
  'neighbourhood',
  'municipality',
]);

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  class?: string;
  type?: string;
  importance?: number;
  address?: Record<string, string>;
}

function getLocality(addr: Record<string, string>): string | undefined {
  return addr.village || addr.town || addr.city || addr.suburb || addr.county;
}

function getLocalityParts(addr: Record<string, string>): string[] {
  return [
    getLocality(addr),
    addr.district || addr.state_district,
    addr.state,
  ].filter(Boolean) as string[];
}

function isSettlement(item: NominatimResult): boolean {
  return item.class === 'place' && SETTLEMENT_TYPES.has(item.type || '');
}

function scoreResult(item: NominatimResult, query: string): number {
  const q = query.toLowerCase();
  const addr = item.address || {};
  const locality = (getLocality(addr) || '').toLowerCase();
  const placeName = item.display_name.split(',')[0]?.trim().toLowerCase() || '';
  let score = (item.importance ?? 0) * 10;

  if (locality === q || locality.startsWith(q)) score += 100;
  else if (locality.includes(q)) score += 40;

  if (isSettlement(item)) score += 50;
  else if (item.class === 'place') score += 20;

  if (placeName === q || placeName.startsWith(q)) score += 30;
  // Avoid boosting weak mid-string hits like acronyms inside POI names
  else if (placeName.startsWith(q + ' ') || placeName.includes(' ' + q + ' ')) score += 10;

  return score;
}

function toLocation(item: NominatimResult): Location {
  const addr = item.address || {};
  const localityParts = getLocalityParts(addr);
  const placeLabel = item.display_name.split(',')[0]?.trim() || localityParts[0] || item.display_name;

  if (isSettlement(item)) {
    return {
      displayName: item.display_name,
      shortName: localityParts.slice(0, 3).join(', ') || placeLabel,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
    };
  }

  return {
    // Primary line = the matched place so POI/acronym hits are obvious
    shortName: placeLabel,
    displayName: localityParts.join(', ') || item.display_name,
    lat: parseFloat(item.lat),
    lon: parseFloat(item.lon),
  };
}

export async function searchLocations(query: string): Promise<Location[]> {
  if (query.trim().length < 3) return [];

  const normalizedQuery = query.trim();
  const params = new URLSearchParams({
    q: normalizedQuery,
    format: 'json',
    addressdetails: '1',
    // Fetch extra so city matches aren't crowded out by POIs before ranking
    limit: '20',
    countrycodes: 'in',
    viewbox: '76.0,12.0,85.0,20.0',
    bounded: '1',
  });

  try {
    const res = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
      headers: { 'Accept-Language': 'en' },
    });

    if (!res.ok) return [];

    const data: NominatimResult[] = await res.json();
    return data
      .filter((item) => {
        const state = item.address?.state || item.address?.['state_district'] || '';
        return state.toLowerCase().includes('andhra pradesh');
      })
      .sort((a, b) => scoreResult(b, normalizedQuery) - scoreResult(a, normalizedQuery))
      .slice(0, 8)
      .map(toLocation);
  } catch {
    return [];
  }
}
