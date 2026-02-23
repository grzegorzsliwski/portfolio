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
  fillProgress,
  theme,
  isSmall,
  onOpen,
  seeMoreLabel,
}: {
  item: TimelineV2Item;
  index: number;
  fillProgress: number;
  theme: typeof DARK;
  isSmall: boolean;
  onOpen: () => void;
  seeMoreLabel: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

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
        height: isSmall ? "calc(100svh - 12vh)" : undefined,
        minHeight: isSmall ? undefined : 500,
        // Negative margin so arrows overlap and connect visually
        marginLeft: index === 0 ? 0 : isSmall ? "-1.5rem" : "-2.8rem",
      }}
    >
      {/* Arrow shape – border with green fill from left to right */}
      <div
        className="absolute inset-0"
        style={{
          clipPath,
          background:
            `linear-gradient(to right, ${theme.accent} ${fillProgress * 100}%, ${theme.border} ${fillProgress * 100}%)`,
          transition: "background 0.15s ease-out",
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

      {/* Content */}
      <div
        className="relative z-10 flex flex-col h-full py-4 gap-y-3 lg:py-14 lg:gap-y-6"
        style={{
          minHeight: isSmall ? undefined : 500,
          justifyContent: isSmall ? "flex-start" : "center",
          paddingLeft: isSmall ? (index === 0 ? "1.25rem" : "2.5rem") : "4rem",
          paddingRight: isSmall ? "2.5rem" : "4rem",
          paddingTop: isSmall ? "1.5rem" : undefined,
        }}
      >
        <span className={`text-xs lg:text-sm font-semibold uppercase tracking-widest ${theme.accent === "#4ade80" ? "text-green-400" : "text-green-600"}`}>{item.date}</span>
        <h3 className={`text-xl lg:text-5xl font-bold ${theme.title} leading-snug`}>{item.title}</h3>

        {/* Description: full on desktop, faded on mobile */}
        {item.description && (
          isSmall ? (
            <div className="relative flex-1 min-h-0 overflow-hidden">
              <p className={`text-sm ${theme.desc} leading-relaxed`}>{item.description}</p>
              {/* Fade-out gradient */}
              <div
                className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
                style={{ background: `linear-gradient(to bottom, transparent, ${theme.fill})` }}
              />
            </div>
          ) : (
            <p className={`text-xl ${theme.desc} leading-relaxed max-w-lg`}>{item.description}</p>
          )
        )}

        {/* Tags: hidden on mobile (shown in overlay), visible on desktop */}
        {!isSmall && (
          <div className="flex flex-wrap gap-3 mt-2">
            {item.tags.filter(Boolean).map((tag) => (
              <span
                key={tag}
                className={`text-base px-4 py-1.5 rounded-full border ${theme.badgeBorder} ${theme.badgeText}
                           ${theme.badgeBg} backdrop-blur-sm`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Mobile: "See more" button – styled like action-btn */}
        {isSmall && (item.description || item.tags.some(Boolean)) && (
          <button
            onClick={(e) => { e.stopPropagation(); onOpen(); }}
            className="timeline-see-more-btn"
          >
            {seeMoreLabel} →
          </button>
        )}
      </div>
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
  const [scrollProgress, setScrollProgress] = useState(0);
  const [trackWidth, setTrackWidth] = useState(0);
  const [isSmall, setIsSmall] = useState(window.innerWidth < 1024);
  const [openItem, setOpenItem] = useState<TimelineV2Item | null>(null);
  const rafId = useRef(0);
  const { isLight } = useTheme();
  const { lang } = useI18n();
  const theme = isLight ? LIGHT : DARK;

  // ── Measure track width ──────────────────────────────────────────────────
  useEffect(() => {
    function measure() {
      if (trackRef.current) {
        setTrackWidth(trackRef.current.scrollWidth);
      }
      setIsSmall(window.innerWidth < 1024);
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // ── Map vertical scroll → horizontal progress (same as Timeline v1) ─────
  const handleScroll = useCallback(() => {
    cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const sectionHeight = sectionRef.current.offsetHeight;
      const viewportHeight = window.innerHeight;
      const scrollableDistance = sectionHeight - viewportHeight;

      if (scrollableDistance <= 0) {
        setScrollProgress(0);
        return;
      }

      const scrollRaw = -rect.top / scrollableDistance;
      setScrollProgress(Math.max(0, Math.min(1, scrollRaw)));
    });
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId.current);
    };
  }, [handleScroll]);

  // ── Compute translateX ───────────────────────────────────────────────────
  const maxTranslate = Math.max(0, trackWidth - window.innerWidth + 80);
  const translateX = -scrollProgress * maxTranslate;

  const trackStyle: CSSProperties = {
    transform: `translate3d(${translateX}px, 0, 0)`,
    transition: "transform 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    willChange: "transform",
  };

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
          style={{ ...trackStyle, paddingLeft: isSmall ? "1rem" : "max(2rem, 8vw)", paddingRight: isSmall ? "1rem" : "4rem" }}
        >
          {items.map((item, i) => {
            // Each card fills sequentially across the total scroll progress
            const cardStart = i / items.length;
            const cardEnd = (i + 1) / items.length;
            const cardFill = Math.max(0, Math.min(1,
              (scrollProgress - cardStart) / (cardEnd - cardStart)
            ));
            return (
              <ArrowCard
                key={item.title}
                item={item}
                index={i}
                fillProgress={cardFill}
                theme={theme}
                isSmall={isSmall}
                onOpen={() => setOpenItem(item)}
                seeMoreLabel={lang === "pl" ? "Zobacz więcej" : "See more"}
              />
            );
          })}
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
