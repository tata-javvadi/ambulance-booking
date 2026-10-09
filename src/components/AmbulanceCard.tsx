import { useRef, useState } from 'react';
import { Phone, Check, MapPin, Ambulance as AmbulanceIcon, Zap, HeartPulse } from 'lucide-react';
import type { AmbulanceWithDistance, RouteInfo } from '@/lib/types';
import { calculateFare } from '@/lib/routing';

interface AmbulanceCardProps {
  ambulance: AmbulanceWithDistance;
  route: RouteInfo;
  isSelected: boolean;
  onSelect: () => void;
  rank: number;
}

export default function AmbulanceCard({ ambulance, route, isSelected, onSelect, rank }: AmbulanceCardProps) {
  const fare = calculateFare(ambulance.base_fare, ambulance.per_km, route.distanceKm);
  const isIcu = ambulance.type === 'icu';
  const images = ambulance.images?.length
    ? ambulance.images
    : ambulance.image_url
      ? [ambulance.image_url]
      : [];
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedIndexes, setFailedIndexes] = useState<Set<number>>(new Set());
  const scrollerRef = useRef<HTMLDivElement>(null);

  const visibleCount = images.filter((_, i) => !failedIndexes.has(i)).length;
  const hasGallery = images.length > 0 && visibleCount > 0;

  const handleScroll = () => {
    const el = scrollerRef.current;
    if (!el || el.clientWidth === 0) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setActiveIndex(Math.min(Math.max(index, 0), images.length - 1));
  };

  const goToSlide = (index: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth, behavior: 'smooth' });
    setActiveIndex(index);
  };

  return (
    <article
      className={`relative w-full overflow-hidden rounded-3xl border-2 text-left transition-all duration-300 animate-slide-up ${
        isSelected
          ? isIcu
            ? 'border-flash-500 bg-gradient-to-br from-flash-50/80 to-white shadow-xl shadow-flash-200/50'
            : 'border-emerald-500 bg-gradient-to-br from-emerald-50/80 to-white shadow-xl shadow-emerald-200/50'
          : 'border-ink-200 bg-white'
      }`}
    >
      {rank === 0 && (
        <div className="absolute left-3 top-0 z-10 flex items-center gap-1 rounded-b-lg bg-gradient-to-r from-amber-400 to-amber-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
          <Zap className="h-3 w-3 fill-white" />
          Nearest
        </div>
      )}

      {isSelected && (
        <div className={`absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full shadow-lg ${
          isIcu ? 'bg-flash-500 shadow-flash-300' : 'bg-emerald-500 shadow-emerald-300'
        }`}>
          <Check className="h-4 w-4 text-white" strokeWidth={3} />
        </div>
      )}

      {/* Horizontal image gallery — swipe on mobile */}
      <div className={`relative ${isIcu ? 'bg-flash-50' : 'bg-emerald-50'}`}>
        {hasGallery ? (
          <>
            <div
              ref={scrollerRef}
              onScroll={handleScroll}
              className="flex h-48 snap-x snap-mandatory overflow-x-auto overscroll-x-contain scrollbar-none"
              style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              aria-label={`${ambulance.name} photos`}
            >
              {images.map((src, index) => (
                <div
                  key={`${src}-${index}`}
                  className="relative h-48 w-full shrink-0 snap-center"
                >
                  {failedIndexes.has(index) ? (
                    <div className={`flex h-full w-full flex-col items-center justify-center gap-2 ${
                      isIcu ? 'text-flash-600' : 'text-emerald-600'
                    }`}>
                      {isIcu ? <HeartPulse className="h-10 w-10" /> : <AmbulanceIcon className="h-10 w-10" />}
                    </div>
                  ) : (
                    <img
                      src={src}
                      alt={`${ambulance.name} photo ${index + 1}`}
                      className="h-full w-full object-cover"
                      draggable={false}
                      onError={() =>
                        setFailedIndexes((prev) => {
                          const next = new Set(prev);
                          next.add(index);
                          return next;
                        })
                      }
                    />
                  )}
                </div>
              ))}
            </div>

            {images.length > 1 && (
              <div className="pointer-events-none absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5">
                {images.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    aria-label={`Show photo ${index + 1}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      goToSlide(index);
                    }}
                    className={`pointer-events-auto h-1.5 rounded-full transition-all ${
                      activeIndex === index
                        ? isIcu
                          ? 'w-5 bg-flash-500'
                          : 'w-5 bg-emerald-500'
                        : 'w-1.5 bg-white/80 shadow-sm'
                    }`}
                  />
                ))}
              </div>
            )}

            {images.length > 1 && (
              <div className={`absolute top-3 rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm ${
                isSelected ? 'left-3' : 'right-3'
              }`}>
                {activeIndex + 1}/{images.length}
              </div>
            )}
          </>
        ) : (
          <div className={`flex h-48 w-full flex-col items-center justify-center gap-2 ${
            isIcu ? 'text-flash-600' : 'text-emerald-600'
          }`}>
            {isIcu ? <HeartPulse className="h-12 w-12" /> : <AmbulanceIcon className="h-12 w-12" />}
            <span className="text-xs font-semibold uppercase tracking-wide opacity-70">
              {isIcu ? 'ICU unit' : 'Basic unit'}
            </span>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onSelect}
        className="w-full p-4 text-left active:bg-ink-50/60"
      >
        <div>
          <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
            isIcu ? 'bg-flash-100 text-flash-700' : 'bg-emerald-100 text-emerald-700'
          }`}>
            {isIcu ? 'ICU' : 'Basic'}
          </span>
          <h3 className="mt-1.5 text-base font-bold leading-tight text-ink-800 font-display">{ambulance.name}</h3>
          <div className="mt-1 flex items-center gap-1 text-xs text-ink-400">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{ambulance.base_address}</span>
          </div>
        </div>

        <div className="mb-3 mt-3">
          <div className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold ${
            rank === 0 ? 'bg-amber-50 text-amber-700' : 'bg-ink-50 text-ink-600'
          }`}>
            {rank === 0 && <Zap className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />}
            <span>
              {ambulance.distanceToPickupKm < 1
                ? `${Math.round(ambulance.distanceToPickupKm * 1000)} m from pickup`
                : `${ambulance.distanceToPickupKm.toFixed(1)} km from pickup`}
            </span>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-1.5">
          {ambulance.features.slice(0, 4).map((feature) => (
            <span
              key={feature}
              className="rounded-lg bg-ink-50 px-2.5 py-1 text-[11px] font-medium text-ink-600"
            >
              {feature}
            </span>
          ))}
          {ambulance.features.length > 4 && (
            <span className="rounded-lg bg-ink-50 px-2.5 py-1 text-[11px] font-medium text-ink-400">
              +{ambulance.features.length - 4} more
            </span>
          )}
        </div>

        <div className="border-t border-ink-100 pt-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-ink-400">Fare breakdown</p>
              <p className="mt-0.5 text-sm font-semibold text-ink-600">
                <span className="text-ink-800">₹{ambulance.base_fare}</span> base
                <span className="mx-1 text-ink-300">+</span>
                <span className="text-ink-800">₹{ambulance.per_km}</span>/km
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-medium uppercase tracking-wide text-ink-400">Est. total</p>
              <p className={`text-2xl font-extrabold font-display tracking-tight ${
                isIcu ? 'text-flash-600' : 'text-emerald-600'
              }`}>
                ₹{fare.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>

        <div
          className={`mt-4 flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all ${
            isSelected
              ? isIcu
                ? 'bg-flash-500 text-white shadow-lg shadow-flash-300/50'
                : 'bg-emerald-500 text-white shadow-lg shadow-emerald-300/50'
              : 'bg-ink-100 text-ink-600'
          }`}
        >
          <Phone className="h-4 w-4" />
          {isSelected ? `Call ${ambulance.phone}` : 'Select to book'}
        </div>
      </button>
    </article>
  );
}
