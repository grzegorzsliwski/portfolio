import { useEffect, useState, useCallback, useRef } from "react";
import { useI18n } from "../I18nContext";
import { useCursor } from "./CursorOverlay";

// ─── Obrazy do preloadowania ─────────────────────────────────────────────────
import jaPhoto from "../assets/ja.png";
import portfolioImg from "../assets/portfolio.png";
import pracaDyplomowaImg from "../assets/praca-dyplomowa.png";
import pracaDyplomowa2Img from "../assets/praca-dyplomowa-2.png";
import platformaTreningowa1Img from "../assets/platforma-treningowa-1.jpg";
import platformaTreningowa2Img from "../assets/platforma-treningowa-2.jpg";
import platformaTreningowa3Img from "../assets/platforma-treningowa-3.jpg";
import wyszukiwarkaLotowImg from "../assets/wyszukiwarka-lotow.png";

const ALL_IMAGES = [
  jaPhoto,
  portfolioImg,
  pracaDyplomowaImg,
  pracaDyplomowa2Img,
  platformaTreningowa1Img,
  platformaTreningowa2Img,
  platformaTreningowa3Img,
  wyszukiwarkaLotowImg,
];

/** Preładuj obrazy i zwróć postęp 0-1 przez callback */
function preloadImages(
  images: string[],
  onProgress: (ratio: number) => void,
): Promise<void> {
  let loaded = 0;
  const total = images.length;
  if (total === 0) {
    onProgress(1);
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    images.forEach((src) => {
      const img = new Image();
      const done = () => {
        loaded++;
        onProgress(loaded / total);
        if (loaded >= total) resolve();
      };
      img.onload = done;
      img.onerror = done; // nie blokuj przy błędzie
      img.src = src;
    });
  });
}

// ─── Stałe ───────────────────────────────────────────────────────────────────

/** Minimalny czas wyświetlania ekranu startowego (ms) */
const MIN_LOADING_DURATION_MS = 800;

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
  const startTime = useRef(Date.now());
  const imagesReady = useRef(false);
  const minTimeReady = useRef(false);
  const { t } = useI18n();
  const { setSidebarHover } = useCursor();

  // Preload obrazów + minimalne opóźnienie animacyjne
  useEffect(() => {
    const tryFinish = () => {
      if (imagesReady.current && minTimeReady.current) {
        setProgress(100);
        setLoaded(true);
      }
    };

    // 1) Preload obrazów – aktualizuje progress proporcjonalnie
    preloadImages(ALL_IMAGES, (ratio) => {
      // progress = ratio * 100, ale nie przekraczamy 99 dopóki min czas nie minie
      setProgress((prev) => Math.max(prev, Math.round(ratio * 99)));
    }).then(() => {
      imagesReady.current = true;
      tryFinish();
    });

    // 2) Minimalny czas animacji
    const minTimer = setTimeout(() => {
      minTimeReady.current = true;
      tryFinish();
    }, MIN_LOADING_DURATION_MS);

    return () => clearTimeout(minTimer);
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
