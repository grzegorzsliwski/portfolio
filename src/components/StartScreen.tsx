import { useEffect, useState, useCallback } from "react";
import { useI18n } from "../I18nContext";
import { useCursor } from "./CursorOverlay";

// ─── Stałe ───────────────────────────────────────────────────────────────────

/** Szybki licznik ładowania 0→100 */
const PROGRESS_MAX = 100;
const PROGRESS_STEP = 2;
const PROGRESS_INTERVAL_MS = 15;

/** Interwał odświeżania procentów (ms) */
const TICK_INTERVAL = 30;

// ─── Komponent StartScreen ──────────────────────────────────────────────────

interface StartScreenProps {
  onStart: () => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [exiting, setExiting] = useState(false);
  const { t } = useI18n();
  const { setSidebarHover } = useCursor();

  // Szybkie, liniowe ładowanie bez dodatkowej logiki
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(prev + PROGRESS_STEP, PROGRESS_MAX);
        if (next >= PROGRESS_MAX) {
          setLoaded(true);
          clearInterval(timer);
        }
        return next;
      });
    }, PROGRESS_INTERVAL_MS);

    return () => clearInterval(timer);
  }, []);

  const handleStart = useCallback(() => {
    setSidebarHover(false);
    setExiting(true);
    // Czekamy na koniec animacji wyjścia
    setTimeout(onStart, 700);
  }, [onStart, setSidebarHover]);

  return (
    <div
      className="fixed inset-0 z-[9990] flex flex-col bg-[#0a0a0a] select-none"
      style={{
        opacity: exiting ? 0 : 1,
        transition: "opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* ── Pasek ładowania na górze ──────────────────────────────── */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-white/5">
        <div
          className="h-full bg-green-400"
          style={{
            width: `${progress}%`,
            transition: `width ${TICK_INTERVAL}ms linear`,
          }}
        />
      </div>

      {/* ── Zawartość centralna ───────────────────────────────────── */}
      <div className="flex-1 flex items-center" style={{ paddingLeft: "36%", paddingRight: "64%", paddingBottom: "15%" }}>
        <div
          className="flex flex-col items-center gap-6"
          style={{ cursor: 'auto' }}
          onMouseEnter={() => setSidebarHover(true)}
          onMouseLeave={() => setSidebarHover(false)}
        >
          {/* Ładowanie → przycisk Start */}
          {!loaded ? (
            <p className="text-sm font-medium tracking-[0.3em] uppercase text-white/30 tabular-nums">
              {t.loading} {progress}%
            </p>
          ) : (
            <button
              onClick={handleStart}
              className="group relative cursor-none"
              style={{
                opacity: loaded ? 1 : 0,
                transform: loaded ? "translateY(0)" : "translateY(12px)",
                transition: "opacity 0.5s ease, transform 0.5s ease",
                background: "none",
                border: "none",
                padding: 0,
              }}
            >
              <span
                className="block text-sm font-medium tracking-[0.3em] uppercase text-white/60 transition-colors duration-300 group-hover:text-white"
              >
                {t.start}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
