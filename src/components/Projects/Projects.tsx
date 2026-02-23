import { useState } from "react";
import { TextReveal } from "../TextReveal";
import { projectsData } from "./projectsData";
import { ProjectCard } from "./ProjectCard";
import { Lightbox } from "../Lightbox";
import { useThemeColors } from "../../ThemeContext";
import { useI18n } from "../../I18nContext";

export function Projects() {
  const { hiddenColor, scrollColor } = useThemeColors();
  const { t } = useI18n();
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  return (
    <section id="projects" className="relative w-full py-32">
      {/* Section header */}
      <div className="max-w-[80rem] mx-auto px-6 md:px-24" style={{ marginBottom: '4rem' }}>
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
          frontText={t.projectsSubheading}
          frontClassName="text-3xl md:text-5xl font-bold leading-tight"
          hiddenColor={hiddenColor}
          scrollColor={scrollColor}
          revealed={
            <span className="text-3xl md:text-5xl font-bold leading-tight text-white">
              {t.projectsSubheading}
            </span>
          }
        />
      </div>

      {/* Archive list – full width, inner content has safe margin */}
      <div className="archive-list">
          {projectsData.map((project, i) => {
            const translated = t.projects.find((p) => p.id === project.id);
            const merged = translated ? { ...project, ...translated } : project;
            return (
              <ProjectCard
                key={project.id}
                project={merged}
                index={i}
                onImageClick={(src, alt) => setLightbox({ src, alt })}
              />
            );
          })}
      </div>

      {lightbox && (
        <Lightbox
          src={lightbox.src}
          alt={lightbox.alt}
          onClose={() => setLightbox(null)}
        />
      )}
    </section>
  );
}
