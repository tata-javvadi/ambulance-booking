import { useState, useEffect, useMemo } from 'react';
import {
  MapPin,
  Navigation2,
  Phone,
  Loader2,
  AlertCircle,
  RefreshCw,
  Ambulance,
  Zap,
  ArrowRight,
  Shield,
  Clock3,
  Activity,
} from 'lucide-react';
import type { Location, RouteInfo, Ambulance as AmbulanceType, AmbulanceWithDistance } from '@/lib/types';
import { getRoute } from '@/lib/routing';
import { fetchAmbulances, sortAmbulancesByProximity } from '@/lib/ambulanceData';
import LocationSearch from '@/components/LocationSearch';
import RouteSummary from '@/components/RouteSummary';
import AmbulanceCard from '@/components/AmbulanceCard';

export default function App() {
  const [pickup, setPickup] = useState<Location | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);
  const [route, setRoute] = useState<RouteInfo | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState(false);
  const [selectedAmbulance, setSelectedAmbulance] = useState<string | null>(null);

  const [ambulances, setAmbulances] = useState<AmbulanceType[]>([]);
  const [ambulancesLoading, setAmbulancesLoading] = useState(true);
  const [ambulancesError, setAmbulancesError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setAmbulancesLoading(true);
    setAmbulancesError(false);

    fetchAmbulances()
      .then((data) => {
        if (cancelled) return;
        setAmbulances(data);
        setAmbulancesLoading(false);
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

  const sortedAmbulances: AmbulanceWithDistance[] = useMemo(() => {
    if (!pickup || ambulances.length === 0) return [];
    return sortAmbulancesByProximity(ambulances, pickup);
  }, [ambulances, pickup]);

  const bothSelected = pickup && destination;

  useEffect(() => {
    if (!bothSelected) {
      setRoute(null);
      setRouteError(false);
      setSelectedAmbulance(null);
      return;
    }

    let cancelled = false;
    setRouteLoading(true);
    setRouteError(false);
    setRoute(null);
    setSelectedAmbulance(null);

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

  const handleAmbulanceSelect = (amb: AmbulanceWithDistance) => {
    if (selectedAmbulance === amb.id) {
      window.location.href = `tel:${amb.phone}`;
    } else {
      setSelectedAmbulance(amb.id);
    }
  };

  const selectedAmb = sortedAmbulances.find((a) => a.id === selectedAmbulance);

  const stepsCompleted = {
    locations: !!bothSelected,
    route: !!route && !routeLoading,
    ambulance: !!selectedAmbulance,
  };

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-ink-200/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3.5 sm:px-6">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-flash-500 to-flash-700 text-white shadow-lg shadow-flash-300/50">
            <Ambulance className="h-6 w-6" />
            <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5">
              <span className="absolute h-full w-full animate-pulse-ring rounded-full bg-amber-400" />
              <span className="relative h-3.5 w-3.5 rounded-full bg-amber-400 ring-2 ring-white" />
            </span>
          </div>
          <div>
            <h1 className="font-display text-lg font-extrabold leading-none tracking-tight text-ink-900">
              Flash<span className="text-flash-500"> Ambulance</span>
            </h1>
            <p className="mt-0.5 text-xs font-medium text-ink-400">Andhra Pradesh Emergency Transport</p>
          </div>
          <div className="ml-auto hidden items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-2 sm:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-xs font-semibold text-emerald-700">Available 24/7</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 pb-12 pt-6 sm:px-6 sm:pt-8">
        {/* Hero / Intro */}
        {!bothSelected && (
          <section className="mb-6 animate-fade-in">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ink-900 via-ink-800 to-ink-900 p-6 sm:p-8">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-flash-500/10 blur-2xl" />
              <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-emerald-500/10 blur-2xl" />
              <div className="relative">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-sm">
                  <Zap className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-semibold text-white/90">Fastest ambulance dispatch in AP</span>
                </div>
                <h2 className="font-display text-2xl font-extrabold leading-tight text-white text-balance sm:text-3xl">
                  Book an ambulance in seconds.
                </h2>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-300">
                  Search pickup and destination, see real road distance and fare, then call the nearest available ambulance instantly.
                </p>
                <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-ink-300">
                    <Shield className="h-4 w-4 text-emerald-400" />
                    Verified ambulances
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-ink-300">
                    <Clock3 className="h-4 w-4 text-amber-400" />
                    Real-time route calc
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-ink-300">
                    <Activity className="h-4 w-4 text-flash-400" />
                    ICU & Basic available
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Step 1: Location Selection */}
        <section className={`rounded-3xl border bg-white p-5 shadow-sm transition-all sm:p-6 ${
          stepsCompleted.locations ? 'border-ink-200' : 'border-ink-200 shadow-md shadow-ink-200/30'
        }`}>
          <div className="mb-4 flex items-center gap-3">
            <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${
              stepsCompleted.locations ? 'bg-emerald-500 text-white' : 'bg-ink-900 text-white'
            }`}>
              {stepsCompleted.locations ? <Check /> : '1'}
            </span>
            <h2 className="font-display text-base font-bold text-ink-800">Select Pickup & Destination</h2>
          </div>

          <div className="space-y-3">
            <LocationSearch
              label="Pickup Location"
              placeholder="Search pickup in Andhra Pradesh..."
              icon={<MapPin className="h-4 w-4" />}
              selectedLocation={pickup}
              onSelect={setPickup}
              accentColor="emerald"
            />
            <LocationSearch
              label="Destination"
              placeholder="Search destination in Andhra Pradesh..."
              icon={<Navigation2 className="h-4 w-4" />}
              selectedLocation={destination}
              onSelect={setDestination}
              accentColor="rose"
            />
          </div>

          {bothSelected && (
            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-ink-900 px-4 py-3 text-sm text-white animate-fade-in">
              <MapPin className="h-4 w-4 shrink-0 text-emerald-400" />
              <span className="truncate font-medium">{pickup.shortName}</span>
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-ink-400" />
              <span className="truncate font-medium">{destination.shortName}</span>
            </div>
          )}
        </section>

        {/* Step 2: Route Info */}
        {bothSelected && (
          <section className="mt-4 rounded-3xl border border-ink-200 bg-white p-5 shadow-sm animate-slide-up sm:p-6">
            <div className="mb-4 flex items-center gap-3">
              <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                stepsCompleted.route ? 'bg-emerald-500 text-white' : 'bg-ink-900 text-white'
              }`}>
                {stepsCompleted.route ? <Check /> : '2'}
              </span>
              <h2 className="font-display text-base font-bold text-ink-800">Route Details</h2>
            </div>

            {routeLoading && (
              <div className="flex flex-col items-center justify-center py-10">
                <div className="relative">
                  <Loader2 className="h-10 w-10 animate-spin text-flash-500" />
                </div>
                <p className="mt-3 text-sm font-medium text-ink-500">Calculating road distance & travel time...</p>
              </div>
            )}

            {routeError && !routeLoading && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-flash-50">
                  <AlertCircle className="h-7 w-7 text-flash-500" />
                </div>
                <p className="mt-3 text-sm font-medium text-ink-600">Could not calculate the route between these locations.</p>
                <button
                  onClick={() => {
                    setPickup(null);
                    setDestination(null);
                  }}
                  className="mt-4 flex items-center gap-2 rounded-xl bg-ink-100 px-4 py-2 text-sm font-semibold text-ink-700 transition-colors hover:bg-ink-200"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reset locations
                </button>
              </div>
            )}

            {route && !routeLoading && <RouteSummary route={route} />}
          </section>
        )}

        {/* Step 3: Ambulance Selection */}
        {route && !routeLoading && (
          <section className="mt-4 animate-slide-up">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-900 text-sm font-bold text-white">
                3
              </span>
              <h2 className="font-display text-base font-bold text-ink-800">Choose Ambulance</h2>
              {sortedAmbulances.length > 0 && (
                <span className="ml-auto flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                  <Zap className="h-3 w-3 fill-amber-500 text-amber-500" />
                  Sorted by nearest
                </span>
              )}
            </div>

            {ambulancesLoading && (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-ink-200 bg-white py-10">
                <Loader2 className="h-10 w-10 animate-spin text-flash-500" />
                <p className="mt-3 text-sm font-medium text-ink-500">Loading available ambulances...</p>
              </div>
            )}

            {ambulancesError && !ambulancesLoading && (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-ink-200 bg-white py-8 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-flash-50">
                  <AlertCircle className="h-7 w-7 text-flash-500" />
                </div>
                <p className="mt-3 text-sm font-medium text-ink-600">Could not load ambulance listings.</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 flex items-center gap-2 rounded-xl bg-ink-100 px-4 py-2 text-sm font-semibold text-ink-700 transition-colors hover:bg-ink-200"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try again
                </button>
              </div>
            )}

            {!ambulancesLoading && !ambulancesError && sortedAmbulances.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-ink-200 bg-white py-8 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-50">
                  <AlertCircle className="h-7 w-7 text-ink-300" />
                </div>
                <p className="mt-3 text-sm font-medium text-ink-500">No ambulances are currently available.</p>
              </div>
            )}

            {!ambulancesLoading && !ambulancesError && sortedAmbulances.length > 0 && (
              <>
                <div className="mx-auto flex w-full max-w-md flex-col gap-4">
                  {sortedAmbulances.map((amb, idx) => (
                    <AmbulanceCard
                      key={amb.id}
                      ambulance={amb}
                      route={route}
                      isSelected={selectedAmbulance === amb.id}
                      onSelect={() => handleAmbulanceSelect(amb)}
                      rank={idx}
                    />
                  ))}
                </div>

                {selectedAmb && (
                  <div className="mt-5 overflow-hidden rounded-3xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 to-white p-6 text-center animate-slide-up">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 shadow-lg shadow-emerald-300/50">
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-sm font-medium text-ink-600">
                      Tap below to call and confirm your booking
                    </p>
                    <p className="mt-1 text-xs text-ink-400">
                      Selected: <span className="font-semibold text-ink-600">{selectedAmb.name}</span>
                    </p>
                    <a
                      href={`tel:${selectedAmb.phone}`}
                      className="mt-4 inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-emerald-300/40 transition-all hover:shadow-2xl hover:shadow-emerald-300/50 active:scale-[0.98]"
                    >
                      <Phone className="h-5 w-5" />
                      Call {selectedAmb.phone}
                    </a>
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {/* Footer */}
        <footer className="mt-10 border-t border-ink-200 pt-6 text-center">
          <div className="mb-2 flex items-center justify-center gap-2 text-ink-400">
            <Zap className="h-4 w-4 fill-flash-500 text-flash-500" />
            <span className="font-display text-sm font-bold text-ink-600">Flash Ambulance</span>
          </div>
          <p className="text-xs text-ink-400">
            Fares are estimates based on road distance. Final fare may vary with traffic and road conditions.
          </p>
        </footer>
      </main>
    </div>
  );
}

function Check() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
