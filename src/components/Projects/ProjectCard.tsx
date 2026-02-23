import { useRef, useState, useEffect, type CSSProperties } from "react";
import type { Project } from "./projectsData";
import { ScrollRevealText } from "../ScrollRevealText";
import { useThemeColors } from "../../ThemeContext";
import { useCursor } from "../CursorOverlay";

interface ProjectCardProps {
  project: Project;
  index: number;
  onImageClick: (src: string, alt: string) => void;
}

export function ProjectCard({ project, index, onImageClick }: ProjectCardProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { hiddenColor, scrollColor } = useThemeColors();
  const { setSidebarHover } = useCursor();

  // Intersection Observer for reveal animation
  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1, rootMargin: "-30px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const rowStyle: CSSProperties = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? "translateX(0)" : "translateX(-60px)",
    transition: `opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.07}s, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.07}s`,
  };

  return (
    <div
      ref={rowRef}
      className={`archive-row group ${isHovered ? "archive-row--active" : ""}`}
      style={rowStyle}
      onMouseEnter={() => setSidebarHover(true)}
      onMouseLeave={() => { setIsHovered(false); setSidebarHover(false); }}
    >
      {/* Info column: year above title */}
      <div className="archive-row__info" onMouseEnter={() => setIsHovered(true)}>
        <ScrollRevealText
          text={String(project.year)}
          className="archive-row__year-text"
          hiddenColor={hiddenColor}
          revealedColor={scrollColor}
        />
        <ScrollRevealText
          text={project.title}
          className="archive-row__title-text"
          hiddenColor={hiddenColor}
          revealedColor={scrollColor}
        />
      </div>

      {/* Images + Description swap area */}
      <div className="archive-row__swap">
        <div className="archive-row__images" onMouseEnter={() => setIsHovered(false)}>
          {project.images.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`${project.title} screenshot ${i + 1}`}
              className="archive-row__thumb"
              loading="lazy"
              onClick={(e) => {
                e.stopPropagation();
                onImageClick(src, `${project.title} screenshot ${i + 1}`);
              }}
            />
          ))}
        </div>
        <div className="archive-row__media">
          <p className="archive-row__desc">{project.description}</p>
        </div>
      </div>
    </div>
  );
}
