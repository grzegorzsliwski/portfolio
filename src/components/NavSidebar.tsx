import { useCallback, useEffect, useRef, useState } from "react";
import { useCursor } from "./CursorOverlay";
import { useTheme } from "../ThemeContext";import { useI18n } from "../I18nContext";
// ─── Dane nawigacji ──────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
}

const NAV_HREFS = ["#about", "#experience", "#contact"];

function useNavItems(): NavItem[] {
  const { t } = useI18n();
  return [
    { label: t.navAbout, href: NAV_HREFS[0] },
    { label: t.navExperience, href: NAV_HREFS[1] },
    { label: t.navContact, href: NAV_HREFS[2] },
  ];
}

// ─── Typewriter link ─────────────────────────────────────────────────────────

/** Prędkość "pisania" jednej litery (ms) */
const TYPE_SPEED = 45;
/** Prędkość "kasowania" jednej litery (ms) */
const ERASE_SPEED = 25;

function TypewriterLink({ item }: { item: NavItem }) {
  const fullText = item.label;
  const [displayed, setDisplayed] = useState(fullText);
  const [isHovered, setIsHovered] = useState(false);
  const timeoutsRef = useRef<number[]>([]);
  const animatingRef = useRef(false);
  const linkRef = useRef<HTMLAnchorElement>(null);

  // Sync displayed text when language changes
  useEffect(() => {
    if (!animatingRef.current) {
      setDisplayed(fullText);
      const el = linkRef.current;
      if (el) el.style.minWidth = "";
    }
  }, [fullText]);

  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  // Zablokuj minimalną szerokość, żeby element się nie kurczył
  const lockWidth = useCallback(() => {
    const el = linkRef.current;
    if (el) {
      el.style.minWidth = `${el.offsetWidth}px`;
    }
  }, []);

  // Kasowanie → pisanie od nowa
  const handleMouseEnter = useCallback(() => {
    if (animatingRef.current) return;      // ignoruj re-entry w trakcie animacji
    animatingRef.current = true;
    setIsHovered(true);
    clearAllTimeouts();
    lockWidth();

    const len = fullText.length;

    // Faza 1: kasowanie litera po literze
    for (let i = len; i >= 0; i--) {
      const id = window.setTimeout(() => {
        setDisplayed(fullText.slice(0, i));
      }, (len - i) * ERASE_SPEED);
      timeoutsRef.current.push(id);
    }

    const eraseTotal = len * ERASE_SPEED;

    // Faza 2: pisanie litera po literze
    for (let i = 0; i <= len; i++) {
      const id = window.setTimeout(() => {
        setDisplayed(fullText.slice(0, i));
        // Koniec animacji — odblokuj ponowne wejście
        if (i === len) {
          animatingRef.current = false;
        }
      }, eraseTotal + i * TYPE_SPEED);
      timeoutsRef.current.push(id);
    }
  }, [fullText, clearAllTimeouts, lockWidth]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    clearAllTimeouts();
    animatingRef.current = false;
    setDisplayed(fullText);
  }, [fullText, clearAllTimeouts]);

  // Cleanup on unmount
  useEffect(() => clearAllTimeouts, [clearAllTimeouts]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.querySelector(item.href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  }, [item.href]);

  return (
    <a
      ref={linkRef}
      href={item.href}
      className={`nav-sidebar__link ${isHovered ? "nav-sidebar__link--active" : ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <span className="nav-sidebar__text">
        {displayed}
        <span className={`nav-sidebar__cursor ${isHovered ? "nav-sidebar__cursor--visible" : ""}`}>
          |
        </span>
      </span>
    </a>
  );
}

// ─── Nav Sidebar ─────────────────────────────────────────────────────────────

export function NavSidebar() {
  const { setSidebarHover } = useCursor();
  const { isLight, toggleTheme } = useTheme();
  const navItems = useNavItems();

  return (
    <>
      <nav
        className="nav-sidebar"
        aria-label="Main navigation"
        onMouseEnter={() => setSidebarHover(true)}
        onMouseLeave={() => setSidebarHover(false)}
      >
        {navItems.map((item) => (
          <TypewriterLink key={item.href} item={item} />
        ))}
      </nav>

      {/* Theme toggle — bottom-right corner */}
      <button
        onClick={toggleTheme}
        onMouseEnter={() => setSidebarHover(true)}
        onMouseLeave={() => setSidebarHover(false)}
        className="theme-toggle cursor-none"
        aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
      >
        {isLight ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </button>
    </>
  );
}
