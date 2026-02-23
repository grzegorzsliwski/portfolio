import { useCallback, useEffect, useState } from "react";
import { useTheme } from "../ThemeContext";
import { useI18n } from "../I18nContext";

// ─── Dane nawigacji ──────────────────────────────────────────────────────────

const NAV_HREFS = ["#about", "#experience", "#contact"];

function useNavItems() {
  const { t } = useI18n();
  return [
    { label: t.navAbout, href: NAV_HREFS[0] },
    { label: t.navExperience, href: NAV_HREFS[1] },
    { label: t.navContact, href: NAV_HREFS[2] },
  ];
}

// ─── Social links ────────────────────────────────────────────────────────────

const SOCIAL_LINKS = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/grzegorz-sliwski/",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
        <path d="M9 18c-4.51 2-5-2-7-2" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/grzegorzsliwski/",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
];

// ─── Hamburger icon ──────────────────────────────────────────────────────────

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <div className="mobile-drawer__hamburger-lines">
      <span className={`mobile-drawer__line ${open ? "mobile-drawer__line--1-open" : ""}`} />
      <span className={`mobile-drawer__line ${open ? "mobile-drawer__line--2-open" : ""}`} />
      <span className={`mobile-drawer__line ${open ? "mobile-drawer__line--3-open" : ""}`} />
    </div>
  );
}

// ─── Komponent MobileDrawer ──────────────────────────────────────────────────

export function MobileDrawer() {
  const [open, setOpen] = useState(false);
  const { isLight, toggleTheme } = useTheme();
  const { lang, toggleLang } = useI18n();
  const navItems = useNavItems();

  // Blokuj scroll gdy drawer otwarty
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      e.preventDefault();
      setOpen(false);
      // Małe opóźnienie żeby drawer zdążył się zamknąć
      setTimeout(() => {
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: "smooth" });
        }
      }, 300);
    },
    []
  );

  return (
    <>
      {/* Hamburger button — widoczny tylko na mobile */}
      <button
        className="mobile-drawer__toggle"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
      >
        <HamburgerIcon open={open} />
      </button>

      {/* Overlay — tło */}
      <div
        className={`mobile-drawer__overlay ${open ? "mobile-drawer__overlay--visible" : ""}`}
        onClick={() => setOpen(false)}
      />

      {/* Drawer panel */}
      <div className={`mobile-drawer__panel ${open ? "mobile-drawer__panel--open" : ""}`}>
        {/* Nav links */}
        <nav className="mobile-drawer__nav" aria-label="Mobile navigation">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="mobile-drawer__nav-link"
              onClick={(e) => handleNavClick(e, item.href)}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Divider */}
        <div className="mobile-drawer__divider" />

        {/* Social links */}
        <div className="mobile-drawer__socials">
          {SOCIAL_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.label}
              className="mobile-drawer__social-icon"
            >
              {link.icon}
              <span className="mobile-drawer__social-label">{link.label}</span>
            </a>
          ))}
        </div>

        {/* Divider */}
        <div className="mobile-drawer__divider" />

        {/* Bottom row: theme + lang toggles */}
        <div className="mobile-drawer__toggles">
          <button
            onClick={toggleTheme}
            className="mobile-drawer__action-btn"
            aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
          >
            {isLight ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
            <span>{isLight ? "Dark" : "Light"}</span>
          </button>

          <button
            onClick={toggleLang}
            className="mobile-drawer__action-btn"
            aria-label={lang === "en" ? "Switch to Polish" : "Przełącz na angielski"}
          >
            <span className="mobile-drawer__lang-badge">{lang === "en" ? "PL" : "EN"}</span>
            <span>{lang === "en" ? "Polski" : "English"}</span>
          </button>
        </div>
      </div>
    </>
  );
}
