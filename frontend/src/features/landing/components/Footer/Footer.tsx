import { Facebook, Instagram, Mail, MapPin, Twitter, Youtube } from 'lucide-react';
import type { FooterContent } from '../../types/landing.types';

const socialIcons = {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
};

const DEFAULT_CONTENT: FooterContent = {
  brandName: 'Quran Discipline Academy',
  brandDescription: 'Discipline Transforms. Consistency Wins. Master the Quran with qualified teachers and proven methods.',
  tagline: 'Discipline Transforms. Consistency Wins.',
  programLinks: [
    { name: 'Quran Memorization', href: '#programs' },
    { name: 'Tajweed & Recitation', href: '#programs' },
    { name: 'Islamic Studies', href: '#programs' },
    { name: 'Tafsir', href: '#programs' },
  ],
  companyLinks: [
    { name: 'About Us', href: '#about' },
    { name: 'Our Teachers', href: '#teachers' },
    { name: 'FAQ', href: '#faq' },
    { name: 'Contact', href: '#contact' },
  ],
  contactEmail: 'info@qurandiscipline.academy',
  contactLocation: 'Online Worldwide',
  socialLinks: {
    facebook: 'https://www.facebook.com/qurandiscipline.academy',
    instagram: 'https://www.instagram.com/qurandiscipline.academy',
    twitter: 'https://www.twitter.com/qurandiscipline.academy',
    youtube: 'https://www.youtube.com/@qurandiscipline.academy',
  },
};

interface FooterProps {
  content?: FooterContent;
}

export function Footer({ content }: FooterProps) {
  const currentYear = new Date().getFullYear();

  // Use CMS content if available, otherwise use defaults
  const brandName = content?.brandName || DEFAULT_CONTENT.brandName;
  const brandDescription = content?.brandDescription || DEFAULT_CONTENT.brandDescription;
  const programLinks = content?.programLinks?.length ? content.programLinks : DEFAULT_CONTENT.programLinks;
  const companyLinks = content?.companyLinks?.length ? content.companyLinks : DEFAULT_CONTENT.companyLinks;
  const contactEmail = content?.contactEmail || DEFAULT_CONTENT.contactEmail;
  const contactLocation = content?.contactLocation || DEFAULT_CONTENT.contactLocation;
  const socialLinks = content?.socialLinks || DEFAULT_CONTENT.socialLinks;

  const handleSocialClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <footer className="bg-navy-900 text-white">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Column 1: Brand */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold mb-3">{brandName}</h3>
            <p className="text-navy-200 text-sm mb-6 leading-relaxed">
              {brandDescription}
            </p>

            {/* Social Icons */}
            <div className="flex gap-3">
              {(['facebook', 'instagram', 'twitter', 'youtube'] as const).map((platform) => {
                const Icon = socialIcons[
                  platform.charAt(0).toUpperCase() + platform.slice(1) as keyof typeof socialIcons
                ];
                return (
                  <button
                    key={platform}
                    onClick={() => handleSocialClick(socialLinks[platform])}
                    className="w-10 h-10 rounded-full bg-navy-800 hover:bg-gold-600 flex items-center justify-center transition-all duration-200"
                    aria-label={`Visit our ${platform} page`}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Column 2: Programs */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Programs</h4>
            <ul className="space-y-3">
              {programLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-navy-200 hover:text-gold-400 transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-navy-200 hover:text-gold-400 transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gold-400 flex-shrink-0 mt-0.5" />
                <div>
                  <a
                    href={`mailto:${contactEmail}`}
                    className="text-white hover:text-gold-400 transition-colors text-sm"
                  >
                    {contactEmail}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gold-400 flex-shrink-0 mt-0.5" />
                <p className="text-navy-200 text-sm">{contactLocation}</p>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-navy-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-navy-300">
              © {currentYear} {brandName}. All rights reserved.
            </p>

            <div className="flex gap-6 text-sm">
              <a
                href="#"
                className="text-navy-300 hover:text-gold-400 transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-navy-300 hover:text-gold-400 transition-colors"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
