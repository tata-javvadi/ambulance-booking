import { Clock, Route, ArrowRight } from 'lucide-react';
import type { RouteInfo } from '@/lib/types';
import { formatDuration } from '@/lib/routing';

interface RouteSummaryProps {
  route: RouteInfo;
}

export default function RouteSummary({ route }: RouteSummaryProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-ink-800 to-ink-900 p-5 text-white">
        <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/5" />
        <div className="relative">
          <div className="mb-2 flex items-center gap-1.5">
            <Route className="h-4 w-4 text-flash-400" />
            <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-300">Distance</span>
          </div>
          <p className="text-3xl font-extrabold font-display tracking-tight">
            {route.distanceKm.toFixed(1)}
            <span className="ml-1 text-base font-semibold text-ink-300">km</span>
          </p>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-flash-500 to-flash-700 p-5 text-white">
        <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10" />
        <div className="relative">
          <div className="mb-2 flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-white/80" />
            <span className="text-[11px] font-semibold uppercase tracking-wide text-white/80">Est. Time</span>
          </div>
          <p className="text-3xl font-extrabold font-display tracking-tight">
            {formatDuration(route.durationMin)}
          </p>
        </div>
      </div>
    </div>
  );
}
