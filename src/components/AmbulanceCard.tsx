import { useEffect, useRef, useState } from 'react';
import {
  Phone,
  Check,
  MapPin,
  Ambulance as AmbulanceIcon,
  Zap,
  ShieldCheck,
  ChevronRight,
  Clock,
  Sparkles,
} from 'lucide-react';
import type { AmbulanceWithDistance, RouteInfo } from '@/lib/types';
import { calculateFare } from '@/lib/routing';

const AUTO_SCROLL_MS = 2500;
const RESUME_AFTER_INTERACTION_MS = 6000;
const DEFAULT_PHONE = '+919876543210';

interface AmbulanceCardProps {
  ambulance: AmbulanceWithDistance;
  route: RouteInfo;
  isSelected: boolean;
  onSelect: () => void;
  rank: number;
}

export default function AmbulanceCard({
  ambulance,
  route,
  isSelected,
  onSelect,
  rank,
}: AmbulanceCardProps) {
  const fare = calculateFare(ambulance.base_fare, ambulance.per_km, route.distanceKm);
  const images = ambulance.images?.length
    ? ambulance.images
    : ambulance.image_url
      ? [ambulance.image_url]
      : [];

  const [activeIndex, setActiveIndex] = useState(0);
  const [failedIndexes, setFailedIndexes] = useState<Set<number>>(new Set());
  const [paused, setPaused] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const activeIndexRef = useRef(0);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const visibleCount = images.filter((_, i) => !failedIndexes.has(i)).length;
  const hasGallery = images.length > 0 && visibleCount > 0;

  const handleScroll = () => {
    const el = scrollerRef.current;
    if (!el || el.clientWidth === 0) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    const next = Math.min(Math.max(index, 0), images.length - 1);
    activeIndexRef.current = next;
    setActiveIndex(next);
  };

  const goToSlide = (index: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const next = ((index % images.length) + images.length) % images.length;
    el.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' });
    activeIndexRef.current = next;
    setActiveIndex(next);
  };

  const pauseAutoScroll = () => {
    setPaused(true);
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => setPaused(false), RESUME_AFTER_INTERACTION_MS);
  };

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    if (images.length <= 1 || paused) return;

    const timer = setInterval(() => {
      goToSlide(activeIndexRef.current + 1);
    }, AUTO_SCROLL_MS);

    return () => clearInterval(timer);
  }, [images.length, paused]);

  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, []);

  return (
    <article
      onClick={onSelect}
      className={`group relative w-full cursor-pointer overflow-hidden rounded-3xl border-2 text-left transition-all duration-300 active:scale-[0.99] ${
        isSelected
          ? 'border-emerald-600 bg-white shadow-xl shadow-emerald-600/10 ring-4 ring-emerald-500/10'
          : 'border-ink-200/90 bg-white hover:border-ink-300 hover:shadow-md'
      }`}
    >
      {/* Visual Photo Carousel */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-ink-900">
        {hasGallery ? (
          <>
            <div
              ref={scrollerRef}
              onScroll={handleScroll}
              onPointerDown={pauseAutoScroll}
              onTouchStart={pauseAutoScroll}
              className="flex h-full w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain scrollbar-none"
              style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              aria-label={`${ambulance.name} photos`}
            >
              {images.map((src, index) => (
                <div key={`${src}-${index}`} className="relative h-full w-full shrink-0 snap-center">
                  {failedIndexes.has(index) ? (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-ink-900 text-ink-300">
                      <AmbulanceIcon className="h-10 w-10 text-emerald-400" />
                    </div>
                  ) : (
                    <img
                      src={src}
                      alt={`${ambulance.name} photo ${index + 1}`}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
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

            {/* Gradient vignette on photo */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/40" />

            {/* Top Floating Badges over Photo */}
            <div className="absolute inset-x-3 top-3 flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600/95 px-2.5 py-1 text-[11px] font-bold tracking-wide text-white backdrop-blur-md shadow-md">
                  <ShieldCheck className="h-3 w-3" />
                  PRIVATE AMBULANCE
                </span>

                {rank === 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/95 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white backdrop-blur-md shadow-md">
                    <Zap className="h-3 w-3 fill-white" />
                    Nearest
                  </span>
                )}
              </div>

              {/* Photo count / selected check */}
              <div className="flex items-center gap-1.5">
                {isSelected ? (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg">
                    <Check className="h-4 w-4" strokeWidth={3} />
                  </span>
                ) : (
                  images.length > 1 && (
                    <span className="rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white/90 backdrop-blur-md">
                      {activeIndex + 1}/{images.length}
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Bottom floating distance info over photo */}
            <div className="absolute inset-x-3 bottom-3 flex items-end justify-between pointer-events-none">
              <div className="flex items-center gap-1.5 rounded-xl bg-black/65 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-md">
                <MapPin className="h-3.5 w-3.5 text-amber-400" />
                <span>
                  {ambulance.distanceToPickupKm < 1
                    ? `${Math.round(ambulance.distanceToPickupKm * 1000)} m away`
                    : `${ambulance.distanceToPickupKm.toFixed(1)} km away`}
                </span>
              </div>

              {/* Dot navigation */}
              {images.length > 1 && (
                <div className="flex items-center gap-1 pointer-events-auto">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      aria-label={`Photo ${index + 1}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        pauseAutoScroll();
                        goToSlide(index);
                      }}
                      className={`h-1.5 rounded-full transition-all ${
                        activeIndex === index ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-ink-900 text-emerald-300">
            <AmbulanceIcon className="h-12 w-12 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider opacity-90">
              Private Ambulance Service
            </span>
          </div>
        )}
      </div>

      {/* Card Content & Pricing */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate font-display text-base font-extrabold text-ink-900">
                {ambulance.name}
              </h3>
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500" />
            </div>
            <p className="mt-0.5 truncate text-xs font-medium text-ink-500">
              {ambulance.base_address}
            </p>
          </div>
        </div>

        {/* Feature Tags */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {ambulance.features.slice(0, 3).map((feat) => (
            <span
              key={feat}
              className="rounded-lg bg-ink-100/90 px-2 py-1 text-[11px] font-semibold text-ink-700"
            >
              {feat}
            </span>
          ))}
          {ambulance.features.length > 3 && (
            <span className="rounded-lg bg-ink-100/90 px-2 py-1 text-[11px] font-semibold text-ink-500">
              +{ambulance.features.length - 3}
            </span>
          )}
        </div>

        {/* Fare and Action Row */}
        <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
              ₹{ambulance.base_fare} base + ₹{ambulance.per_km}/km
            </span>
            <p className="font-display text-2xl font-black tracking-tight text-emerald-700">
              ₹{fare.toLocaleString('en-IN')}
              <span className="ml-1 text-[11px] font-bold text-ink-400">total est.</span>
            </p>
          </div>

          <div
            className={`flex items-center gap-1.5 rounded-2xl px-4 py-2.5 text-xs font-extrabold transition-all shadow-sm ${
              isSelected
                ? 'bg-emerald-600 text-white shadow-emerald-500/25'
                : 'bg-ink-100 text-ink-800 hover:bg-ink-200'
            }`}
          >
            {isSelected ? (
              <>
                <Phone className="h-3.5 w-3.5" />
                <span>Selected</span>
              </>
            ) : (
              <>
                <span>Select</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </>
            )}
          </div>
        </div>

        {/* Call Button */}
        <a
          href={`tel:${ambulance.phone || DEFAULT_PHONE}`}
          onClick={(e) => e.stopPropagation()}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 py-3 text-sm font-black text-white shadow-md shadow-emerald-600/20 transition-transform active:scale-[0.98] hover:from-emerald-700 hover:to-emerald-800"
        >
          <Phone className="h-4 w-4" />
          <span>CALL & BOOK</span>
        </a>
      </div>
    </article>
  );
}
