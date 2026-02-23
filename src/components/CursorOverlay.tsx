import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";

// ─── Typy ────────────────────────────────────────────────────────────────────

/** Pozycja kursora na stronie */
interface CursorPos {
  x: number;
  y: number;
}

/** Kontekst udostępniany przez CursorOverlay do komponentów TextReveal */
interface CursorContextValue {
  /** Aktualna pozycja kursora (page coords) */
  pos: CursorPos;
  /** Rozmiar kółka kursora – powiększa się po najechaniu na TextReveal */
  radius: number;
  /** Czy kursor aktualnie najechał na jakikolwiek TextReveal */
  isHovering: boolean;
  /** Rejestruje element TextReveal, aby CursorOverlay mógł sprawdzać hover */
  registerTarget: (id: string) => void;
  /** Wyrejestrowuje element TextReveal */
  unregisterTarget: (id: string) => void;
  /** Callback wywoływany przez TextReveal po mouseenter/mouseleave */
  setHovering: (hovering: boolean) => void;
  /** Callback wywoływany przez sidebar po mouseenter/mouseleave */
  setSidebarHover: (hovering: boolean) => void;
}

const CursorContext = createContext<CursorContextValue | null>(null);

/** Hook ułatwiający dostęp do kontekstu kursora */
export function useCursor(): CursorContextValue {
  const ctx = useContext(CursorContext);
  if (!ctx) {
    throw new Error("useCursor must be used inside <CursorOverlay>");
  }
  return ctx;
}

// ─── Stałe animacji ─────────────────────────────────────────────────────────

/** Rozmiar kółka kursora w stanie domyślnym (px) */
const DEFAULT_RADIUS = 24;

/** Rozmiar kółka kursora po najechaniu na TextReveal (px) */
const HOVER_RADIUS = 220;

/** Czas trwania animacji rozmiaru kółka (ms) */
const RADIUS_DURATION = 350;

/**
 * Ewaluacja CSS cubic-bezier(x1, y1, x2, y2) dla danego t ∈ [0,1].
 * Używa binary-search do znalezienia parametru krzywej.
 */
function cubicBezierEase(
  t: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  let lo = 0,
    hi = 1;
  for (let i = 0; i < 16; i++) {
    const mid = (lo + hi) / 2;
    const u = 1 - mid;
    const x = 3 * u * u * mid * x1 + 3 * u * mid * mid * x2 + mid * mid * mid;
    if (x < t) lo = mid;
    else hi = mid;
  }
  const s = (lo + hi) / 2;
  const u = 1 - s;
  return 3 * u * u * s * y1 + 3 * u * s * s * y2 + s * s * s;
}

// ─── Komponent CursorOverlay ─────────────────────────────────────────────────

interface CursorOverlayProps {
  children: ReactNode;
}

/**
 * Globalny overlay kursora.
 *
 * Renderuje niestandardowe kółko podążające za myszką.
 * Udostępnia kontekst (CursorContext) do komponentów TextReveal,
 * dzięki czemu mogą one reagować na pozycję kursora.
 */
export function CursorOverlay({ children }: CursorOverlayProps) {
  const [pos, setPos] = useState<CursorPos>({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isOverSidebar, setIsOverSidebar] = useState(false);
  const [visible, setVisible] = useState(false);
  const targetsRef = useRef(new Set<string>());

  // ── Animowany radius (JS, nie CSS) ─────────────────────────────────────
  const targetRadius = isHovering ? HOVER_RADIUS : DEFAULT_RADIUS;
  const [animatedRadius, setAnimatedRadius] = useState(DEFAULT_RADIUS);
  const animRadiusRef = useRef(DEFAULT_RADIUS);
  const animRafRef = useRef<number>(0);

  useEffect(() => {
    const start = animRadiusRef.current;
    const target = targetRadius;
    if (Math.abs(start - target) < 0.5) {
      animRadiusRef.current = target;
      setAnimatedRadius(target);
      return;
    }

    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / RADIUS_DURATION, 1);
      const eased = cubicBezierEase(t, 0.25, 1, 0.5, 1);
      const val = start + (target - start) * eased;
      animRadiusRef.current = val;
      setAnimatedRadius(val);
      if (t < 1) animRafRef.current = requestAnimationFrame(tick);
    };

    cancelAnimationFrame(animRafRef.current);
    animRafRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animRafRef.current);
  }, [targetRadius]);

  // Nasłuchujemy ruchu myszki na całym dokumencie
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // pageX/pageY uwzględnia scroll
      setPos({ x: e.clientX, y: e.clientY });
      if (!visible) setVisible(true);
    };

    const handleMouseLeave = () => {
      setVisible(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.documentElement.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.documentElement.removeEventListener(
        "mouseleave",
        handleMouseLeave
      );
    };
  }, [visible]);

  const registerTarget = useCallback((id: string) => {
    targetsRef.current.add(id);
  }, []);

  const unregisterTarget = useCallback((id: string) => {
    targetsRef.current.delete(id);
  }, []);

  const setHovering = useCallback((hovering: boolean) => {
    setIsHovering(hovering);
  }, []);

  const setSidebarHover = useCallback((hovering: boolean) => {
    setIsOverSidebar(hovering);
  }, []);

  const ctxValue: CursorContextValue = {
    pos,
    radius: animatedRadius,
    isHovering,
    registerTarget,
    unregisterTarget,
    setHovering,
    setSidebarHover,
  };

  return (
    <CursorContext.Provider value={ctxValue}>
      {/* Ukrywamy domyślny kursor na całej stronie */}
      <div className="cursor-none min-h-screen">
        {children}

        {/*
          Kółko kursora – fixed, pointer-events-none,
          więc nie blokuje interakcji ze stroną.
          Transition na width/height/margin zapewnia płynne powiększanie.
        */}
        <div
          className="fixed top-0 left-0 pointer-events-none z-[9998] rounded-full bg-green-400"
          style={{
            width: animatedRadius * 2,
            height: animatedRadius * 2,
            transform: `translate(${pos.x - animatedRadius}px, ${pos.y - animatedRadius}px)`,
            opacity: visible && !isOverSidebar ? 1 : 0,
            transition: "opacity 0.2s ease",
          }}
        />
      </div>
    </CursorContext.Provider>
  );
}
