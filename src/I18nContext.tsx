import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

// ─── Typy ────────────────────────────────────────────────────────────────────

export type Lang = "en" | "pl";

interface I18nContextValue {
  lang: Lang;
  toggleLang: () => void;
  t: Translations;
}

// ─── Translations type ───────────────────────────────────────────────────────

interface Translations {
  // Hero
  heroFront: string;
  heroRevealed: string;

  // Scroll reveal section
  aboutLabel: string;
  scrollReveal1: string;
  scrollReveal1Highlight: string[];
  scrollReveal2: string;
  aboutRevealed1: string;
  aboutRevealed2: string;
  aboutHoverHint: string;

  // Timeline
  experienceLabel: string;
  experienceSubheading: string;

  // Projects
  projectsLabel: string;
  projectsSubheading: string;

  // Temporary projects
  projectText1: string;
  projectText1Highlight: string[];

  // Contact / Footer
  contactLabel: string;
  contactSubheading: string;
  contactAvailability: string;
  footerEmailLabel: string;
  footerPhoneLabel: string;
  footerCvLabel: string;
  footerCopied: string;
  footerOpenCv: string;

  // CTA
  ctaText: string;
  ctaHighlight: string;

  // Start screen
  loading: string;
  start: string;

  // Nav
  navAbout: string;
  navExperience: string;
  navProjects: string;
  navContact: string;

  // Project cards
  liveDemo: string;

  // Timeline entries
  timeline: TimelineTranslation[];

  // Project entries
  projects: ProjectTranslation[];
}

interface TimelineTranslation {
  id: string;
  date: string;
  title: string;
  description: string;
  tags: string[];
}

interface ProjectTranslation {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  year?: string;
}

// ─── Tłumaczenia ─────────────────────────────────────────────────────────────

