import { Fragment, useEffect, useId, useRef, useState, useMemo, useCallback, type CSSProperties, type ReactNode } from "react";
import { useCursor } from "./CursorOverlay";

// ─── Typy ────────────────────────────────────────────────────────────────────

interface TextRevealBaseProps {
  /**
   * Tekst / element wyświetlany pod kółkiem kursora (warstwa „back").
   * Może zawierać dowolne JSX ze stylami, gradientami itp.
   */
  revealed: ReactNode;

  /** Dodatkowe klasy Tailwind dla wrappera */
  className?: string;

  /** Inline style wrappera */
  style?: CSSProperties;
}

/** Wariant statyczny – front to dowolne ReactNode */
interface TextRevealStaticProps extends TextRevealBaseProps {
  children: ReactNode;
  frontText?: never;
  frontClassName?: never;
  hiddenColor?: never;
  scrollColor?: never;
}

/** Wariant scroll reveal – front to tekst animowany przy scrollu */
interface TextRevealScrollProps extends TextRevealBaseProps {
  children?: never;
  /** Tekst warstwy front (dzielony na słowa z animacją scroll) */
  frontText: string;
  /** Klasy Tailwind dla słów front (font-size, weight itp.) */
  frontClassName?: string;
  /** Kolor tekstu przed odsłonięciem scrollem */
  hiddenColor?: string;
  /** Kolor tekstu po odsłonięciu scrollem */
  scrollColor?: string;
  /** Mapa słów do kolorów – nadpisuje scrollColor dla wybranych słów */
  highlights?: Record<string, string>;
}

type TextRevealProps = TextRevealStaticProps | TextRevealScrollProps;

// ─── Helpery do interpolacji kolorów ─────────────────────────────────────────

type RGBA = [number, number, number, number];

function parseRgba(color: string): RGBA {
  const match = color.match(
    /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+))?\s*\)/
  );
  if (match) {
    return [+match[1], +match[2], +match[3], match[4] !== undefined ? +match[4] : 1];
  }
  return [255, 255, 255, 1];
}

function lerpRgba(from: RGBA, to: RGBA, t: number): string {
  const r = Math.round(from[0] + (to[0] - from[0]) * t);
  const g = Math.round(from[1] + (to[1] - from[1]) * t);
  const b = Math.round(from[2] + (to[2] - from[2]) * t);
  const a = +(from[3] + (to[3] - from[3]) * t).toFixed(3);
  return `rgba(${r},${g},${b},${a})`;
}

// ─── Scroll Reveal Front ─────────────────────────────────────────────────────

/** Wewnętrzny komponent: warstwa front z animacją scroll-reveal na słowach */
function ScrollRevealFront({
  text,
  className = "",
  hiddenColor = "rgba(255,255,255,0.15)",
  scrollColor = "rgba(255,255,255,0.9)",
  highlights = {},
}: {
  text: string;
  className?: string;
  hiddenColor?: string;
  scrollColor?: string;
  highlights?: Record<string, string>;
}) {
  const words = useMemo(() => text.split(/\s+/), [text]);
  const wordSpansRef = useRef<(HTMLSpanElement | null)[]>([]);
  const rafRef = useRef<number>(0);
  const highlightsRef = useRef(highlights);
  highlightsRef.current = highlights;

  const updateColors = useCallback(() => {
    const spans = wordSpansRef.current;
    if (!spans.length) return;

    const fromColor = parseRgba(hiddenColor);
    const defaultToColor = parseRgba(scrollColor);
    const currentHighlights = highlightsRef.current;
    const viewportH = window.innerHeight;

    // Zbieramy wszystkie istniejące spany
    const validSpans: HTMLSpanElement[] = [];
    for (const span of spans) {
      if (span) validSpans.push(span);
    }
    if (!validSpans.length) return;

    // Bierzemy bounding rect pierwszego i ostatniego słowa,
    // żeby wyznaczyć zakres scrollowania dla całego bloku tekstu
    const firstRect = validSpans[0].getBoundingClientRect();
    const lastRect = validSpans[validSpans.length - 1].getBoundingClientRect();

    // Globalny postęp: 0 = pierwszy element na 90% viewportu,
    // 1 = ostatni element na 40% viewportu
    const blockTop = firstRect.top;
    const blockBottom = lastRect.bottom;
    const triggerStart = viewportH * 0.95; // kiedy blok wchodzi na ekran
    const triggerEnd = viewportH * 0.7;    // kiedy blok jest w pełni odsłonięty

    // Postęp dla całego bloku (0→1)
    const blockProgress = Math.max(
      0,
      Math.min(1, (triggerStart - blockTop) / (triggerStart - triggerEnd + (blockBottom - blockTop)))
    );

    // Każde słowo dostaje swój kawałek globalnego postępu.
    // Używamy "ruchomego okna" — każde słowo zaczyna się odsłaniać
    // po poprzednim, ale z lekkim nakładaniem (overlap).
    const totalWords = validSpans.length;
    const wordWindow = 0.2 / totalWords; // szerokość okna aktywacji dla jednego słowa

    for (let i = 0; i < totalWords; i++) {
      // Punkt startowy tego słowa w globalnym postępie (0→1)
      const wordStart = i / totalWords;
      // Postęp konkretnego słowa: 0→1 w obrębie jego okna
      const wordProgress = Math.max(0, Math.min(1, (blockProgress - wordStart) / wordWindow));

      const word = words[i];
      const toColor = (word && currentHighlights[word]) ? parseRgba(currentHighlights[word]) : defaultToColor;
      validSpans[i].style.color = lerpRgba(fromColor, toColor, wordProgress);
    }
  }, [hiddenColor, scrollColor, words]);

  useEffect(() => {
    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updateColors);
    };

    updateColors();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [updateColors]);

  return (
    <span className={`relative z-0 select-none ${className}`}>
      {words.map((word, i) => (
        <Fragment key={i}>
          <span
            ref={(el) => { wordSpansRef.current[i] = el; }}
            className="inline-block"
            style={{ color: hiddenColor }}
          >
            {word}
          </span>
          {i < words.length - 1 && " "}
        </Fragment>
      ))}
    </span>
  );
}

