import { useEffect, useRef, useCallback } from "react";

// ─── Typy ────────────────────────────────────────────────────────────────────

interface ScrollRevealTextProps {
  /** Tekst do wyświetlenia (zostanie podzielony na słowa) */
  text: string;

  /** Klasy Tailwind (font-size, font-weight, itp.) */
  className?: string;

  /** Kolor tekstu po odsłonięciu – CSS color string */
  revealedColor?: string;

  /** Kolor tekstu przed odsłonięciem – CSS color string */
  hiddenColor?: string;
}

/**
 * ScrollRevealText – tekst, który zmienia kolor z ciemnego na jasny
 * podczas przewijania strony.
 *
 * Mechanizm:
 *  1. Tekst jest dzielony na słowa (każde słowo = osobny <span>).
 *  2. Słowa są grupowane po wizualnych liniach (offsetTop).
 *  3. Dla każdej linii obliczany jest postęp scrollowania (0→1).
 *  4. W obrębie linii postęp jest rozkładany od lewej do prawej,
 *     dzięki czemu kolor "wchodzi" w kierunku czytania.
 *  5. Kolor jest interpolowany płynnie (rgba) przez requestAnimationFrame.
 */
export function ScrollRevealText({
  text,
  className = "",
  revealedColor = "rgba(255,255,255,0.9)",
  hiddenColor = "rgba(255,255,255,0.15)",
}: ScrollRevealTextProps) {
  const words = text.split(/\s+/);
  const wordSpansRef = useRef<(HTMLSpanElement | null)[]>([]);
  const rafRef = useRef<number>(0);

  // ─── Parsowanie koloru rgba do tablicy [r, g, b, a] ──────────────────────

  const parseRgba = useCallback((color: string): [number, number, number, number] => {
    const match = color.match(
      /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+))?\s*\)/
    );
    if (match) {
      return [+match[1], +match[2], +match[3], match[4] !== undefined ? +match[4] : 1];
    }
    // Fallback: biały z pełną przezroczystością
    return [255, 255, 255, 1];
  }, []);

  // ─── Interpolacja między dwoma kolorami rgba ─────────────────────────────

  const lerpRgba = useCallback(
    (from: [number, number, number, number], to: [number, number, number, number], t: number): string => {
      const r = Math.round(from[0] + (to[0] - from[0]) * t);
      const g = Math.round(from[1] + (to[1] - from[1]) * t);
      const b = Math.round(from[2] + (to[2] - from[2]) * t);
      const a = +(from[3] + (to[3] - from[3]) * t).toFixed(3);
      return `rgba(${r},${g},${b},${a})`;
    },
    []
  );

  // ─── Główna pętla aktualizacji kolorów (rAF) ────────────────────────────

  const updateColors = useCallback(() => {
    const spans = wordSpansRef.current;
    if (!spans.length) return;

    const fromColor = parseRgba(hiddenColor);
    const toColor = parseRgba(revealedColor);
    const viewportH = window.innerHeight;

    // Zbieramy wszystkie istniejące spany
    const validSpans: HTMLSpanElement[] = [];
    for (const span of spans) {
      if (span) validSpans.push(span);
    }
    if (!validSpans.length) return;

    // Bierzemy bounding rect pierwszego i ostatniego słowa
    const firstRect = validSpans[0].getBoundingClientRect();
    const lastRect = validSpans[validSpans.length - 1].getBoundingClientRect();

    const blockTop = firstRect.top;
    const blockBottom = lastRect.bottom;
    const triggerStart = viewportH * 0.95;
    const triggerEnd = viewportH * 0.7;

    // If the block has scrolled above the trigger zone, fully reveal everything
    if (blockBottom < triggerEnd) {
      for (const span of validSpans) {
        span.style.color = revealedColor;
      }
      return;
    }

    // Globalny postęp dla całego bloku tekstu (0→1)
    const blockProgress = Math.max(
      0,
      Math.min(1, (triggerStart - blockTop) / (triggerStart - triggerEnd + (blockBottom - blockTop)))
    );

    // Każde słowo odsłania się sekwencyjnie, jedno po drugim
    const totalWords = validSpans.length;
    const wordWindow = 0.2 / totalWords;

    for (let i = 0; i < totalWords; i++) {
      const wordStart = i / totalWords;
      const wordProgress = Math.max(0, Math.min(1, (blockProgress - wordStart) / wordWindow));

      validSpans[i].style.color = lerpRgba(fromColor, toColor, wordProgress);
    }
  }, [hiddenColor, revealedColor, parseRgba, lerpRgba]);

  // ─── Nasłuchiwanie scroll / resize ────────────────────────────────────────

  useEffect(() => {
    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updateColors);
    };

    // Początkowe obliczenie (tekst widoczny bez scrolla)
    updateColors();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [updateColors]);

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <p className={className}>
      {words.map((word, i) => (
        <span
          key={i}
          ref={(el) => {
            wordSpansRef.current[i] = el;
          }}
          className="inline-block"
          style={{ color: hiddenColor }}
        >
          {word}
          {/* Spacja między słowami (nbsp zachowuje inline-block spacing) */}
          {i < words.length - 1 && "\u00A0"}
        </span>
      ))}
    </p>
  );
}
