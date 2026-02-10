import { useEffect } from "react";

interface LightModeWrapperProps {
  children: React.ReactNode;
}

/**
 * Wrapper component that forces light mode for public pages
 * Ensures landing and public pages always display in light mode
 */
export const LightModeWrapper: React.FC<LightModeWrapperProps> = ({
  children,
}) => {
  useEffect(() => {
    const root = window.document.documentElement;
    const originalClass = root.className;

    // Force light mode
    root.classList.remove("dark");
    root.classList.add("light");

    // Cleanup: restore original theme when component unmounts
    return () => {
      const stored = localStorage.getItem("campus-theme");
      if (stored === "dark") {
        root.classList.remove("light");
        root.classList.add("dark");
      }
    };
  }, []);

  return <>{children}</>;
};
