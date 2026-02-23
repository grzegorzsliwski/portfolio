import { useRef, useState, useCallback, useEffect, type CSSProperties, type MouseEvent as ReactMouseEvent } from "react";
import { type TimelineV2Item } from "./timelineV2Data";
import { useTheme } from "../../ThemeContext";

// ─── Config ──────────────────────────────────────────────────────────────────

/** How many "screens" of vertical scroll we map onto the full track width */
const SCROLL_SCREENS = 3;

// ─── Arrow colours ───────────────────────────────────────────────────────────

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

// ─── Single arrow card ───────────────────────────────────────────────────────

function ArrowCard({
  item,
  index,
  fillProgress,
  theme,
  isSmall,
}: {
  item: TimelineV2Item;
  index: number;
  fillProgress: number;
  theme: typeof DARK;
  isSmall: boolean;
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
        minHeight: isSmall ? 350 : 500,
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
        className="relative z-10 flex flex-col justify-center h-full py-8 gap-y-4 lg:py-14 lg:gap-y-6"
        style={{
          minHeight: isSmall ? 350 : 500,
          paddingLeft: isSmall ? (index === 0 ? "1.25rem" : "2.5rem") : "4rem",
          paddingRight: isSmall ? "2.5rem" : "4rem",
        }}
      >
        <span className={`text-sm font-semibold uppercase tracking-widest ${theme.accent === "#4ade80" ? "text-green-400" : "text-green-600"}`}>{item.date}</span>
        <h3 className={`text-2xl lg:text-5xl font-bold ${theme.title} leading-snug`}>{item.title}</h3>
        {item.description && (
          <p className={`text-base lg:text-xl ${theme.desc} leading-relaxed max-w-lg`}>{item.description}</p>
        )}
        <div className="flex flex-wrap gap-2 lg:gap-3 mt-2">
          {item.tags.filter(Boolean).map((tag) => (
            <span
              key={tag}
              className={`text-sm lg:text-base px-3 lg:px-4 py-1 lg:py-1.5 rounded-full border ${theme.badgeBorder} ${theme.badgeText}
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
  const rafId = useRef(0);
  const { isLight } = useTheme();
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
      <div className="sticky top-0 h-screen flex items-start pt-[20vh] overflow-hidden">
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
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
