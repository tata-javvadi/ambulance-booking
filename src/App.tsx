import { useState, useEffect, useMemo } from 'react';
import {
  Ambulance,
  Phone,
  Loader2,
  AlertCircle,
  RefreshCw,
  Zap,
  ShieldCheck,
  Headphones,
} from 'lucide-react';
import type { Location, RouteInfo, Ambulance as AmbulanceType, AmbulanceWithDistance } from '@/lib/types';
import { getRoute } from '@/lib/routing';
import { fetchAmbulances, sortAmbulancesByProximity } from '@/lib/ambulanceData';
import ConnectedLocationSearch from '@/components/ConnectedLocationSearch';
import RouteSummary from '@/components/RouteSummary';
import AmbulanceCard from '@/components/AmbulanceCard';

export default function App() {
  const [pickup, setPickup] = useState<Location | null>({
    shortName: 'Bhimavaram',
    displayName: 'Bhimavaram, West Godavari, Andhra Pradesh',
    lat: 16.5408,
    lon: 81.5232,
  });

  const [destination, setDestination] = useState<Location | null>({
    shortName: 'Vijayawada',
    displayName: 'Vijayawada, Andhra Pradesh',
    lat: 16.5193,
    lon: 80.6305,
  });

  const [route, setRoute] = useState<RouteInfo | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState(false);
  const [selectedAmbulance, setSelectedAmbulance] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen bg-ink-950 font-sans text-ink-900 antialiased selection:bg-emerald-500 selection:text-white">
      {/* Mobile-first central wrapper */}
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-ink-50 shadow-2xl pb-6">
        
        {/* Top App Bar */}
        <header className="sticky top-0 z-30 border-b border-ink-200/80 bg-white/95 backdrop-blur-xl">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white shadow-md shadow-emerald-600/25">
                <Ambulance className="h-5 w-5" />
                <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
                  <span className="absolute h-full w-full animate-pulse-ring rounded-full bg-emerald-400" />
                  <span className="relative h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-white" />
                </span>
              </div>
              <div>
                <h1 className="font-display text-base font-black tracking-tight text-ink-900 leading-none">
                  Private<span className="text-emerald-600">Ambulance</span>
                </h1>
                <p className="mt-0.5 text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Private Patient Booking 24/7
                </p>
              </div>
            </div>

            {/* Quick 24/7 Booking Helpline */}
            <a
              href="tel:+919876543210"
              className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-bold text-emerald-700 shadow-sm transition-transform active:scale-95 hover:bg-emerald-100"
              title="Direct Private Ambulance Helpdesk"
            >
              <Headphones className="h-3.5 w-3.5 text-emerald-600" />
              <span>Helpdesk</span>
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
              <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
              <span className="text-xs font-bold text-ink-600">Calculating real road route & distance...</span>
            </div>
          )}

          {/* Route Error State */}
          {routeError && !routeLoading && (
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-center">
              <AlertCircle className="mx-auto h-6 w-6 text-amber-600" />
              <p className="mt-1.5 text-xs font-bold text-amber-900">
                Could not find road route between locations.
              </p>
              <button
                type="button"
                onClick={() => {
                  setPickup(null);
                  setDestination(null);
                }}
                className="mt-2.5 inline-flex items-center gap-1 rounded-xl bg-ink-900 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-ink-800"
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

          {/* Step 3: Choose Private Ambulance Feed */}
          {bothSelected && route && (
            <section className="space-y-3 pt-1">
              {/* Private Ambulance Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-sm font-extrabold text-ink-900">
                    Available Private Ambulances
                  </h2>
                  <p className="text-[11px] font-medium text-ink-500">
                    {sortedAmbulances.length} verified private services near pickup
                  </p>
                </div>

                <span className="flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-[10px] font-bold text-amber-700 shrink-0">
                  <Zap className="h-3 w-3 fill-amber-500 text-amber-500" />
                  Nearest First
                </span>
              </div>

              {/* Ambulances Feed */}
              {ambulancesLoading && (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-ink-200 bg-white py-12 shadow-sm">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                  <p className="mt-3 text-xs font-bold text-ink-500">Loading available private ambulances...</p>
                </div>
              )}

              {!ambulancesLoading && sortedAmbulances.length === 0 && (
                <div className="rounded-3xl border border-ink-200 bg-white p-8 text-center shadow-sm">
                  <AlertCircle className="mx-auto h-8 w-8 text-ink-300" />
                  <p className="mt-2 text-sm font-bold text-ink-700">No private ambulances available right now.</p>
                  <p className="mt-1 text-xs text-ink-400">Please check your pickup location or contact our helpdesk.</p>
                </div>
              )}

              {!ambulancesLoading && sortedAmbulances.length > 0 && (
                <div className="space-y-3.5">
                  {sortedAmbulances.map((amb, index) => (
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

          {/* Trust and Assurance Info */}
          <div className="rounded-3xl border border-ink-200/80 bg-white p-4 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-ink-800">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Verified Private Ambulance Network</span>
            </div>
            <p className="text-[11px] text-ink-500 leading-relaxed">
              All private ambulances offer verified attendants, patient stretcher, clean medical interior, oxygen support, and direct transparent per-km billing.
            </p>
          </div>
        </main>


      </div>
    </div>
  );
}
