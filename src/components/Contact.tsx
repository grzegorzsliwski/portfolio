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

const EMAIL = "grzegorzsliwski@gmail.com";
const PHONE = "+48 503 600 749";
const CV_URL = "/cv.pdf";

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

// ─── Copy-to-clipboard icons ─────────────────────────────────────────────────

function CopyIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  );
}

// ─── Copy hook ───────────────────────────────────────────────────────────────

function useCopyToClipboard(timeout = 2000) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), timeout);
      } catch {
        // fallback
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        setCopied(true);
        setTimeout(() => setCopied(false), timeout);
      }
    },
    [timeout]
  );

  return { copied, copy };
}

// ─── Footer (contact) section ────────────────────────────────────────────────

export function Contact() {
  const { t } = useI18n();
  const { setSidebarHover } = useCursor();
  const emailClip = useCopyToClipboard();
  const phoneClip = useCopyToClipboard();

  return (
    <footer id="contact" className="footer">
      <div className="max-w-[80rem] mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 md:gap-16 items-start">
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

        {/* Right: contact details + availability */}
        <div
          className="footer__contact-col"
          onMouseEnter={() => setSidebarHover(true)}
          onMouseLeave={() => setSidebarHover(false)}
        >
          {/* Email */}
          <div className="footer__contact-row">
            <span className="footer__info-label">{t.footerEmailLabel}</span>
            <div className="footer__contact-value-row">
              <a href={`mailto:${EMAIL}`} className="footer__info-value">
                {EMAIL}
              </a>
              <button
                className="footer__copy-btn"
                onClick={() => emailClip.copy(EMAIL)}
                aria-label={emailClip.copied ? t.footerCopied : `Copy ${t.footerEmailLabel}`}
                title={emailClip.copied ? t.footerCopied : `Copy`}
              >
                {emailClip.copied ? <CheckIcon /> : <CopyIcon />}
              </button>
            </div>
          </div>

          {/* Phone */}
          <div className="footer__contact-row">
            <span className="footer__info-label">{t.footerPhoneLabel}</span>
            <div className="footer__contact-value-row">
              <a href={`tel:${PHONE.replace(/\s/g, "")}`} className="footer__info-value">
                {PHONE}
              </a>
              <button
                className="footer__copy-btn"
                onClick={() => phoneClip.copy(PHONE)}
                aria-label={phoneClip.copied ? t.footerCopied : `Copy ${t.footerPhoneLabel}`}
                title={phoneClip.copied ? t.footerCopied : `Copy`}
              >
                {phoneClip.copied ? <CheckIcon /> : <CopyIcon />}
              </button>
            </div>
          </div>

          {/* CV */}
          <div className="footer__contact-row">
            <span className="footer__info-label">{t.footerCvLabel}</span>
            <div className="footer__contact-value-row">
              <a
                href={CV_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="footer__info-value"
              >
                {t.footerOpenCv}
              </a>
              <a
                href={CV_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="footer__copy-btn"
                aria-label={t.footerOpenCv}
                title={t.footerOpenCv}
              >
                <DownloadIcon />
              </a>
            </div>
          </div>

          {/* Availability */}
          <div className="footer__contact-row footer__contact-row--availability">
            <div className="flex items-center gap-2">
              <span className="footer-pulse" />
              <span className="footer__availability-text">
                {t.contactAvailability}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-[80rem] mt-16 mx-auto px-6 md:px-12 py-5 md:py-6">
        <span className="footer__copyright">
          © {new Date().getFullYear()} Grzegorz Śliwski
        </span>
      </div>
    </footer>
  );
}
