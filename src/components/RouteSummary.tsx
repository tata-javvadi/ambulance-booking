import { Clock, Route, Zap, Navigation, ShieldCheck } from 'lucide-react';
import type { RouteInfo } from '@/lib/types';
import { formatDuration } from '@/lib/routing';

interface RouteSummaryProps {
  route: RouteInfo;
}

export default function RouteSummary({ route }: RouteSummaryProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-ink-200/80 bg-gradient-to-br from-ink-900 via-ink-800 to-ink-950 p-4 text-white shadow-lg shadow-ink-900/10 animate-fade-in">
      {/* Route meta bar */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
            Fastest Route Calculated
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-medium text-ink-300">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Real Road Distance</span>
        </div>
      </div>

      {/* Primary stats */}
      <div className="mt-3.5 grid grid-cols-2 gap-3">
        {/* Distance Card */}
        <div className="rounded-2xl bg-white/5 p-3 backdrop-blur-sm">
          <div className="flex items-center gap-1.5 text-ink-400">
            <Route className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Distance</span>
          </div>
          <p className="mt-1 font-display text-2xl font-black tracking-tight text-white sm:text-3xl">
            {route.distanceKm.toFixed(1)}
            <span className="ml-1 text-xs font-semibold text-ink-300">km</span>
          </p>
        </div>

        {/* Estimated Duration Card */}
        <div className="rounded-2xl bg-gradient-to-br from-emerald-600/30 to-emerald-700/20 border border-emerald-500/20 p-3 backdrop-blur-sm">
          <div className="flex items-center gap-1.5 text-emerald-300">
            <Clock className="h-3.5 w-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Est. Travel Time</span>
          </div>
          <p className="mt-1 font-display text-2xl font-black tracking-tight text-white sm:text-3xl">
            {formatDuration(route.durationMin)}
          </p>
        </div>
      </div>
    </div>
  );
}
