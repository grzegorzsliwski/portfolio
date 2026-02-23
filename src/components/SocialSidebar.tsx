import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useCursor } from "./CursorOverlay";
import { useI18n } from "../I18nContext";

// ─── Dane ikon ───────────────────────────────────────────────────────────────

interface SocialLink {
  label: string;
  href: string;
  icon: ReactNode;
}

const LINKS: SocialLink[] = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/grzegorz-sliwski/",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect width="4" height="12" x="2" y="9" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
  {
    label: "GitHub",
    href: "https://github.com/grzegorzsliwski",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
        <path d="M9 18c-4.51 2-5-2-7-2" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/grzegorzsliwski/",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/grzegorz.sliwski.5/",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
];

// ─── Magnet icon ─────────────────────────────────────────────────────────────

/** Siła efektu magnesu (px) — im większa, tym ikona bardziej podąża za kursorem */
const MAGNET_STRENGTH = 16;

function MagnetIcon({ link }: { link: SocialLink }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    setOffset({
      x: dx * (MAGNET_STRENGTH / (rect.width / 2)),
      y: dy * (MAGNET_STRENGTH / (rect.height / 2)),
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setOffset({ x: 0, y: 0 });
  }, []);

  return (
    <a
      ref={ref}
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={link.label}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="social-sidebar__icon"
      style={{
        transform: `translate(${offset.x}px, ${offset.y}px)`,
      }}
    >
      {link.icon}
    </a>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

export function SocialSidebar() {
  const [isHovered, setIsHovered] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { setSidebarHover } = useCursor();
  const { lang, toggleLang } = useI18n();

  // Nasłuchuj na scroll, żeby sidebar reagował na pointer-events
  // (fixed overlay nie blokuje scrollu)
  useEffect(() => {
    // nic do roboty — sidebar jest fixed z CSS
  }, []);

  return (
    <>
      {/* Language toggle — top-left corner */}
      <button
        onClick={toggleLang}
        onMouseEnter={() => setSidebarHover(true)}
        onMouseLeave={() => setSidebarHover(false)}
        className="lang-toggle cursor-none"
        aria-label={lang === "en" ? "Switch to Polish" : "Przełącz na angielski"}
      >
        {lang === "en" ? "PL" : "EN"}
      </button>

      <nav
        ref={sidebarRef}
        onMouseEnter={() => { setIsHovered(true); setSidebarHover(true); }}
        onMouseLeave={() => { setIsHovered(false); setSidebarHover(false); }}
        className={`social-sidebar ${isHovered ? "social-sidebar--hovered" : ""}`}
        aria-label="Social media links"
      >
        {LINKS.map((link) => (
          <MagnetIcon key={link.label} link={link} />
        ))}
      </nav>
    </>
  );
}
