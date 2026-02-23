import { useState } from "react";
import "./App.css";
import { CursorOverlay } from "./components/CursorOverlay";
import { TextReveal } from "./components/TextReveal";
import { SocialSidebar } from "./components/SocialSidebar";
import { NavSidebar } from "./components/NavSidebar";
import { MobileDrawer } from "./components/MobileDrawer";
import { StartScreen } from "./components/StartScreen";
// import { Projects } from "./components/Projects";
import { Contact } from "./components/Contact";
import { TimelineV2 } from "./components/ArrowTimeline";
import { ThemeProvider, useThemeColors } from "./ThemeContext";
import { I18nProvider, useI18n } from "./I18nContext";

function App() {
  return (
    <I18nProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </I18nProvider>
  );
}

function AppContent() {
  const [started, setStarted] = useState(false);
  const { hiddenColor, scrollColor } = useThemeColors();
  const { t } = useI18n();

  return (
    <CursorOverlay>
      {!started && <StartScreen onStart={() => setStarted(true)} />}
      {started && (
        <>
          <SocialSidebar />
          <NavSidebar />
          <MobileDrawer />
        </>
      )}
      {started && <div className="flex flex-col items-center bg-[#0a0a0a]" style={{ overflowX: "clip" }}>
        {/* ── Sekcja HERO (100vh) ──────────────────────────────────── */}
        <section className="flex flex-col items-center min-h-[50vh] pt-64 px-4">
          <div className="text-center">
            <TextReveal
              className="block pb-4"
              revealed={
                <span className="text-lg md:text-2xl font-medium tracking-[0.2em] uppercase text-white">
                  Grzegorz Śliwski
                </span>
              }
            >
              <span className="text-lg md:text-2xl font-medium tracking-[0.2em] uppercase text-white/40">
                Grzegorz Śliwski
              </span>
            </TextReveal>
            <TextReveal
              className="block"
              frontText={t.heroFront}
              frontClassName="text-6xl md:text-8xl font-black tracking-tight"
              hiddenColor={hiddenColor}
              scrollColor={scrollColor}
              highlights={{ "Fullstack": "rgba(74,222,128,1)" }}
              revealed={
                <span className="text-6xl md:text-8xl font-black tracking-tight bg-clip-text text-transparent">
                  {t.heroRevealed}
                </span>
              }
            />
          </div>
        </section>

        {/* ── Sekcja O MNIE ─────────────────────────────────────── */}
        <section id="about" className="relative w-full pt-32 overflow-x-hidden">
          {/* Photo – large, right side on desktop */}
          <div className="hidden min-[1400px]:block absolute right-0 top-1/2 -translate-y-1/2 w-[42vw] max-w-[800px] z-0">
            <img
              src="/src/assets/ja.png"
              alt="Grzegorz Śliwski"
              className="w-full h-auto object-contain grayscale-[0.2] hover:grayscale-0 transition-[filter] duration-[400ms] ease-in-out"
            />
          </div>
          {/* Photo – above text on smaller screens */}
          <div className="min-[1400px]:hidden flex justify-center px-6">
            <img
              src="/src/assets/ja.png"
              alt="Grzegorz Śliwski"
              className="w-full max-w-[280px] sm:max-w-[360px] md:max-w-[440px] h-auto object-contain grayscale-[0.2] hover:grayscale-0 transition-[filter] duration-[400ms] ease-in-out"
            />
          </div>
          <div className="max-w-[80rem] mx-auto px-6 md:px-24">
            <div className="py-16">
              {/* Text content – capped width on large screens so it doesn't overlap photo */}
              <div className="min-[1400px]:max-w-[55%] relative space-y-8">
                {/* Hover hint – to the left of first text */}
                <div className="about-hover-hint">
                  <span>{t.aboutHoverHint}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" />
                    <path d="M12 5l7 7-7 7" />
                  </svg>
                </div>

                <div>
                  <TextReveal
                    className="block pb-8"
                    revealed={
                      <span className="text-lg md:text-2xl font-medium tracking-[0.2em] uppercase text-white">
                        {t.aboutLabel}
                      </span>
                    }
                  >
                    <span className="text-lg md:text-2xl font-medium tracking-[0.2em] uppercase text-white/40">
                      {t.aboutLabel}
                    </span>
                  </TextReveal>
                  <TextReveal
                    className="block"
                    frontText={t.scrollReveal1}
                    frontClassName="text-3xl md:text-5xl font-semibold leading-tight"
                    hiddenColor={hiddenColor}
                    scrollColor={scrollColor}
                    highlights={Object.fromEntries(
                      t.scrollReveal1Highlight.map(word => [word, "rgba(74,222,128,1)"])
                    )}
                    revealed={
                      <span className="text-3xl md:text-5xl font-semibold leading-tight">
                        {t.aboutRevealed1}
                      </span>
                    }
                  />
                </div>
                <TextReveal
                  className="block"
                  frontText={t.scrollReveal2}
                  frontClassName="text-3xl md:text-5xl font-semibold leading-tight"
                  hiddenColor={hiddenColor}
                  scrollColor={scrollColor}
                  revealed={
                    <span className="text-3xl md:text-5xl font-semibold leading-tight">
                      {t.aboutRevealed2}
                    </span>
                  }
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── Sekcja TIMELINE (Arrow) ──────────────────────────── */}
        <section id="experience" className="relative w-full pt-32">
          <div className="max-w-[80rem] mx-auto px-6 md:px-24">
            <TextReveal
              className="block pb-8"
              revealed={
                <span className="text-lg md:text-2xl font-medium tracking-[0.2em] uppercase text-white">
                  {t.experienceLabel}
                </span>
              }
            >
              <span className="text-lg md:text-2xl font-medium tracking-[0.2em] uppercase text-white/40">
                {t.experienceLabel}
              </span>
            </TextReveal>
            <TextReveal
              className="block"
              frontText={t.experienceSubheading}
              frontClassName="text-3xl md:text-5xl font-bold leading-tight"
              hiddenColor={hiddenColor}
              scrollColor={scrollColor}
              revealed={
                <span className="text-3xl md:text-5xl font-bold leading-tight text-white">
                  {t.experienceSubheading}
                </span>
              }
            />
          </div>
        </section>

        <TimelineV2 items={t.timeline} />

        {/* ── Sekcja PROJEKTY ─────────────────────────────────────── */}
        {/* <Projects /> */}
        {/* ── Sekcja projektowa tymczasowa ─────────────────────────── */}        
        <section className="relative w-full py-16 mb-8 md:py-32 md:mb-16">
          <div className="max-w-[80rem] mx-auto px-6 md:px-24">
                        <TextReveal
              className="block pb-8"
              revealed={
                <span className="text-lg md:text-2xl font-medium tracking-[0.2em] uppercase text-white">
                  {t.projectsLabel}
                </span>
              }
            >
              <span className="text-lg md:text-2xl font-medium tracking-[0.2em] uppercase text-white/40">
                {t.projectsLabel}
              </span>
            </TextReveal>
            <TextReveal
              className="block"
            frontText={t.projectText1}
            frontClassName="text-3xl md:text-5xl font-semibold leading-tight"
            hiddenColor={hiddenColor}
            scrollColor={scrollColor}
            highlights={Object.fromEntries(
              t.projectText1Highlight.map(word => [word, "rgba(74,222,128,1)"])
            )}
            revealed={
              <span className="text-3xl md:text-5xl font-semibold leading-tight">
                {t.projectText1}
              </span>
            }
          />
          </div>
        </section>

        {/* ── Sekcja końcowa SCROLL REVEAL ─────────────────────────── */}
        <section className="relative w-full py-16 mb-8 md:py-32 md:mb-16">
          <div className="max-w-[80rem] mx-auto px-6 md:px-24">
            <TextReveal
              className="block pb-8"
              revealed={
                <span className="text-lg md:text-2xl font-medium tracking-[0.2em] uppercase text-white">
                  {t.contactLabel}
                </span>
              }
            >
              <span className="text-lg md:text-2xl font-medium tracking-[0.2em] uppercase text-white/40">
                {t.contactLabel}
              </span>
            </TextReveal>
            <TextReveal
              className="block"
            frontText={t.ctaText}
            frontClassName="text-3xl md:text-5xl font-semibold leading-tight"
            hiddenColor={hiddenColor}
            scrollColor={scrollColor}
            highlights={{ [t.ctaHighlight]: "rgba(74,222,128,1)" }}
            revealed={
              <span className="text-3xl md:text-5xl font-semibold leading-tight">
                {t.ctaText}
              </span>
            }
          />
          </div>
        </section>
        
        {/* ── Sekcja KONTAKT ──────────────────────────────────────── */}
        <Contact />

        
      </div>}
    </CursorOverlay>
  );
}

export default App;
