import { Navigation, Clock, Route } from 'lucide-react';
import type { RouteInfo } from '@/lib/types';
import { formatDuration } from '@/lib/routing';

interface RouteSummaryProps {
  route: RouteInfo;
}

export default function RouteSummary({ route }: RouteSummaryProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <div className="rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 p-4 text-center">
        <Route className="mx-auto mb-1.5 h-5 w-5 text-blue-600" />
        <p className="text-2xl font-bold text-gray-800">{route.distanceKm.toFixed(1)}</p>
        <p className="text-xs font-medium text-gray-500">kilometers</p>
      </div>
      <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 p-4 text-center">
        <Clock className="mx-auto mb-1.5 h-5 w-5 text-amber-600" />
        <p className="text-2xl font-bold text-gray-800">{formatDuration(route.durationMin)}</p>
        <p className="text-xs font-medium text-gray-500">est. travel time</p>
      </div>
      <div className="col-span-2 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 p-4 text-center sm:col-span-1">
        <Navigation className="mx-auto mb-1.5 h-5 w-5 text-emerald-600" />
        <p className="text-2xl font-bold text-gray-800">Direct</p>
        <p className="text-xs font-medium text-gray-500">road route</p>
      </div>
    </div>
  );
}
