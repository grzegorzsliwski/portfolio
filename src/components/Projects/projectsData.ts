import portfolioImg from "../../assets/portfolio.png";
import pracaDyplomowaImg from "../../assets/praca-dyplomowa.png";
import pracaDyplomowa2Img from "../../assets/praca-dyplomowa-2.png";
import platformaTreningowa1Img from "../../assets/platforma-treningowa-1.jpg";
import platformaTreningowa2Img from "../../assets/platforma-treningowa-2.jpg";
import platformaTreningowa3Img from "../../assets/platforma-treningowa-3.jpg";
import wyszukiwarkaLotowImg from "../../assets/wyszukiwarka-lotow.png";

export interface Project {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  images: string[];
  year: string;
  link?: string;
  github?: string;
}

export const projectsData: Project[] = [
  {
    id: 1,
    title: "Tutoring Platform",
    subtitle: "Startup Project",
    description:
      "Tutoring platform with intelligent search, payment system, interactive whiteboard, voice chat and geolocation.",
    tags: ["Supabase", "Node.js", "React", "PostgreSQL", "Stripe"],
    images: [],
    year: "now",
    link: "#",
    github: "#",
  },
  {
    id: 2,
    title: "Portfolio",
    subtitle: "Personal Website",
    description:
      "Interactive portfolio with custom scroll animations, typewriter effect and a custom cursor. Built with React + TypeScript and Tailwind CSS.",
    tags: ["React", "TypeScript", "Tailwind CSS", "Vite"],
    images: [portfolioImg],
    year: "2026",
    link: "#",
    github: "#",
  },
  {
    id: 3,
    title: "Diploma Thesis",
    subtitle: "Pathological mass detection using transfer learning",
    description:
      "Machine learning model built with transfer learning to detect pathological masses in X-ray images using Python libraries such as TensorFlow and Keras.",
    tags: ["Python", "TensorFlow", "Keras", "NIH Chest X-ray Dataset"],
    images: [pracaDyplomowaImg, pracaDyplomowa2Img],
    year: "2025",
    link: "#",
    github: "#",
  },
  {
    id: 4,
    title: "Strength Training Logger",
    subtitle: "Mobile Application",
    description:
      "Mobile application for logging strength training sessions with workout planning and progress tracking features. Built with React Native, MongoDB, Fastify and Nativewind.",
    tags: ["React Native", "MongoDB", "Nativewind", "Fastify"],
    images: [
      platformaTreningowa1Img,
      platformaTreningowa2Img,
      platformaTreningowa3Img,
    ],
    year: "2024",
    link: "#",
    github: "#",
  },
  {
    id: 5,
    title: "Cheap Flight Alert System",
    subtitle: "Desktop Application",
    description:
      "System for finding cheap flights and sending promotional SMS notifications. Built with Python and Twilio.",
    tags: ["Python", "Twilio"],
    images: [wyszukiwarkaLotowImg],
    year: "2024",
    link: "#",
    github: "#",
  },
];
