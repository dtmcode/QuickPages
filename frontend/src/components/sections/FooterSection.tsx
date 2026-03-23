'use client';

import Link from 'next/link';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

interface FooterSectionProps {
  config?: {
    companyName?: string;
    description?: string;
    columns?: FooterColumn[];
    socialLinks?: {
      facebook?: string;
      twitter?: string;
      instagram?: string;
      linkedin?: string;
      github?: string;
    };
    copyrightText?: string;
  };
}

export function FooterSection({ config }: FooterSectionProps) {
  const {
    companyName = 'Your Company',
    description = 'Building amazing products',
    columns = [],
    socialLinks = {},
    copyrightText,
  } = config || {};

  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div>
            <h3 className="mb-4 text-lg font-bold">{companyName}</h3>
            <p className="mb-4 text-sm text-muted-foreground">{description}</p>
            
            {/* Social Links */}
            {Object.keys(socialLinks).length > 0 && (
              <div className="flex gap-3">
                {socialLinks.facebook && (
                  <a href={socialLinks.facebook} className="text-2xl hover:text-primary">
                    📘
                  </a>
                )}
                {socialLinks.twitter && (
                  <a href={socialLinks.twitter} className="text-2xl hover:text-primary">
                    🐦
                  </a>
                )}
                {socialLinks.instagram && (
                  <a href={socialLinks.instagram} className="text-2xl hover:text-primary">
                    📷
                  </a>
                )}
                {socialLinks.linkedin && (
                  <a href={socialLinks.linkedin} className="text-2xl hover:text-primary">
                    💼
                  </a>
                )}
                {socialLinks.github && (
                  <a href={socialLinks.github} className="text-2xl hover:text-primary">
                    🔗
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Links Columns */}
          {columns.map((column, index) => (
            <div key={index}>
              <h4 className="mb-4 font-semibold">{column.title}</h4>
              <ul className="space-y-2">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          {copyrightText || `© ${currentYear} ${companyName}. All rights reserved.`}
        </div>
      </div>
    </footer>
  );
}