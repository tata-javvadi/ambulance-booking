import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Loader2, X, Navigation2, Search } from 'lucide-react';
import type { Location } from '@/lib/types';
import { searchLocations } from '@/lib/geocode';

interface LocationSearchProps {
  label: string;
  placeholder: string;
  icon: React.ReactNode;
  selectedLocation: Location | null;
  onSelect: (location: Location | null) => void;
  accentColor: 'emerald' | 'rose';
}

export default function LocationSearch({
  label,
  placeholder,
  icon,
  selectedLocation,
  onSelect,
  accentColor,
}: LocationSearchProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedLocation) {
      setQuery(selectedLocation.shortName);
    } else {
      setQuery('');
    }
  }, [selectedLocation]);

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

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (selectedLocation) {
      onSelect(null);
    }
    setShowSuggestions(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      performSearch(value);
    }, 400);
  };

  const handleSelect = (location: Location) => {
    onSelect(location);
    setQuery(location.shortName);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleClear = () => {
    onSelect(null);
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const accentClasses = {
    emerald: {
      ring: 'focus-within:ring-emerald-500/20',
      border: selectedLocation ? 'border-emerald-500' : isFocused ? 'border-emerald-400' : 'border-ink-200',
      iconBg: selectedLocation ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-600',
      labelColor: 'text-emerald-700',
      dot: 'bg-emerald-500',
    },
    rose: {
      ring: 'focus-within:ring-flash-500/20',
      border: selectedLocation ? 'border-flash-500' : isFocused ? 'border-flash-400' : 'border-ink-200',
      iconBg: selectedLocation ? 'bg-flash-500 text-white' : 'bg-flash-50 text-flash-600',
      labelColor: 'text-flash-700',
      dot: 'bg-flash-500',
    },
  }[accentColor];

  return (
    <div ref={containerRef} className="relative">
      <div
        className={`relative flex items-center gap-3 rounded-2xl border-2 bg-white px-4 py-3.5 transition-all duration-200 ${accentClasses.border} ${isFocused ? `ring-4 ${accentClasses.ring}` : ''}`}
      >
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${accentClasses.iconBg}`}>
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <label className={`mb-0 block text-[11px] font-semibold uppercase tracking-wide ${selectedLocation ? accentClasses.labelColor : 'text-ink-400'}`}>
            {label}
          </label>
          <input
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => {
              setIsFocused(true);
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            placeholder={placeholder}
            className="w-full bg-transparent text-sm font-medium text-ink-800 placeholder:font-normal placeholder:text-ink-400 focus:outline-none"
          />
        </div>
        {isLoading && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-ink-400" />}
        {!isLoading && selectedLocation && (
          <button
            onClick={handleClear}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink-100 text-ink-400 transition-colors hover:bg-ink-200 hover:text-ink-600"
            aria-label="Clear location"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-30 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-ink-200 bg-white py-2 shadow-2xl shadow-ink-300/30 scrollbar-thin">
          {suggestions.map((s, i) => (
            <button
              key={`${s.lat}-${s.lon}-${i}`}
              onClick={() => handleSelect(s)}
              className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-ink-50"
            >
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-ink-100">
                <MapPin className="h-4 w-4 text-ink-400" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink-800">{s.shortName}</p>
                <p className="truncate text-xs text-ink-400">{s.displayName}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {showSuggestions && !isLoading && query.trim().length >= 3 && suggestions.length === 0 && (
        <div className="absolute z-30 mt-2 flex w-full items-center gap-2 rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-500 shadow-xl">
          <Search className="h-4 w-4 text-ink-300" />
          No locations found in Andhra Pradesh. Try a different search.
        </div>
      )}
    </div>
  );
}
