import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Info, Pin } from 'lucide-react';

const SEVERITY_STYLES = {
  info: 'border-sky-200 dark:border-sky-500/25 bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300',
  success: 'border-emerald-200 dark:border-emerald-500/25 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  warning: 'border-amber-200 dark:border-amber-500/25 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300',
  critical: 'border-rose-200 dark:border-rose-500/25 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300',
};

function getTooltipPosition(rect, tooltipRect, preferredPlacement) {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const offset = 10;
  const padding = 12;

  const canPlaceTop = rect.top >= tooltipRect.height + offset + padding;
  const placeTop = preferredPlacement === 'top' 
    ? canPlaceTop 
    : !preferredPlacement || preferredPlacement === 'auto'
      ? canPlaceTop
      : false;

  const top = placeTop
    ? rect.top - tooltipRect.height - offset
    : Math.min(rect.bottom + offset, viewportHeight - tooltipRect.height - padding);

  const left = Math.min(
    Math.max(rect.left + rect.width / 2 - tooltipRect.width / 2, padding),
    viewportWidth - tooltipRect.width - padding
  );

  return {
    left,
    placement: placeTop ? 'top' : 'bottom',
    top: Math.max(padding, top),
    triggerCenter: rect.left + rect.width / 2,
  };
}

export default function InfoTooltip({
  title,
  description,
  examples = [],
  recommendation,
  severity = 'info',
  ariaLabel,
  className = '',
  iconClassName = '',
  tooltipClassName = '',
  iconSize = 13,
  placement = 'auto',
}) {
  const id = useId();
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const hoverTimeoutRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0, placement: 'top', triggerCenter: 0 });

  const normalizedExamples = Array.isArray(examples) ? examples.filter(Boolean) : examples ? [examples] : [];

  const closeTooltip = () => {
    setIsPinned(false);
    setIsOpen(false);
  };

  const openTooltip = () => {
    window.clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = window.setTimeout(() => setIsOpen(true), 120);
  };

  const scheduleClose = () => {
    if (isPinned) return;
    window.clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = window.setTimeout(() => setIsOpen(false), 100);
  };

  // Outside click listener for pinned tooltips
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (event) => {
      if (
        triggerRef.current && !triggerRef.current.contains(event.target) &&
        tooltipRef.current && !tooltipRef.current.contains(event.target)
      ) {
        closeTooltip();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  useLayoutEffect(() => {
    if (!isOpen || !triggerRef.current || !tooltipRef.current) return;

    const updatePosition = () => {
      const next = getTooltipPosition(
        triggerRef.current.getBoundingClientRect(),
        tooltipRef.current.getBoundingClientRect(),
        placement
      );
      setPosition(next);
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, placement]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeTooltip();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.clearTimeout(hoverTimeoutRef.current);
    };
  }, [isOpen]);

  const arrowOffset = Math.max(16, Math.min(position.triggerCenter - position.left, 330));

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={ariaLabel || `${title} information`}
        aria-describedby={isOpen ? id : undefined}
        aria-expanded={isOpen}
        className={`daet-info-trigger inline-flex h-5 w-5 items-center justify-center rounded-full border transition-all cursor-pointer outline-hidden ${
          isPinned
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shadow-2xs ring-2 ring-indigo-500/20'
            : 'border-slate-200 dark:border-slate-700/80 bg-white/90 dark:bg-slate-950/60 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500/30'
        } ${className}`}
        onMouseEnter={openTooltip}
        onMouseLeave={scheduleClose}
        onFocus={openTooltip}
        onBlur={scheduleClose}
        onClick={() => {
          setIsPinned((prev) => !prev);
          setIsOpen(true);
        }}
      >
        <Info size={iconSize} className={iconClassName} aria-hidden="true" />
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div
          ref={tooltipRef}
          id={id}
          role="tooltip"
          className={`daet-info-tooltip fixed z-[120] w-[min(23rem,calc(100vw-1.5rem))] rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white/95 dark:bg-slate-950/95 p-4 text-left text-slate-800 dark:text-slate-200 shadow-xl shadow-slate-900/10 dark:shadow-slate-950/50 backdrop-blur-md transition-all duration-150 animate-in fade-in zoom-in-95 ${
            position.placement === 'top' ? 'origin-bottom' : 'origin-top'
          } ${tooltipClassName}`}
          style={{
            left: `${position.left}px`,
            top: `${position.top}px`,
          }}
          onMouseEnter={openTooltip}
          onMouseLeave={scheduleClose}
        >
          {/* Subtle Pointer Arrow */}
          <div 
            className={`absolute w-2 h-2 rotate-45 border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-950 ${
              position.placement === 'top' 
                ? '-bottom-1.5 border-r border-b' 
                : '-top-1.5 border-l border-t'
            }`}
            style={{ left: `${arrowOffset}px` }}
          />

          <div className="space-y-2.5 relative z-10">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 dark:text-white font-mono tracking-tight">
                  {title}
                </p>
                {description && (
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300 font-medium">
                    {description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {isPinned && (
                  <span className="inline-flex items-center gap-0.5 text-[8px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 px-1 py-0.5 rounded">
                    <Pin size={8} /> Pinned
                  </span>
                )}
                <span className={`rounded-full border px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider ${SEVERITY_STYLES[severity] || SEVERITY_STYLES.info}`}>
                  {severity}
                </span>
              </div>
            </div>

            {/* Recommendation block */}
            {recommendation && (
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/70 p-2.5 text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">
                <span className="mr-1 font-bold font-mono text-[9px] uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-0.5">
                  Why It Matters:
                </span>
                {recommendation}
              </div>
            )}

            {/* Examples block */}
            {normalizedExamples.length > 0 && (
              <div className="space-y-1 pt-0.5">
                <p className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Example
                </p>
                {normalizedExamples.slice(0, 2).map((example, index) => (
                  <p key={`${title}-${index}`} className="text-[10px] font-mono leading-relaxed text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/40 px-2 py-1 rounded-md border border-slate-100 dark:border-slate-800/60">
                    {example}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
