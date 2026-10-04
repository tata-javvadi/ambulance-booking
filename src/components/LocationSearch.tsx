import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Loader2, X } from 'lucide-react';
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
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const accentClasses = {
    emerald: {
      ring: 'focus-within:ring-emerald-500/40',
      border: selectedLocation ? 'border-emerald-500' : 'border-gray-200',
      iconBg: 'bg-emerald-100 text-emerald-600',
      dot: 'bg-emerald-500',
    },
    rose: {
      ring: 'focus-within:ring-rose-500/40',
      border: selectedLocation ? 'border-rose-500' : 'border-gray-200',
      iconBg: 'bg-rose-100 text-rose-600',
      dot: 'bg-rose-500',
    },
  }[accentColor];

  return (
    <div ref={containerRef} className="relative">
      <label className="mb-1.5 block text-sm font-semibold text-gray-700">{label}</label>
      <div
        className={`relative flex items-center rounded-xl border-2 bg-white px-3.5 py-3 transition-all focus-within:ring-4 ${accentClasses.border} ${accentClasses.ring}`}
      >
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${accentClasses.iconBg}`}>
          {icon}
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true);
          }}
          placeholder={placeholder}
          className="ml-3 w-full bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
        />
        {isLoading && <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin text-gray-400" />}
        {!isLoading && selectedLocation && (
          <button
            onClick={handleClear}
            className="ml-2 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Clear location"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-30 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white py-1.5 shadow-xl shadow-gray-200/60">
          {suggestions.map((s, i) => (
            <button
              key={`${s.lat}-${s.lon}-${i}`}
              onClick={() => handleSelect(s)}
              className="flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors hover:bg-gray-50"
            >
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-800">{s.shortName}</p>
                <p className="truncate text-xs text-gray-400">{s.displayName}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {showSuggestions && !isLoading && query.trim().length >= 3 && suggestions.length === 0 && (
        <div className="absolute z-30 mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500 shadow-lg">
          No locations found in Andhra Pradesh. Try a different search.
        </div>
      )}
    </div>
  );
}
