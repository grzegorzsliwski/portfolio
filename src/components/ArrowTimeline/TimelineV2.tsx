import { useRef, useState, useCallback, useEffect, type CSSProperties, type MouseEvent as ReactMouseEvent } from "react";
import { type TimelineV2Item } from "./timelineV2Data";
import { useTheme } from "../../ThemeContext";
import { useI18n } from "../../I18nContext";

// How many "screens" of vertical scroll we map onto the full track width */
const SCROLL_SCREENS = 3;

const DARK = {
  border: "#6b7280",
  fill: "#0a0a0a",
  accent: "#4ade80",
  title: "text-white",
  desc: "text-gray-400",
  badgeBorder: "border-gray-600",
  badgeText: "text-gray-300",
  badgeBg: "bg-white/5",
  glow: "rgba(255,255,255,0.04)",
};

const LIGHT = {
  border: "#d1d5db",
  fill: "#ffffff",
  accent: "#22c55e",
  title: "text-gray-900",
  desc: "text-gray-500",
  badgeBorder: "border-gray-300",
  badgeText: "text-gray-600",
  badgeBg: "bg-gray-100",
  glow: "rgba(0,0,0,0.03)",
};

function ArrowCard({
  item,
  index,
  theme,
  isSmall,
  onOpen,
  seeMoreLabel,
}: {
  item: TimelineV2Item;
  index: number;
  theme: typeof DARK;
  isSmall: boolean;
  onOpen: () => void;
  seeMoreLabel: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  // Detect if content (without tags) overflows the card
  useEffect(() => {
    const card = cardRef.current;
    const measure = measureRef.current;
    if (!card || !measure || !isSmall) { setIsOverflowing(false); return; }
    const check = () => {
      // measure the natural height of text content vs available card space
      const cardH = card.clientHeight;
      const contentH = measure.scrollHeight;
      setIsOverflowing(contentH > cardH * 0.95);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [isSmall, item]);

  const handleMouseMove = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      const el = cardRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
      el.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
    },
    [],
  );

  // First arrow has a flat left edge; the rest have a chevron notch
  const clipPath = index === 0
    ? "polygon(0 0, 92% 0, 100% 50%, 92% 100%, 0 100%)"
    : "polygon(0 0, 92% 0, 100% 50%, 92% 100%, 0 100%, 6% 50%)";

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className="group relative flex-shrink-0 transition-transform duration-300 ease-out hover:scale-[1.03] overflow-hidden"
      style={{
        width: isSmall ? "clamp(260px, 82vw, 420px)" : "720px",
        height: isSmall ? "calc(100svh - 22vh)" : "calc(100svh - 20vh)",
        // Negative margin so arrows overlap and connect visually
        marginLeft: index === 0 ? 0 : isSmall ? "-1.5rem" : "-2.8rem",
      }}
    >
      {/* Arrow shape – border with green fill from left to right.
          --fill is updated directly via JS to avoid React re-renders. */}
      <div
        className="absolute inset-0"
        style={{
          clipPath,
          background:
            `linear-gradient(to right, ${theme.accent} var(--fill, 0%), ${theme.border} var(--fill, 0%))`,
        }}
      />

      {/* Inner dark fill (slightly inset) */}
      <div
        className="absolute"
        style={{
          inset: "3px",
          clipPath,
          background: theme.fill,
        }}
      />

      {/* Hover glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100
                   transition-opacity duration-500"
        style={{
          clipPath,
          background:
            "radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), " + theme.glow + ", transparent 40%)",
        }}
      />

      {/* Content – clipped to inner arrow shape */}
      <div
        className="absolute z-10 overflow-hidden"
        style={{
          inset: "3px",
          clipPath,
        }}
      >
        <div
          className="relative flex flex-col h-full py-4 gap-y-3 lg:py-14 lg:gap-y-6 overflow-hidden"
          style={{
            justifyContent: isSmall ? "flex-start" : "center",
            paddingLeft: isSmall ? (index === 0 ? "1.25rem" : "2.5rem") : "4rem",
            paddingRight: isSmall ? "2.5rem" : "4rem",
            paddingTop: isSmall ? "1.5rem" : undefined,
          }}
        >
        {/* Hidden measure wrapper to detect natural content height */}
        {isSmall && (
          <div ref={measureRef} className="absolute top-0 left-0 right-0 pointer-events-none opacity-0 flex flex-col py-4 gap-y-3" style={{ paddingLeft: index === 0 ? "1.25rem" : "2.5rem", paddingRight: "2.5rem", paddingTop: "1.5rem" }} aria-hidden>
            <span className="text-xs font-semibold">{item.date}</span>
            <h3 className="text-xl font-bold leading-snug">{item.title}</h3>
            {item.description && <p className="text-sm leading-relaxed">{item.description}</p>}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {item.tags.filter(Boolean).map((tag) => <span key={tag} className="text-xs px-2.5 py-1">{tag}</span>)}
            </div>
          </div>
        )}
        <span className={`text-xs lg:text-sm font-semibold uppercase tracking-widest ${theme.accent === "#4ade80" ? "text-green-400" : "text-green-600"}`}>{item.date}</span>
        <h3 className={`text-xl lg:text-5xl font-bold ${theme.title} leading-snug`}>{item.title}</h3>

        {/* Description */}
        {item.description && (
          isSmall ? (
            <p className={`text-sm ${theme.desc} leading-relaxed`}>{item.description}</p>
          ) : (
            <p className={`text-xl ${theme.desc} leading-relaxed max-w-lg`}>{item.description}</p>
          )
        )}

        {/* Tags */}
        {!isSmall && (
          <div className="flex flex-wrap mt-2 gap-3">
            {item.tags.filter(Boolean).map((tag) => (
              <span
                key={tag}
                className={`rounded-full border ${theme.badgeBorder} ${theme.badgeText}
                           ${theme.badgeBg} backdrop-blur-sm text-base px-4 py-1.5`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {isSmall && (
          <div className="flex flex-wrap mt-2 gap-1.5">
            {item.tags.filter(Boolean).map((tag) => (
              <span
                key={tag}
                className={`rounded-full border ${theme.badgeBorder} ${theme.badgeText}
                           ${theme.badgeBg} backdrop-blur-sm text-xs px-2.5 py-1`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        </div>

        {/* Mobile: fade-out gradient at bottom when overflowing */}
        {isSmall && isOverflowing && (
          <div
            className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
            style={{
              background: `linear-gradient(to bottom, transparent, ${theme.fill})`,
            }}
          />
        )}
      </div>

      {/* Mobile: "See more" button pinned to bottom – only when content overflows */}
      {isSmall && isOverflowing && (
        <button
          onClick={(e) => { e.stopPropagation(); onOpen(); }}
          className="timeline-see-more-btn absolute bottom-4 z-20"
          style={{
            left: index === 0 ? "1.25rem" : "2.5rem",
          }}
        >
          {seeMoreLabel} →
        </button>
      )}
    </div>
  );
}

// ─── Fullscreen detail overlay (mobile) ──────────────────────────────────────

function DetailOverlay({
  item,
  theme,
  onClose,
  closeLabel,
}: {
  item: TimelineV2Item;
  theme: typeof DARK;
  onClose: () => void;
  closeLabel: string;
}) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.body.classList.add("timeline-overlay-open");
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove("timeline-overlay-open");
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[10000] flex flex-col animate-[fadeIn_0.25s_ease]"
      style={{ background: theme.fill === "#0a0a0a" ? "rgba(10,10,10,0.97)" : "rgba(255,255,255,0.97)", backdropFilter: "blur(12px)" }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="timeline-overlay-close"
        aria-label={closeLabel}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-12 pt-3">
        <span className={`block pt-1 text-sm font-semibold uppercase tracking-widest ${theme.accent === "#4ade80" ? "text-green-400" : "text-green-600"}`}>
          {item.date}
        </span>
        <h2 className={`text-3xl font-bold ${theme.title} leading-snug mt-3 mb-4`}>{item.title}</h2>
        {item.description && (
          <p className={`text-base ${theme.desc} leading-relaxed mb-6`}>{item.description}</p>
        )}
        <div className="flex flex-wrap gap-2">
          {item.tags.filter(Boolean).map((tag) => (
            <span
              key={tag}
              className={`text-sm px-3 py-1 rounded-full border ${theme.badgeBorder} ${theme.badgeText}
                         ${theme.badgeBg} backdrop-blur-sm`}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── TimelineV2 section ──────────────────────────────────────────────────────

interface TimelineV2Props {
  items: TimelineV2Item[];
}

export function TimelineV2({ items }: TimelineV2Props) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [isSmall, setIsSmall] = useState(window.innerWidth < 1024);
  const [openItem, setOpenItem] = useState<TimelineV2Item | null>(null);
  const rafId = useRef(0);
  const { isLight } = useTheme();
  const { lang } = useI18n();
  const theme = isLight ? LIGHT : DARK;

  // Mutable refs – avoid re-renders, avoid layout-thrashing reads in scroll
  const targetProgress = useRef(0);   // raw target from scroll position
  const renderedProgress = useRef(0); // currently rendered (lerped) value
  const trackWidthRef = useRef(0);
  const sectionTopRef = useRef(0);    // cached offsetTop
  const sectionHeightRef = useRef(0); // cached offsetHeight
  const isAnimating = useRef(false);

  // ── Measure dimensions (no layout reads during scroll) ───────────────────
  useEffect(() => {
    function measure() {
      if (trackRef.current) {
        trackWidthRef.current = trackRef.current.scrollWidth;
      }
      if (sectionRef.current) {
        sectionTopRef.current = sectionRef.current.offsetTop;
        sectionHeightRef.current = sectionRef.current.offsetHeight;
      }
      setIsSmall(window.innerWidth < 1024);
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // ── Render loop: lerp toward target for silky momentum tail ──────────────
  const renderLoop = useCallback(() => {
    const track = trackRef.current;
    if (!track) { isAnimating.current = false; return; }

    // Lerp: fast catch-up (0.25) keeps it responsive, smooths iOS momentum tail
    const prev = renderedProgress.current;
    const next = prev + (targetProgress.current - prev) * 0.25;

    // Stop the loop when close enough (saves battery)
    if (Math.abs(next - targetProgress.current) < 0.0001) {
      renderedProgress.current = targetProgress.current;
    } else {
      renderedProgress.current = next;
    }

    // Apply transform
    const maxTx = Math.max(0, trackWidthRef.current - window.innerWidth + 80);
    track.style.transform = `translate3d(${-renderedProgress.current * maxTx}px, 0, 0)`;

    // Update card border fills via CSS custom property (one write per card)
    const count = items.length;
    const p = renderedProgress.current;
    for (let i = 0; i < count; i++) {
      const el = track.children[i] as HTMLElement | undefined;
      if (!el) continue;
      const cardStart = i / count;
      const cardEnd = (i + 1) / count;
      const fill = Math.max(0, Math.min(1, (p - cardStart) / (cardEnd - cardStart)));
      el.style.setProperty("--fill", `${fill * 100}%`);
    }

    // Keep looping while not converged
    if (renderedProgress.current !== targetProgress.current) {
      rafId.current = requestAnimationFrame(renderLoop);
    } else {
      isAnimating.current = false;
    }
  }, [items.length]);

  // ── Scroll handler: cheap read only (no getBoundingClientRect) ───────────
  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY || window.pageYOffset;
    const sH = sectionHeightRef.current;
    const vH = window.innerHeight;
    const scrollable = sH - vH;

    if (scrollable <= 0) {
      targetProgress.current = 0;
    } else {
      const raw = (scrollY - sectionTopRef.current) / scrollable;
      targetProgress.current = Math.max(0, Math.min(1, raw));
    }

    // Kick the render loop if it isn't running
    if (!isAnimating.current) {
      isAnimating.current = true;
      rafId.current = requestAnimationFrame(renderLoop);
    }
  }, [renderLoop]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId.current);
    };
  }, [handleScroll]);

  // Section height = viewport × SCROLL_SCREENS → creates vertical scroll room
  const sectionStyle: CSSProperties = {
    height: `${SCROLL_SCREENS * 100}vh`,
  };

  return (
    <section ref={sectionRef} className="relative w-full" style={sectionStyle}>
      {/* Sticky wrapper – pinned to viewport, pushed up to avoid sidebar */}
      <div className="sticky top-0 h-screen flex items-start pt-[10vh] overflow-hidden">
        {/* Track with arrow cards */}
        <div
          ref={trackRef}
          className="flex flex-row items-stretch gap-4 lg:gap-16"
          style={{
            willChange: "transform",
            paddingLeft: isSmall ? "1rem" : "max(2rem, 8vw)",
            paddingRight: isSmall ? "1rem" : "4rem",
          }}
        >
          {items.map((item, i) => (
              <ArrowCard
                key={item.title}
                item={item}
                index={i}
                theme={theme}
                isSmall={isSmall}
                onOpen={() => setOpenItem(item)}
                seeMoreLabel={lang === "pl" ? "Zobacz więcej" : "See more"}
              />
          ))}
        </div>
      </div>

      {/* Fullscreen detail overlay (mobile) */}
      {openItem && (
        <DetailOverlay
          item={openItem}
          theme={theme}
          onClose={() => setOpenItem(null)}
          closeLabel={lang === "pl" ? "Zamknij" : "Close"}
        />
      )}
    </section>
  );
}
