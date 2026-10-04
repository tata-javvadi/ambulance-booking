import { Phone, Check, MapPin, Ambulance as AmbulanceIcon } from 'lucide-react';
import type { AmbulanceWithDistance, RouteInfo } from '@/lib/types';
import { calculateFare } from '@/lib/routing';

interface AmbulanceCardProps {
  ambulance: AmbulanceWithDistance;
  route: RouteInfo;
  isSelected: boolean;
  onSelect: () => void;
}

export default function AmbulanceCard({ ambulance, route, isSelected, onSelect }: AmbulanceCardProps) {
  const fare = calculateFare(ambulance.base_fare, ambulance.per_km, route.distanceKm);
  const isIcu = ambulance.type === 'icu';

  const accent = isIcu
    ? {
        border: isSelected ? 'border-rose-500' : 'border-gray-200',
        bg: isSelected ? 'bg-rose-50/50' : 'bg-white',
        shadow: isSelected ? 'shadow-lg shadow-rose-200/40' : 'hover:shadow-md',
        iconBg: 'bg-rose-100 text-rose-600',
        selectedBg: 'bg-rose-500',
        fareText: 'text-rose-600',
        btnSelected: 'bg-rose-500 text-white shadow-md shadow-rose-300/50',
        tagBg: 'bg-rose-100/70 text-rose-700',
      }
    : {
        border: isSelected ? 'border-emerald-500' : 'border-gray-200',
        bg: isSelected ? 'bg-emerald-50/50' : 'bg-white',
        shadow: isSelected ? 'shadow-lg shadow-emerald-200/40' : 'hover:shadow-md',
        iconBg: 'bg-emerald-100 text-emerald-600',
        selectedBg: 'bg-emerald-500',
        fareText: 'text-emerald-600',
        btnSelected: 'bg-emerald-500 text-white shadow-md shadow-emerald-300/50',
        tagBg: 'bg-emerald-100/70 text-emerald-700',
      };

  return (
    <button
      onClick={onSelect}
      className={`group relative w-full overflow-hidden rounded-2xl border-2 p-5 text-left transition-all duration-300 ${accent.border} ${accent.bg} ${accent.shadow}`}
    >
      {isSelected && (
        <div className={`absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full ${accent.selectedBg}`}>
          <Check className="h-4 w-4 text-white" />
        </div>
      )}

      <div className="flex items-start gap-4">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100">
          {ambulance.image_url ? (
            <img
              src={ambulance.image_url}
              alt={ambulance.name}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className={`flex h-full w-full items-center justify-center ${accent.iconBg}`}>
              <AmbulanceIcon className="h-8 w-8" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold text-gray-800">{ambulance.name}</h3>
          <p className="mt-0.5 text-sm text-gray-500">{ambulance.description}</p>
          <div className="mt-1.5 flex items-center gap-1 text-xs text-gray-400">
            <MapPin className="h-3.5 w-3.5" />
            <span>Based in {ambulance.base_address}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2">
        <span className="text-xs font-medium text-blue-700">
          {ambulance.distanceToPickupKm < 1
            ? `${Math.round(ambulance.distanceToPickupKm * 1000)} m from pickup`
            : `${ambulance.distanceToPickupKm.toFixed(1)} km from pickup`}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {ambulance.features.map((feature) => (
          <span
            key={feature}
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${accent.tagBg}`}
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
              ₹{ambulance.base_fare} + ₹{ambulance.per_km}/km
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Estimated total</p>
            <p className={`text-2xl font-extrabold ${accent.fareText}`}>
              ₹{fare.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>

      <div
        className={`mt-4 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all ${
          isSelected ? accent.btnSelected : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
        }`}
      >
        <Phone className="h-4 w-4" />
        {isSelected ? `Tap to call ${ambulance.phone}` : 'Select to book'}
      </div>
    </button>
  );
}
