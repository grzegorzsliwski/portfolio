import { useState, useCallback } from "react";
import { useI18n } from "../I18nContext";
import { useCursor } from "./CursorOverlay";

// ─── Footer link data ────────────────────────────────────────────────────────

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

const SOCIAL_LINKS: FooterLink[] = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/grzegorz-sliwski/", external: true },
  { label: "GitHub", href: "https://github.com/grzegorzsliwski", external: true },
  { label: "Instagram", href: "https://www.instagram.com/grzegorzsliwski/", external: true },
  { label: "Facebook", href: "https://www.facebook.com/grzegorz.sliwski.5/", external: true },
];

// ─── Arrow icon for links ────────────────────────────────────────────────────

function ArrowIcon() {
  return (
    <svg
      className="footer-link__arrow"
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 17L17 7" />
      <path d="M7 7h10v10" />
    </svg>
  );
}

// ─── Copy button icon ────────────────────────────────────────────────────────

function CopyIcon({ copied }: { copied: boolean }) {
  if (copied) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    );
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="14" height="14" x="8" y="8" rx="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

// ─── Footer (contact) section ────────────────────────────────────────────────

export function Contact() {
  const { t } = useI18n();
  const { setSidebarHover } = useCursor();
  const [copied, setCopied] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const handleCopyEmail = useCallback(() => {
    navigator.clipboard.writeText(t.footerEmail).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [t.footerEmail]);

  const handleCopyPhone = useCallback(() => {
    navigator.clipboard.writeText(t.footerPhone).then(() => {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    });
  }, [t.footerPhone]);

  return (
    <footer id="contact" className="footer">
      <div className="footer__inner">
        {/* Left: social links in 2x2 grid */}
        <nav
          className="footer__links-col"
          onMouseEnter={() => setSidebarHover(true)}
          onMouseLeave={() => setSidebarHover(false)}
        >
          {SOCIAL_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              className="footer-link"
            >
              <ArrowIcon />
              <span className="footer-link__text">{link.label}</span>
            </a>
          ))}
        </nav>

        {/* Right: direct contact info */}
        <div
          className="footer__info-col"
          onMouseEnter={() => setSidebarHover(true)}
          onMouseLeave={() => setSidebarHover(false)}
        >
          <div className="footer__info-block">
            <span className="footer__info-label">Email</span>
            <div className="footer__email-row">
              <span className="footer__info-value">{t.footerEmail}</span>
              <button
                type="button"
                className="footer__copy-btn"
                onClick={handleCopyEmail}
                aria-label="Copy email"
              >
                <CopyIcon copied={copied} />
              </button>
            </div>
          </div>
          <div className="footer__info-block">
            <span className="footer__info-label">{t.footerPhoneLabel}</span>
            <div className="footer__email-row">
              <span className="footer__info-value">{t.footerPhone}</span>
              <button
                type="button"
                className="footer__copy-btn"
                onClick={handleCopyPhone}
                aria-label="Copy phone"
              >
                <CopyIcon copied={copiedPhone} />
              </button>
            </div>
          </div>
          <div className="footer__info-block">
            <span className="footer__info-label">CV</span>
            <div className="footer__email-row">
              <span className="footer__info-value">{t.footerCvLabel}</span>
              <a
                href="/cv.pdf"
                download
                className="footer__copy-btn"
                aria-label="Download CV"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </a>
            </div>
          </div>
          <div className="footer__info-block">
            <div className="footer__availability">
              <span className="footer-pulse" />
              <span className="footer__availability-text">
                {t.contactAvailability}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer__bottom">
        <span className="footer__copyright">
          © {new Date().getFullYear()} Grzegorz Śliwski
        </span>
      </div>
    </footer>
  );
}
