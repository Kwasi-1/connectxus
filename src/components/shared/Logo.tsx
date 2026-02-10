import logoWhite from "@/assets/connect_small_logo_white.png";
import logoblack from "@/assets/connect_small_logo.png";
import { useTheme } from "@/lib/theme";
import { Link } from "react-router-dom";

interface LogoProps {
  className?: string;
}

function Logo({ className }: LogoProps) {
  const { theme } = useTheme();
  return (
    <Link to="/" className="flex items-center justify-center">
      <img
        src={theme === "dark" ? logoWhite : logoblack}
        alt="Connectxus Logo"
        className={className}
      />
    </Link>
  );
}
export default Logo;