// ─── Komponent TextReveal ────────────────────────────────────────────────────

/**
 * TextReveal – komponent nakładający dwie warstwy tekstu:
 *
 * front  (normalny lub scroll-reveal)  ← zawsze widoczny
 * back   (stylizowany tekst)           ← widoczny tylko pod kółkiem kursora
 *
 * Dwa tryby front:
 *  1. Statyczny: podajesz `children` (dowolne ReactNode)
 *  2. Scroll reveal: podajesz `frontText` → tekst animowany słowo po słowie przy scrollu
 */
export function TextReveal(props: TextRevealProps) {
  const {
    revealed,
    className = "",
    style,
  } = props;

  const id = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { pos, radius, registerTarget, unregisterTarget, setHovering } =
    useCursor();

  const isLocalHoverRef = useRef(false);
  const posRef = useRef(pos);
  posRef.current = pos;

  // Licznik wymuszający re-render przy scrollu (aby localX/localY się zaktualizowały)
  const [, setScrollTick] = useState(0);

  const checkCursorOverlap = useCallback(() => {
    if (!wrapperRef.current) return;
    const r = wrapperRef.current.getBoundingClientRect();
    const { x, y } = posRef.current;
    const inside =
      x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    if (inside && !isLocalHoverRef.current) {
      isLocalHoverRef.current = true;
      setHovering(true);
    } else if (!inside && isLocalHoverRef.current) {
      isLocalHoverRef.current = false;
      setHovering(false);
    }
  }, [setHovering]);

  useEffect(() => {
    registerTarget(id);
    return () => unregisterTarget(id);
  }, [id, registerTarget, unregisterTarget]);

  // Po zamontowaniu sprawdzamy, czy kursor już jest nad elementem
  // (np. po kliknięciu Start, gdy element pojawia się pod kursorem).
  useEffect(() => {
    // Drobne opóźnienie, aby element zdążył się wyrenderować z poprawnymi wymiarami
    const timer = requestAnimationFrame(() => {
      checkCursorOverlap();
    });
    return () => cancelAnimationFrame(timer);
  }, [checkCursorOverlap]);

  // Przy scrollu sprawdzamy, czy kursor nadal jest nad elementem.
  // onMouseLeave nie odpala, gdy element "ucieka" spod kursora przez scroll.
  // Dodatkowo wymuszamy re-render, żeby localX/localY się zaktualizowały
  // i clipPath nie "dryfował" od głównego kółka kursora.
  useEffect(() => {
    const onScroll = () => {
      requestAnimationFrame(() => {
        checkCursorOverlap();
        // Wymuszamy re-render, aby localX/localY policzyły się ponownie
        // na podstawie aktualnego getBoundingClientRect (element się przesunął)
        setScrollTick((n) => n + 1);
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [checkCursorOverlap]);

  const rect = wrapperRef.current?.getBoundingClientRect();
  const localX = rect ? pos.x - rect.left : 0;
  const localY = rect ? pos.y - rect.top : 0;

  const handleMouseEnter = () => {
    isLocalHoverRef.current = true;
    setHovering(true);
  };
  const handleMouseLeave = () => {
    isLocalHoverRef.current = false;
    setHovering(false);
  };

  // Wybieramy tryb front: scroll-reveal lub statyczny
  const isScrollMode = "frontText" in props && props.frontText !== undefined;

  return (
    <div
      ref={wrapperRef}
      className={`relative z-[9999] cursor-none overflow-hidden ${className}`}
      style={style}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="grid [&>*]:col-start-1 [&>*]:row-start-1">
        {/* Warstwa FRONT */}
        {isScrollMode ? (
          <ScrollRevealFront
            text={(props as TextRevealScrollProps).frontText}
            className={(props as TextRevealScrollProps).frontClassName}
            hiddenColor={(props as TextRevealScrollProps).hiddenColor}
            scrollColor={(props as TextRevealScrollProps).scrollColor}
            highlights={(props as TextRevealScrollProps).highlights}
          />
        ) : (
          <span className="relative z-0 select-none">
            {(props as TextRevealStaticProps).children}
          </span>
        )}

        {/* Warstwa BACK – odsłaniana kursorem */}
        <span
          className="z-10 select-none pointer-events-none bg-green-400"
          style={{
            paddingBlock: "0.25em",
            marginBlock: "-0.25em",
            clipPath: `circle(${radius - 2}px at ${localX}px ${localY}px)`,
            color: "black",
            WebkitTextFillColor: "black",
          }}
          aria-hidden="true"
        >
          {revealed}
        </span>
      </div>
    </div>
  );
}