const en: Translations = {
  heroFront: "Fullstack Developer",
  heroRevealed: "Software Developer",

  aboutLabel: "About Me",

  scrollReveal1:
    "I'm a data engineering graduate and fullstack developer with 1+ year of experience building modern web and mobile applications with React and TypeScript.",
  scrollReveal1Highlight: ["React", "TypeScript"],
  scrollReveal2:
    "I focus on creating scalable, maintainable systems - from intuitive user interfaces to robust backend architectures.",
  aboutRevealed1:
    "I'm 23 years old. Besides coding, I love traveling with my fiancée — discovering new places, cultures and cuisines together.",
  aboutRevealed2:
    "I also enjoy staying active — gym, running and trying new sports. It keeps me balanced and creative.",
  aboutHoverHint: "Hover over text to discover more about me",

  experienceLabel: "Experience",
  experienceSubheading: "My professional journey and the milestones.",

  projectsLabel: "Projects",
  projectsSubheading: "Selected personal projects.",

  projectText1:
    "Beyond work experience gained during my studies, I have also pursued personal projects — including a cheap flight alert system with SMS notifications, a strength training logger app, a transfer learning model for detecting pathological masses in X-ray images, and a tutoring platform startup I'm currently building.",
  projectText1Highlight: ["personal", "projects"],

  contactLabel: "Connect",
  contactSubheading: "Let's build something great together.",
  contactAvailability: "Available for freelance & full-time opportunities",
  footerEmailLabel: "Email",
  footerPhoneLabel: "Phone",
  footerCvLabel: "Resume",
  footerCopied: "Copied!",
  footerOpenCv: "Open CV",

  ctaText: "Ready to collaborate? Let's talk about your next project.",
  ctaHighlight: "your",

  loading: "Loading…",
  start: "Start →",

  navAbout: "ABOUT ME",
  navExperience: "EXPERIENCE",
  navProjects: "PROJECTS",
  navContact: "CONTACT",

  liveDemo: "Live Demo",

  timeline: [
    {
      id: "edu-1",
      date: "2022 – 2026",
      title: "Data Engineering — Bachelor's Degree",
      description:
        "Earned my engineering degree at Kielce University of Technology in February 2026.",
      tags: [""],
    },
    {
      id: "career-1",
      date: "2024",
      title: "siudak.com — Backend Developer Intern",
      description:
        "Developed backend features for SelfExpo, with a focus on self-serviced pavilion registration.",
      tags: [
        "Next.js",
        "TypeScript",
        "MongoDB",
        "JWT",
        "Jest",
        "Github",
        "REST API",
      ],
    },
    {
      id: "career-2",
      date: "2024",
      title: "ITM Code – internship as a mobile developer",
      description:
        "I was responsible for developing a networking application for the Kielce Technology Park.",
      tags: ["TypeScript", "React Native", "Gitlab", "CSS"],
    },
    {
      id: "career-3",
      date: "2024",
      title: "Contract Collaboration – Tonerico",
      description:
        "I created a tool in Google Sheets using Google Apps Script for recording sales data, analyzing it, and generating reports.",
      tags: ["Google Sheets", "Google Apps Script"],
    },
    {
      id: "career-4",
      date: "2025",
      title: "LEOCODE — Junior Fullstack Developer",
      description:
        "Supported the LEOCODE team in developing the Human Body Universe web app (AnatoMy project) — responsible for importing complex metadata with associated GLB models to the database, rendering the structure on the page, advancing the visual layer, and implementing a role-based access control system.",
      tags: [
        "TypeScript",
        "Next.js",
        "Three.js",
        "C#",
        ".NET Core",
        "Entity Framework",
        "PostgreSQL",
        "MinIO",
        "Redis",
        "REST API",
      ],
    },
    {
      id: "career-5",
      date: "2025",
      title: "ALEATEX — Fullstack Developer",
      description:
        "I contributed to building the MVP for madc.ai, a project aimed at creating a system that enhances transparency in project requirements. I developed microservices and implemented multiple external integrations to deliver clear insights into requirements.",
      tags: [
        "TypeScript",
        "React",
        "PostgreSQL",
        "Supabase",
        "Kubernetes",
        "gRPC",
        "Rust",
      ],
    },
    {
      id: "edu-2",
      date: "2026",
      title: "Computer Science — Part-time Master's Degree",
      description:
        "Started part-time master's studies at Kielce University of Technology in March 2026.",
      tags: [""],
    },
    {
      id: "career-6",
      date: "now",
      title: "A collaboration with your company?",
      description: "",
      tags: [""],
    },
  ],

  projects: [
    {
      id: 1,
      title: "Tutoring Platform",
      subtitle: "Startup Project",
      description:
        "Tutoring platform with intelligent search, payment system, interactive whiteboard, voice chat and geolocation.",
      year: "now",
    },
    {
      id: 2,
      title: "Portfolio",
      subtitle: "Personal Website",
      description:
        "Interactive portfolio with custom scroll animations, typewriter effect and a custom cursor. Built with React + TypeScript and Tailwind CSS.",
    },
    {
      id: 3,
      title: "Diploma Thesis",
      subtitle: "Pathological mass detection using transfer learning",
      description:
        "Machine learning model built with transfer learning to detect pathological masses in X-ray images using Python libraries such as TensorFlow and Keras.",
    },
    {
      id: 4,
      title: "Strength Training Logger",
      subtitle: "Mobile Application",
      description:
        "Mobile application for logging strength training sessions with workout planning and progress tracking features. Built with React Native, MongoDB, Fastify and Nativewind.",
    },
    {
      id: 5,
      title: "Cheap Flight Alert System",
      subtitle: "Desktop Application",
      description:
        "System for finding cheap flights and sending promotional SMS notifications. Built with Python and Twilio.",
    },
  ],
};

