import { useState, useEffect } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import { cn } from '../../../../lib/utils';

interface NavbarProps {
  className?: string;
}

const navLinks = [
  { name: 'Programs', href: '#programs' },
  { name: 'How It Works', href: '#how-it-works' },
  { name: 'Teachers', href: '#teachers' },
  { name: 'FAQ', href: '#faq' },
];

const sectionIds = navLinks.map((link) => link.href.replace('#', ''));

export function Navbar({ className }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');

  // Track scroll state for navbar background
  useEffect(() => {
    const heroObserver = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsScrolled(!entry.isIntersecting);
      },
      { threshold: 0.1 },
    );

    const heroElement = document.getElementById('hero');
    if (heroElement) {
      heroObserver.observe(heroElement);
    }

    return () => heroObserver.disconnect();
  }, []);

  // Track active section for highlighting
  useEffect(() => {
    const sectionObservers: IntersectionObserver[] = [];

    const observerOptions = {
      rootMargin: '-50% 0px -50% 0px',
      threshold: 0,
    };

    sectionIds.forEach((id) => {
      const observer = new IntersectionObserver((entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setActiveSection(id);
        }
      }, observerOptions);

      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
        sectionObservers.push(observer);
      }
    });

    return () => {
      sectionObservers.forEach((obs) => obs.disconnect());
    };
  }, []);

  // Close mobile menu when clicking a link
  const handleMobileLinkClick = (href: string) => {
    setIsMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle desktop link clicks with smooth scroll
  const handleDesktopLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'glass-nav shadow-sm py-3'
          : 'bg-transparent py-5',
        className,
      )}
    >
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a
            href="/"
            className="flex items-center gap-3 group"
          >
            <div className="relative">
              {/* Logo placeholder - using text-based logo for now */}
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl group-hover:bg-primary-700 transition-colors">
                ق
              </div>
            </div>
            <span
              className={cn(
                'font-semibold text-lg transition-colors',
                isScrolled ? 'text-gray-900' : 'text-white',
              )}
            >
              Quran Discipline Academy
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = activeSection === link.href.replace('#', '');
              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleDesktopLinkClick(e, link.href)}
                  className={cn(
                    'font-medium transition-colors relative py-2',
                    isScrolled
                      ? isActive
                        ? 'text-primary'
                        : 'text-gray-600 hover:text-gray-900'
                      : isActive
                        ? 'text-secondary-400'
                        : 'text-primary-100 hover:text-white',
                  )}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary-400 rounded-full" />
                  )}
                </a>
              );
            })}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <a
              href="/login"
              className={cn(
                'font-medium transition-colors',
                isScrolled ? 'text-gray-600 hover:text-gray-900' : 'text-white hover:text-primary-100',
              )}
            >
              Sign In
            </a>
            <a
              href="/book"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-secondary-600 text-white font-medium rounded-lg hover:bg-secondary-700 transition-all hover:-translate-y-0.5 hover:shadow-md min-h-[44px]"
            >
              Book Free Call
              <ChevronDown className="w-4 h-4" />
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={cn(
              'lg:hidden p-2 rounded-lg transition-colors',
              isScrolled
                ? 'text-gray-600 hover:bg-gray-100'
                : 'text-white hover:bg-white/10',
            )}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            'lg:hidden fixed inset-0 bg-primary-900 z-50 transition-transform duration-300 ease-in-out pt-24 px-6',
            isMobileMenuOpen
              ? 'translate-x-0'
              : 'translate-x-full pointer-events-none',
          )}
        >
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute top-6 right-6 p-2 text-white hover:bg-white/10 rounded-lg"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex flex-col gap-6">
            {navLinks.map((link) => {
              const isActive = activeSection === link.href.replace('#', '');
              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => handleMobileLinkClick(link.href)}
                  className={cn(
                    'text-xl font-medium transition-colors py-2 border-b border-primary-800',
                    isActive ? 'text-secondary-400' : 'text-primary-100 hover:text-white',
                  )}
                >
                  {link.name}
                </a>
              );
            })}

            <div className="flex flex-col gap-4 pt-6">
              <a
                href="/login"
                className="text-xl font-medium text-primary-100 hover:text-white transition-colors py-3 text-center"
              >
                Sign In
              </a>
              <a
                href="/book"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-secondary-600 text-white font-medium rounded-lg hover:bg-secondary-700 transition-colors"
              >
                Book Free Call
                <ChevronDown className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
