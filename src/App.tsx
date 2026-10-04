import { useState, useEffect } from 'react';
import { MapPin, Navigation2, Phone, Loader2, AlertCircle, RefreshCw, Ambulance } from 'lucide-react';
import type { Location, RouteInfo } from '@/lib/types';
import { getRoute } from '@/lib/routing';
import { AMBULANCES, AMBULANCE_PHONE } from '@/lib/ambulance';
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

  const handleAmbulanceSelect = (id: string) => {
    if (selectedAmbulance === id) {
      window.location.href = `tel:${AMBULANCE_PHONE}`;
    } else {
      setSelectedAmbulance(id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4 sm:px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500 text-white shadow-md shadow-rose-200">
            <Ambulance className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800 leading-tight">Ambulance Booking</h1>
            <p className="text-xs text-gray-500">Andhra Pradesh Emergency Transport</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium text-emerald-700">Available 24/7</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Step 1: Location Selection */}
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">1</span>
            <h2 className="text-base font-bold text-gray-800">Select Pickup & Destination</h2>
          </div>

          <div className="space-y-4">
            <LocationSearch
              label="Pickup Location"
              placeholder="Search for pickup in Andhra Pradesh..."
              icon={<MapPin className="h-4 w-4" />}
              selectedLocation={pickup}
              onSelect={setPickup}
              accentColor="emerald"
            />
            <LocationSearch
              label="Destination"
              placeholder="Search for destination in Andhra Pradesh..."
              icon={<Navigation2 className="h-4 w-4" />}
              selectedLocation={destination}
              onSelect={setDestination}
              accentColor="rose"
            />
          </div>

          {bothSelected && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>
                From <strong>{pickup.shortName}</strong> to <strong>{destination.shortName}</strong>
              </span>
            </div>
          )}
        </section>

        {/* Step 2: Route Info */}
        {bothSelected && (
          <section className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">2</span>
              <h2 className="text-base font-bold text-gray-800">Route Details</h2>
            </div>

            {routeLoading && (
              <div className="flex flex-col items-center justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <p className="mt-3 text-sm text-gray-500">Calculating road distance & travel time...</p>
              </div>
            )}

            {routeError && !routeLoading && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertCircle className="h-8 w-8 text-rose-500" />
                <p className="mt-3 text-sm text-gray-600">Could not calculate the route between these locations.</p>
                <button
                  onClick={() => {
                    setPickup(null);
                    setDestination(null);
                  }}
                  className="mt-4 flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
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
          <section className="mt-5">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">3</span>
              <h2 className="text-base font-bold text-gray-800">Choose Ambulance Type</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {AMBULANCES.map((amb) => (
                <AmbulanceCard
                  key={amb.id}
                  ambulance={amb}
                  route={route}
                  isSelected={selectedAmbulance === amb.id}
                  onSelect={() => handleAmbulanceSelect(amb.id)}
                />
              ))}
            </div>

            {selectedAmbulance && (
              <div className="mt-5 flex flex-col items-center gap-3 rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 p-5 text-center">
                <p className="text-sm text-gray-600">
                  Tap the selected ambulance again or the button below to call and confirm your booking.
                </p>
                <a
                  href={`tel:${AMBULANCE_PHONE}`}
                  className="flex items-center gap-2.5 rounded-xl bg-emerald-500 px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-emerald-300/50 transition-all hover:bg-emerald-600 hover:shadow-xl active:scale-[0.98]"
                >
                  <Phone className="h-5 w-5" />
                  Call Now: +91 98765 43210
                </a>
              </div>
            )}
          </section>
        )}

        {/* Footer info */}
        <footer className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            Fares are estimates based on road distance. Final fare may vary based on traffic and road conditions.
          </p>
        </footer>
      </main>
    </div>
  );
}
