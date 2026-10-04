import { Phone, Check, Loader2 } from 'lucide-react';
import type { AmbulanceType, RouteInfo } from '@/lib/types';
import { calculateFare } from '@/lib/routing';

interface AmbulanceCardProps {
  ambulance: AmbulanceType;
  route: RouteInfo;
  isSelected: boolean;
  onSelect: () => void;
}

export default function AmbulanceCard({ ambulance, route, isSelected, onSelect }: AmbulanceCardProps) {
  const fare = calculateFare(ambulance.baseFare, ambulance.perKm, route.distanceKm);

  const isIcu = ambulance.id === 'icu';

  return (
    <button
      onClick={onSelect}
      className={`group relative w-full overflow-hidden rounded-2xl border-2 p-5 text-left transition-all duration-300 ${
        isSelected
          ? isIcu
            ? 'border-rose-500 bg-rose-50/50 shadow-lg shadow-rose-200/40'
            : 'border-emerald-500 bg-emerald-50/50 shadow-lg shadow-emerald-200/40'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
      }`}
    >
      {isSelected && (
        <div
          className={`absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full ${
            isIcu ? 'bg-rose-500' : 'bg-emerald-500'
          }`}
        >
          <Check className="h-4 w-4 text-white" />
        </div>
      )}

      <div className="flex items-start gap-4">
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${
            isIcu ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
          }`}
        >
          <Loader2 className="h-7 w-7" />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold text-gray-800">{ambulance.name}</h3>
          <p className="mt-0.5 text-sm text-gray-500">{ambulance.description}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {ambulance.features.map((feature) => (
          <span
            key={feature}
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              isIcu ? 'bg-rose-100/70 text-rose-700' : 'bg-emerald-100/70 text-emerald-700'
            }`}
          >
            {feature}
          </span>
        ))}
      </div>

      <div className="mt-4 border-t border-gray-100 pt-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-gray-400">Base fare + per km</p>
            <p className="text-sm font-medium text-gray-600">
              ₹{ambulance.baseFare} + ₹{ambulance.perKm}/km
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Estimated total</p>
            <p className={`text-2xl font-extrabold ${isIcu ? 'text-rose-600' : 'text-emerald-600'}`}>
              ₹{fare.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>

      <div
        className={`mt-4 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all ${
          isSelected
            ? isIcu
              ? 'bg-rose-500 text-white shadow-md shadow-rose-300/50'
              : 'bg-emerald-500 text-white shadow-md shadow-emerald-300/50'
            : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
        }`}
      >
        <Phone className="h-4 w-4" />
        {isSelected ? 'Tap to call +91 98765 43210' : 'Select to book'}
      </div>
    </button>
  );
}
