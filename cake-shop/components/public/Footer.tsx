import Link from "next/link";
import Image from "next/image";
import { Instagram, Facebook, Twitter, Youtube } from "lucide-react";
import type { IFooter } from "@/lib/models/Footer";

interface FooterProps {
  data: IFooter | null;
}

const socialIcons: Record<string, React.ElementType> = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  youtube: Youtube,
};

export function Footer({ data }: FooterProps) {
  const sections = data?.sections?.sort((a, b) => a.order - b.order) || [];
  const socialLinks = data?.socialLinks || [];
  const copyrightText =
    data?.copyrightText || `© ${new Date().getFullYear()} Sweet Delights Bakery. All rights reserved.`;

  return (
    <footer className="border-t bg-cake-dark text-white/90">
      <div className="container-custom py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            {data?.logo?.imageUrl ? (
              <Image
                src={data.logo.imageUrl}
                alt={data.logo.altText || "Sweet Delights"}
                width={160}
                height={48}
                className="h-10 w-auto brightness-0 invert"
              />
            ) : (
              <span className="font-heading text-2xl font-bold text-cake-gold">
                Sweet Delights
              </span>
            )}
            <p className="text-sm leading-relaxed text-white/70">
              {data?.description ||
                "Handcrafted premium cakes and pastries made with love for every special occasion."}
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const Icon = socialIcons[social.platform.toLowerCase()] || Instagram;
                return (
                  <a
                    key={social.platform}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-white/10 p-2 transition-colors hover:bg-cake-gold"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Footer Sections */}
          {sections.map((section) => (
            <div key={section.title} className="space-y-4">
              <h3 className="font-heading text-lg font-semibold text-cake-gold">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.isExternal ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-white/70 transition-colors hover:text-cake-gold"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-white/70 transition-colors hover:text-cake-gold"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div className="mt-12 border-t border-white/10 pt-6 text-center">
          <p className="text-sm text-white/50">{copyrightText}</p>
        </div>
      </div>
    </footer>
  );
}
