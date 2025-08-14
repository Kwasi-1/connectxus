
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const FooterLinks = () => {
  const navigate = useNavigate();

  const footerLinks = [
    { label: 'About', href: '/about' },
    { label: 'Help', href: '/help' },
    { label: 'Terms', href: '/terms' },
    { label: 'Privacy', href: '/privacy' },
    { label: 'Contact', href: '/contact' },
    { label: 'Download', href: '/download' },
  ];

  return (
    <footer className="border-t border-gray-800 py-6">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-wrap justify-center items-center gap-4 text-sm text-gray-500">
          {footerLinks.map((link, index) => (
            <div key={link.href} className="flex items-center">
              <Button
                variant="link"
                className="text-gray-500 hover:text-gray-300 p-0 h-auto text-sm"
                onClick={() => navigate(link.href)}
              >
                {link.label}
              </Button>
              {index < footerLinks.length - 1 && (
                <span className="ml-4 text-gray-700">·</span>
              )}
            </div>
          ))}
        </div>
        <div className="text-center mt-4">
          <p className="text-gray-600 text-sm">© 2025 Campus Vibe from Meta</p>
        </div>
      </div>
    </footer>
  );
};
