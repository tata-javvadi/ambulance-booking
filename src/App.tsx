import { useState, useEffect, useMemo } from 'react';
import {
  Ambulance,
  Phone,
  Loader2,
  AlertCircle,
  RefreshCw,
  Zap,
  ShieldCheck,
  HeartPulse,
  Activity,
  SlidersHorizontal,
  ChevronRight,
  Flame,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import type { Location, RouteInfo, Ambulance as AmbulanceType, AmbulanceWithDistance } from '@/lib/types';
import { getRoute, calculateFare } from '@/lib/routing';
import { fetchAmbulances, sortAmbulancesByProximity } from '@/lib/ambulanceData';
import ConnectedLocationSearch from '@/components/ConnectedLocationSearch';
import RouteSummary from '@/components/RouteSummary';
import AmbulanceCard from '@/components/AmbulanceCard';

type FilterType = 'all' | 'icu' | 'basic';

export default function App() {
  const [pickup, setPickup] = useState<Location | null>({
    shortName: 'Visakhapatnam (KGH)',
    displayName: 'King George Hospital, Maharanipeta, Visakhapatnam, Andhra Pradesh',
    lat: 17.6868,
    lon: 83.2185,
  });
  const [destination, setDestination] = useState<Location | null>({
    shortName: 'Kakinada (GGH)',
    displayName: 'Government General Hospital, Main Road, Kakinada, Andhra Pradesh',
    lat: 16.9891,
    lon: 82.2475,
  });

  const [route, setRoute] = useState<RouteInfo | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState(false);
  const [selectedAmbulance, setSelectedAmbulance] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');

  const [ambulances, setAmbulances] = useState<AmbulanceType[]>([]);
  const [ambulancesLoading, setAmbulancesLoading] = useState(true);
  const [ambulancesError, setAmbulancesError] = useState(false);

  // Fetch ambulances on initial load
  useEffect(() => {
    let cancelled = false;
    setAmbulancesLoading(true);
    setAmbulancesError(false);

    fetchAmbulances()
      .then((data) => {
        if (cancelled) return;
        setAmbulances(data);
        setAmbulancesLoading(false);
        if (data.length > 0) {
          setSelectedAmbulance(data[0].id);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setAmbulancesError(true);
        setAmbulancesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Sort ambulances by proximity to pickup
  const sortedAmbulances: AmbulanceWithDistance[] = useMemo(() => {
    if (!pickup || ambulances.length === 0) return [];
    return sortAmbulancesByProximity(ambulances, pickup);
  }, [ambulances, pickup]);

  // Filter ambulances by type
  const filteredAmbulances = useMemo(() => {
    if (typeFilter === 'all') return sortedAmbulances;
    return sortedAmbulances.filter((amb) => amb.type === typeFilter);
  }, [sortedAmbulances, typeFilter]);

  const bothSelected = pickup && destination;

  // Calculate route whenever pickup or destination changes
  useEffect(() => {
    if (!bothSelected) {
      setRoute(null);
      setRouteError(false);
      return;
    }

    let cancelled = false;
    setRouteLoading(true);
    setRouteError(false);

    getRoute(pickup!, destination!).then((result) => {
      if (cancelled) return;
      setRouteLoading(false);
      if (result) {
        setRoute(result);
      } else {
        setRouteError(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [pickup, destination, bothSelected]);

  const handleSwap = () => {
    const temp = pickup;
    setPickup(destination);
    setDestination(temp);
  };

  const handleAmbulanceSelect = (amb: AmbulanceWithDistance) => {
    setSelectedAmbulance(amb.id);
  };

  const selectedAmb = sortedAmbulances.find((a) => a.id === selectedAmbulance) || sortedAmbulances[0];

  return (
    <div className="min-h-screen bg-ink-950 font-sans text-ink-900 antialiased selection:bg-flash-500 selection:text-white">
      {/* Mobile-first central wrapper */}
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-ink-50 shadow-2xl pb-28">
        
        {/* Top App Bar with SOS Hotline */}
        <header className="sticky top-0 z-30 border-b border-ink-200/80 bg-white/90 backdrop-blur-xl">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-flash-500 to-flash-700 text-white shadow-md shadow-flash-500/25">
                <Ambulance className="h-5 w-5" />
                <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
                  <span className="absolute h-full w-full animate-pulse-ring rounded-full bg-amber-400" />
                  <span className="relative h-3 w-3 rounded-full bg-amber-400 ring-2 ring-white" />
                </span>
              </div>
              <div>
                <h1 className="font-display text-base font-black tracking-tight text-ink-900 leading-none">
                  Flash<span className="text-flash-600">Ambulance</span>
                </h1>
                <p className="mt-0.5 text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  AP Emergency 24/7
                </p>
              </div>
            </div>

            {/* Direct National Emergency SOS 108 Button */}
            <a
              href="tel:108"
              className="flex items-center gap-1.5 rounded-full bg-flash-50 border border-flash-200 px-3 py-1.5 text-xs font-black text-flash-600 shadow-sm transition-transform active:scale-95"
            >
              <Flame className="h-3.5 w-3.5 fill-flash-500 text-flash-500" />
              <span>SOS 108</span>
            </a>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 px-4 pt-3.5 space-y-3.5">
          
          {/* Step 1: Connected Pickup & Dropoff Card */}
          <section>
            <ConnectedLocationSearch
              pickup={pickup}
              destination={destination}
              onSelectPickup={setPickup}
              onSelectDestination={setDestination}
              onSwap={handleSwap}
            />
          </section>

          {/* Route Loading State */}
          {routeLoading && (
            <div className="flex items-center justify-center gap-2.5 rounded-3xl border border-ink-200 bg-white p-4 shadow-sm animate-pulse">
              <Loader2 className="h-5 w-5 animate-spin text-flash-500" />
              <span className="text-xs font-bold text-ink-600">Calculating real road route & live traffic...</span>
            </div>
          )}

          {/* Route Error State */}
          {routeError && !routeLoading && (
            <div className="rounded-3xl border border-flash-200 bg-flash-50 p-4 text-center">
              <AlertCircle className="mx-auto h-6 w-6 text-flash-500" />
              <p className="mt-1.5 text-xs font-bold text-flash-800">
                Could not find road route between locations.
              </p>
              <button
                type="button"
                onClick={() => {
                  setPickup(null);
                  setDestination(null);
                }}
                className="mt-2.5 inline-flex items-center gap-1 rounded-xl bg-flash-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm"
              >
                <RefreshCw className="h-3 w-3" />
                Reset Locations
              </button>
            </div>
          )}

          {/* Step 2: Route Details HUD */}
          {route && !routeLoading && (
            <section>
              <RouteSummary route={route} />
            </section>
          )}

          {/* Step 3: Choose Ambulance Feed */}
          {bothSelected && route && (
            <section className="space-y-3 pt-1">
              {/* Category Filter Pills */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setTypeFilter('all')}
                    className={`rounded-full px-3 py-1.5 text-xs font-extrabold transition-all active:scale-95 ${
                      typeFilter === 'all'
                        ? 'bg-ink-900 text-white shadow-md'
                        : 'bg-white text-ink-600 border border-ink-200 hover:bg-ink-100'
                    }`}
                  >
                    All Units ({sortedAmbulances.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setTypeFilter('icu')}
                    className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-extrabold transition-all active:scale-95 ${
                      typeFilter === 'icu'
                        ? 'bg-flash-600 text-white shadow-md shadow-flash-500/20'
                        : 'bg-white text-flash-700 border border-flash-200 hover:bg-flash-50'
                    }`}
                  >
                    <HeartPulse className="h-3.5 w-3.5" />
                    ICU Units
                  </button>
                  <button
                    type="button"
                    onClick={() => setTypeFilter('basic')}
                    className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-extrabold transition-all active:scale-95 ${
                      typeFilter === 'basic'
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                        : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
                    }`}
                  >
                    <Activity className="h-3.5 w-3.5" />
                    Basic Units
                  </button>
                </div>

                <span className="flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-1 text-[10px] font-bold text-amber-700 shrink-0">
                  <Zap className="h-3 w-3 fill-amber-500 text-amber-500" />
                  Nearest First
                </span>
              </div>

              {/* Ambulances Feed */}
              {ambulancesLoading && (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-ink-200 bg-white py-12 shadow-sm">
                  <Loader2 className="h-8 w-8 animate-spin text-flash-500" />
                  <p className="mt-3 text-xs font-bold text-ink-500">Loading available emergency ambulances...</p>
                </div>
              )}

              {!ambulancesLoading && filteredAmbulances.length === 0 && (
                <div className="rounded-3xl border border-ink-200 bg-white p-8 text-center shadow-sm">
                  <AlertCircle className="mx-auto h-8 w-8 text-ink-300" />
                  <p className="mt-2 text-sm font-bold text-ink-700">No matching ambulances available right now.</p>
                  <p className="mt-1 text-xs text-ink-400">Try switching your category filter above.</p>
                </div>
              )}

              {!ambulancesLoading && filteredAmbulances.length > 0 && (
                <div className="space-y-3.5">
                  {filteredAmbulances.map((amb, index) => (
                    <AmbulanceCard
                      key={amb.id}
                      ambulance={amb}
                      route={route}
                      isSelected={selectedAmbulance === amb.id}
                      onSelect={() => handleAmbulanceSelect(amb)}
                      rank={index}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Quick Help & Trust Footer info */}
          <div className="rounded-3xl border border-ink-200/80 bg-white p-4 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-ink-800">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Verified Emergency Fleet</span>
            </div>
            <p className="text-[11px] text-ink-500 leading-relaxed">
              All ambulances are equipped with GPS tracking, oxygen support, verified drivers, and 24/7 direct doctor-assisted dispatch.
            </p>
          </div>
        </main>

        {/* Sticky Mobile Bottom Booking Bar */}
        {selectedAmb && route && (
          <div className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-md border-t border-ink-200/90 bg-white/95 p-3.5 shadow-2xl backdrop-blur-xl animate-slide-up">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="min-w-0 flex-1">
                <span className="block truncate text-xs font-extrabold text-ink-900">
                  {selectedAmb.name}
                </span>
                <span className="block text-[11px] font-semibold text-emerald-600">
                  {selectedAmb.distanceToPickupKm < 1
                    ? `${Math.round(selectedAmb.distanceToPickupKm * 1000)} m away`
                    : `${selectedAmb.distanceToPickupKm.toFixed(1)} km away • Ready`}
                </span>
              </div>

              <div className="text-right">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-ink-400">
                  Est. Fare
                </span>
                <span className={`font-display text-lg font-black ${
                  selectedAmb.type === 'icu' ? 'text-flash-600' : 'text-emerald-600'
                }`}>
                  ₹{calculateFare(selectedAmb.base_fare, selectedAmb.per_km, route.distanceKm).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <a
              href={`tel:${selectedAmb.phone}`}
              className={`flex w-full items-center justify-center gap-2.5 rounded-2xl py-3.5 text-base font-black text-white shadow-xl transition-transform active:scale-98 ${
                selectedAmb.type === 'icu'
                  ? 'bg-gradient-to-r from-flash-600 to-flash-700 shadow-flash-600/30'
                  : 'bg-gradient-to-r from-emerald-600 to-emerald-700 shadow-emerald-600/30'
              }`}
            >
              <Phone className="h-5 w-5 animate-bounce" />
              <span>CALL & DISPATCH ({selectedAmb.phone})</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
