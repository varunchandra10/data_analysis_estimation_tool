import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Info } from 'lucide-react';

const SEVERITY_STYLES = {
  info: 'border-sky-500/25 bg-sky-500/10 text-sky-300',
  success: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300',
  warning: 'border-amber-500/25 bg-amber-500/10 text-amber-300',
  critical: 'border-rose-500/25 bg-rose-500/10 text-rose-300',
};

function getTooltipPosition(rect, tooltipRect, preferredPlacement) {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const offset = 12;
  const padding = 12;
  const canPlaceTop = rect.top >= tooltipRect.height + offset + padding;
  const placeTop = preferredPlacement === 'top' ? canPlaceTop : !preferredPlacement || preferredPlacement === 'auto'
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
  iconSize = 14,
  placement = 'auto',
}) {
  const id = useId();
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const hoverTimeoutRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0, placement: 'top' });

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
    hoverTimeoutRef.current = window.setTimeout(() => setIsOpen(false), 80);
  };

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

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={ariaLabel || `${title} information`}
        aria-describedby={isOpen ? id : undefined}
        aria-expanded={isOpen}
        className={`daet-info-trigger inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-700/80 bg-slate-950/60 text-slate-500 outline-none hover:border-slate-600 hover:text-slate-200 focus-visible:border-blue-500 focus-visible:text-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500/30 ${className}`}
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
          className={`daet-info-tooltip fixed z-[120] w-[min(22rem,calc(100vw-1.5rem))] rounded-2xl border border-slate-700/80 bg-slate-950/88 p-3.5 text-left text-slate-200 shadow-2xl shadow-slate-950/45 backdrop-blur-md transition-all duration-150 ${position.placement === 'top' ? 'origin-bottom' : 'origin-top'} ${tooltipClassName}`}
          style={{
            left: `${position.left}px`,
            top: `${position.top}px`,
          }}
          onMouseEnter={openTooltip}
          onMouseLeave={scheduleClose}
        >
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-white">{title}</p>
                {description && <p className="mt-1 text-[11px] leading-relaxed text-slate-300">{description}</p>}
              </div>
              <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] ${SEVERITY_STYLES[severity] || SEVERITY_STYLES.info}`}>
                {severity}
              </span>
            </div>

            {recommendation && (
              <div className="rounded-xl border border-slate-700/70 bg-slate-900/70 px-2.5 py-2 text-[10px] leading-relaxed text-slate-300">
                <span className="mr-1 font-semibold uppercase tracking-[0.18em] text-slate-400">Why it matters:</span>
                {recommendation}
              </div>
            )}

            {normalizedExamples.length > 0 && (
              <div className="space-y-1">
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-500">Example</p>
                {normalizedExamples.slice(0, 2).map((example, index) => (
                  <p key={`${title}-${index}`} className="text-[10px] leading-relaxed text-slate-400">
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
