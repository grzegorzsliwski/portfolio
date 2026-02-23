import { useEffect, useCallback, type CSSProperties } from "react";

interface LightboxProps {
  src: string;
  alt: string;
  onClose: () => void;
}

export function Lightbox({ src, alt, onClose }: LightboxProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  const overlayStyle: CSSProperties = {
    position: "fixed",
    inset: 0,
    zIndex: 10001,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    backdropFilter: "blur(8px)",
    cursor: "zoom-out",
    animation: "lightbox-fade-in 0.25s ease",
  };

  const imgStyle: CSSProperties = {
    maxWidth: "90vw",
    maxHeight: "90vh",
    objectFit: "contain",
    borderRadius: 0,
    boxShadow: "0 8px 40px rgba(0, 0, 0, 0.6)",
    animation: "lightbox-scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
  };

  const closeBtnStyle: CSSProperties = {
    position: "absolute",
    top: "1.5rem",
    right: "1.5rem",
    background: "none",
    border: "none",
    color: "#fff",
    fontSize: "2rem",
    cursor: "pointer",
    lineHeight: 1,
    padding: "0.5rem",
    opacity: 0.7,
    transition: "opacity 0.2s",
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <button
        style={closeBtnStyle}
        onClick={onClose}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
        aria-label="Close lightbox"
      >
        ✕
      </button>
      <img
        src={src}
        alt={alt}
        style={imgStyle}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