const pl: Translations = {
  heroFront: "Fullstack Developer",
  heroRevealed: "Software Developer",

  aboutLabel: "O mnie",

  scrollReveal1:
    "Jestem absolwentem inżynierii danych oraz fullstack developerem z ponad rocznym doświadczeniem w tworzeniu nowoczesnych aplikacji webowych i mobilnych z wykorzystaniem React i TypeScript.",
  scrollReveal1Highlight: ["React", "TypeScript."],
  scrollReveal2:
    "Skupiam się na budowaniu skalowalnych i łatwych w utrzymaniu systemów – od intuicyjnych interfejsów użytkownika po solidne architektury backendowe.",
  aboutRevealed1:
    "Mam 23 lata. Poza programowaniem uwielbiam podróżować z moją narzeczoną — odkrywać nowe miejsca, kultury i kuchnie świata.",
  aboutRevealed2:
    "Lubię też aktywnie spędzać czas — siłownia, bieganie i nowe sporty. To pomaga mi zachować równowagę i kreatywność.",
  aboutHoverHint: "Najedź na tekst, aby odkryć więcej o mnie",

  experienceLabel: "Doświadczenie",
  experienceSubheading: "Moja droga zawodowa i kamienie milowe.",

  projectsLabel: "Projekty",
  projectsSubheading: "Wybrane projekty personalne.",

  projectText1:
    "Oprócz doświadczenia zawodowego nabytego podczas studiów, realizowałem również projekty personalne — m.in. system znajdowania tanich lotów z powiadomieniami SMS, aplikację do zapisywania treningu siłowego, model uczenia transferowego do detekcji mas patologicznych na zdjęciach rentgenowskich, a obecnie pracuję nad startupem — platformą do korepetycji.",
  projectText1Highlight: ["projekty", "personalne"],

  contactLabel: "Kontakt",
  contactSubheading: "Zbudujmy razem coś wyjątkowego.",
  contactAvailability: "Dostępny na zlecenia i współpracę",
  footerEmailLabel: "Email",
  footerPhoneLabel: "Telefon",
  footerCvLabel: "CV",
  footerCopied: "Skopiowano!",
  footerOpenCv: "Otwórz CV",

  ctaText: "Gotowy na współpracę? Porozmawiajmy o Twoim następnym projekcie.",
  ctaHighlight: "Twoim",

  loading: "Ładowanie…",
  start: "Start →",

  navAbout: "O MNIE",
  navExperience: "DOŚWIADCZENIE",
  navProjects: "PROJEKTY",
  navContact: "KONTAKT",

  liveDemo: "Live Demo",

  timeline: [
    {
      id: "edu-1",
      date: "2022 – 2026",
      title: "Inżynieria danych - studia inżynierskie",
      description:
        "Obroniłem tytuł inżyniera na Politechnice Świętokrzyskiej w lutym 2026.",
      tags: [""],
    },
    {
      id: "career-1",
      date: "2024",
      title: "siudak.com - praktyki jako backend developer",
      description:
        "Tworzyłem funkcjonalności backendu dla przedsiębiorstwa SelfExpo, ze szczególnym naciskiem na rejestrację pawilonów samoobsługowych.",
      tags: [
        "Next.js",
        "TypeScript",
        "MongoDB",
        "JWT",
        "Jest",
        "Github",
        "REST API",
      ],
    },
    {
      id: "career-2",
      date: "2024",
      title: "ITM Code - praktyki jako mobile developer",
      description:
        "Zajmowałem się tworzeniem aplikacji networkingowej dla Kieleckiego Parku Technologicznego.",
      tags: ["TypeScript", "React Native", "Gitlab", "CSS"],
    },
    {
      id: "career-3",
      date: "2024",
      title: "Współpraca zleceniowa – Tonerico",
      description:
        "Stworzyłem w Arkuszach Google, przy użyciu Google Apps Script, narzędzie służące do zapisywania danych sprzedażowych, ich analizowania oraz tworzenia raportów.",
      tags: ["Google Sheets", "Google Apps Script"],
    },
    {
      id: "career-4",
      date: "2025",
      title: "LEOCODE - młodszy programista fullstack",
      description:
        "Wspierałem zespół LEOCODE przy rozwoju aplikacji webowej Human Body Universe (projekt AnatoMy) – odpowiadałem m.in. za import zagnieżdżonych metadanych wraz z przypisanymi modelami GLB do bazy danych, ich wyświetlanie i odwzorowanie struktury na stronie, rozwój warstwy wizualnej aplikacji oraz implementację systemu ról i uprawnień użytkowników.",
      tags: [
        "TypeScript",
        "Next.js",
        "Three.js",
        "C#",
        ".NET Core",
        "Entity Framework",
        "PostgreSQL",
        "MinIO",
        "Redis",
        "REST API",
      ],
    },
    {
      id: "career-5",
      date: "2025",
      title: "ALEATEX - programista fullstack",
      description:
        "Pracowałem przy tworzeniu MVP dla madc.ai, którego celem było zbudowanie systemu zwiększającego transparentność w zakresie wymagań projektowych. Tworzyłem mikroserwisy oraz integrowałem liczne zewnętrzne systemy, aby dostarczać przejrzyste insighty dotyczące wymagań.",
      tags: [
        "TypeScript",
        "React",
        "PostgreSQL",
        "Supabase",
        "Kubernetes",
        "gRPC",
        "Rust",
      ],
    },
    {
      id: "edu-2",
      date: "2026",
      title: "Informatyka - zaoczne studia magisterskie",
      description:
        "Rozpocząłem studia magisterskie w formie zaocznej w marcu 2026 roku na politechnice Świętokrzyskiej.",
      tags: [""],
    },
    {
      id: "career-6",
      date: "teraz",
      title: "Współpraca z Twoim przedsiębiorstwem?",
      description: "",
      tags: [""],
    },
  ],

  projects: [
    {
      id: 1,
      title: "Platforma do korepetycji",
      subtitle: "Projekt startupowy",
      description:
        "Platforma do korepetycji z inteligentną wyszukiwarką, systemem płatności, tablicą interaktywną, chatem głosowym i geolokacją.",
      year: "teraz",
    },
    {
      id: 2,
      title: "Portfolio",
      subtitle: "Strona osobista",
      description:
        "Interaktywne portfolio z niestandardowymi animacjami scroll, efektem typewriter i custom kursorem. Zbudowane w React + TypeScript z Tailwind CSS.",
    },
    {
      id: 3,
      title: "Praca dyplomowa",
      subtitle:
        "Detekcja mas patologicznych z wykorzystaniem uczenia transferowego",
      description:
        "Model uczenia maszynowego stworzony z wykorzystaniem uczenia transferowego do wykrywania mas patologicznych w obrazach RTG z wykorzystaniem bibliotek Pythona takich jak TensorFlow i Keras.",
    },
    {
      id: 4,
      title: "Aplikacja do zapisu treningu siłowego",
      subtitle: "Aplikacja mobilna",
      description:
        "Aplikacja mobilna do zapisu treningu siłowego z funkcjami planowania i śledzenia postępów. Zbudowana z React Native, MongoDB, Fastify i Nativewind.",
    },
    {
      id: 5,
      title: "System alertów o tanich lotach",
      subtitle: "Aplikacja desktopowa",
      description:
        "System do znajdowania tanich lotów i wysyłania powiadomień o promocjach SMS. Zbudowany w Python i Twilio.",
    },
  ],
};

const translations: Record<Lang, Translations> = { en, pl };

// ─── Context ─────────────────────────────────────────────────────────────────

const I18nContext = createContext<I18nContextValue | null>(null);

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}

function detectLang(): Lang {
  const browserLang = navigator.language || navigator.languages?.[0] || "en";
  return browserLang.startsWith("pl") ? "pl" : "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(detectLang);

  const toggleLang = useCallback(() => {
    setLang((prev) => (prev === "en" ? "pl" : "en"));
  }, []);

  const value: I18nContextValue = {
    lang,
    toggleLang,
    t: translations[lang],
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
