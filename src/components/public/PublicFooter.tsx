import React from "react";
import { Link } from "react-router-dom";

const footerLinks = [
  { name: "About", path: "/about" },
  { name: "Terms & Conditions", path: "/terms" },
  { name: "Privacy Policy", path: "/privacy" },
  { name: "Account Deletion", path: "/account/delete" },
  { name: "Cookies Policy", path: "/cookies" },
  { name: "Contact Us", path: "/contact" },
  { name: "Download App", path: "/download" },
];

export const PublicFooter: React.FC = () => {
  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {footerLinks.map((link, index) => (
            <React.Fragment key={link.path}>
              <Link
                to={link.path}
                className="hover:text-foreground transition-colors duration-200 hover:underline"
              >
                {link.name}
              </Link>
              {index < footerLinks.length - 1 && (
                <span className="hidden sm:inline text-border">·</span>
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="text-center mt-6 text-xs text-muted-foreground">
          <p>© 2024 Campus Connect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
