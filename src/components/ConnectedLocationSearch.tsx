import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Navigation2, Loader2, X, ArrowUpDown, Search, Building2, Sparkles } from 'lucide-react';
import type { Location } from '@/lib/types';
import { searchLocations } from '@/lib/geocode';

interface ConnectedLocationSearchProps {
  pickup: Location | null;
  destination: Location | null;
  onSelectPickup: (loc: Location | null) => void;
  onSelectDestination: (loc: Location | null) => void;
  onSwap: () => void;
}

const QUICK_PRESETS: { name: string; full: string; lat: number; lon: number }[] = [
  { name: 'Vijayawada GGH', full: 'Government General Hospital, MG Road, Vijayawada', lat: 16.5062, lon: 80.6480 },
  { name: 'Vizag KGH', full: 'King George Hospital, Maharanipeta, Visakhapatnam', lat: 17.6868, lon: 83.2185 },
  { name: 'Guntur GGH', full: 'Government General Hospital, Sambasiva Pet, Guntur', lat: 16.3067, lon: 80.4365 },
  { name: 'Tirupati SVIMS', full: 'SVIMS Hospital, Alipiri Road, Tirupati', lat: 13.6288, lon: 79.4192 },
];

export default function ConnectedLocationSearch({
  pickup,
  destination,
  onSelectPickup,
  onSelectDestination,
  onSwap,
}: ConnectedLocationSearchProps) {
  const [activeField, setActiveField] = useState<'pickup' | 'destination' | null>(null);
  const [pickupQuery, setPickupQuery] = useState('');
  const [destQuery, setDestQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setPickupQuery(pickup ? pickup.shortName : '');
  }, [pickup]);

  useEffect(() => {
    setDestQuery(destination ? destination.shortName : '');
  }, [destination]);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 3) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const results = await searchLocations(searchQuery);
    setSuggestions(results);
    setIsLoading(false);
  }, []);

  const handleQueryChange = (field: 'pickup' | 'destination', value: string) => {
    if (field === 'pickup') {
      setPickupQuery(value);
      if (pickup) onSelectPickup(null);
    } else {
      setDestQuery(value);
      if (destination) onSelectDestination(null);
    }
    setActiveField(field);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      performSearch(value);
    }, 350);
  };

  const handleSelect = (location: Location) => {
    if (activeField === 'pickup') {
      onSelectPickup(location);
      setPickupQuery(location.shortName);
    } else if (activeField === 'destination') {
      onSelectDestination(location);
      setDestQuery(location.shortName);
    }
    setActiveField(null);
    setSuggestions([]);
  };

  const handlePresetSelect = (preset: typeof QUICK_PRESETS[0]) => {
    const loc: Location = {
      shortName: preset.name,
      displayName: preset.full,
      lat: preset.lat,
      lon: preset.lon,
    };
    if (!pickup) {
      onSelectPickup(loc);
      setPickupQuery(loc.shortName);
    } else if (!destination) {
      onSelectDestination(loc);
      setDestQuery(loc.shortName);
    } else {
      onSelectDestination(loc);
      setDestQuery(loc.shortName);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveField(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative overflow-hidden rounded-3xl border border-ink-200/80 bg-white p-3.5 shadow-sm sm:p-4">
        {/* Connected route card layout */}
        <div className="relative flex items-center gap-3">
          {/* Timeline dots and connector */}
          <div className="flex flex-col items-center py-2 self-stretch justify-between">
            <span className="relative flex h-3.5 w-3.5 items-center justify-center">
              <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
            </span>
            <div className="my-1 w-[2px] flex-1 bg-gradient-to-b from-emerald-400 via-ink-200 to-flash-400" />
            <span className="flex h-3.5 w-3.5 items-center justify-center">
              <span className="h-2.5 w-2.5 rounded-full bg-flash-500 ring-2 ring-flash-100" />
            </span>
          </div>

          {/* Input fields */}
          <div className="min-w-0 flex-1 space-y-2">
            {/* Pickup row */}
            <div className="relative flex items-center rounded-2xl bg-ink-50/80 px-3 py-2 transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/30">
              <div className="min-w-0 flex-1">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                  Pickup Location
                </span>
                <input
                  type="text"
                  value={pickupQuery}
                  onChange={(e) => handleQueryChange('pickup', e.target.value)}
                  onFocus={() => {
                    setActiveField('pickup');
                    if (pickupQuery.length >= 3) performSearch(pickupQuery);
                  }}
                  placeholder="Enter pickup address in AP..."
                  className="w-full bg-transparent text-sm font-semibold text-ink-900 placeholder:font-normal placeholder:text-ink-400 focus:outline-none"
                />
              </div>
              {activeField === 'pickup' && isLoading && (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-ink-400" />
              )}
              {pickup && (
                <button
                  type="button"
                  onClick={() => {
                    onSelectPickup(null);
                    setPickupQuery('');
                  }}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-ink-400 hover:bg-ink-200 hover:text-ink-700"
                  aria-label="Clear pickup"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Destination row */}
            <div className="relative flex items-center rounded-2xl bg-ink-50/80 px-3 py-2 transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-flash-500/30">
              <div className="min-w-0 flex-1">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-flash-600">
                  Emergency Destination
                </span>
                <input
                  type="text"
                  value={destQuery}
                  onChange={(e) => handleQueryChange('destination', e.target.value)}
                  onFocus={() => {
                    setActiveField('destination');
                    if (destQuery.length >= 3) performSearch(destQuery);
                  }}
                  placeholder="Search hospital or drop location..."
                  className="w-full bg-transparent text-sm font-semibold text-ink-900 placeholder:font-normal placeholder:text-ink-400 focus:outline-none"
                />
              </div>
              {activeField === 'destination' && isLoading && (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-ink-400" />
              )}
              {destination && (
                <button
                  type="button"
                  onClick={() => {
                    onSelectDestination(null);
                    setDestQuery('');
                  }}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-ink-400 hover:bg-ink-200 hover:text-ink-700"
                  aria-label="Clear destination"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Swap button */}
          <button
            type="button"
            onClick={onSwap}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-ink-200 bg-ink-50 text-ink-600 shadow-sm transition-all hover:bg-ink-100 hover:text-ink-900 active:scale-95"
            title="Swap pickup and destination"
            aria-label="Swap locations"
          >
            <ArrowUpDown className="h-4 w-4" />
          </button>
        </div>

        {/* Quick Hospital Presets */}
        <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-0.5 pt-1 scrollbar-none">
          <span className="flex items-center gap-1 text-[11px] font-bold text-ink-400 shrink-0 mr-1">
            <Building2 className="h-3 w-3 text-flash-500" />
            Popular:
          </span>
          {QUICK_PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => handlePresetSelect(p)}
              className="shrink-0 rounded-full border border-ink-200/90 bg-white px-2.5 py-1 text-[11px] font-medium text-ink-700 transition-all hover:border-flash-300 hover:bg-flash-50/50 hover:text-flash-700 active:scale-95"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Floating Suggestions dropdown */}
      {activeField && suggestions.length > 0 && (
        <div className="absolute inset-x-0 top-full z-40 mt-2 max-h-72 overflow-y-auto rounded-3xl border border-ink-200 bg-white py-2 shadow-2xl shadow-ink-900/10 scrollbar-thin animate-slide-up">
          <div className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-ink-400">
            Suggested Andhra Pradesh locations
          </div>
          {suggestions.map((s, i) => (
            <button
              key={`${s.lat}-${s.lon}-${i}`}
              type="button"
              onClick={() => handleSelect(s)}
              className="flex w-full items-start gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-ink-50 active:bg-ink-100"
            >
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-ink-100 text-ink-600">
                <MapPin className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-ink-900">{s.shortName}</p>
                <p className="truncate text-[11px] text-ink-500">{s.displayName}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Empty Search indicator */}
      {activeField && !isLoading && (activeField === 'pickup' ? pickupQuery : destQuery).trim().length >= 3 && suggestions.length === 0 && (
        <div className="absolute inset-x-0 top-full z-40 mt-2 flex items-center gap-2 rounded-2xl border border-ink-200 bg-white px-4 py-3 text-xs text-ink-500 shadow-xl">
          <Search className="h-4 w-4 text-ink-300 shrink-0" />
          <span>No exact address match found in Andhra Pradesh. Try searching a major city or hospital.</span>
        </div>
      )}
    </div>
  );
}
