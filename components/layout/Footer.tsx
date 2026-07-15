import Link from "next/link";
import { Printer, Mail, Phone, MapPin, ArrowRight } from "lucide-react";

// Inline SVG social icons (lucide-react v1 dropped brand icons)
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
  </svg>
);
const FacebookIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const TwitterXIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
  </svg>
);

const footerLinks = {
  products: [
    { label: "T-Shirts & Polos", href: "/products?category=TSHIRT" },
    { label: "Hoodies", href: "/products?category=HOODIE" },
    { label: "Mugs & Drinkware", href: "/products?category=MUG" },
    { label: "Visiting Cards", href: "/products?category=VISITING_CARD" },
    { label: "Banners & Flex", href: "/products?category=BANNER" },
    { label: "Stickers", href: "/products?category=STICKER" },
  ],
  services: [
    { label: "Online Design Tool", href: "/products" },
    { label: "Batch Orders", href: "/batch" },
    { label: "Track Your Order", href: "/track" },
    { label: "Bulk Pricing", href: "/products" },
    { label: "WhatsApp Support", href: `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/[^0-9]/g, "") ?? "919876543210"}` },
  ],
  company: [
    { label: "About Printora", href: "/about" },
    { label: "My Account", href: "/dashboard" },
    { label: "Create Batch Order", href: "/batch/create" },
    { label: "Refund Policy", href: "/refund-policy" },
    { label: "Privacy Policy", href: "/privacy-policy" },
  ],
};

const socialLinks = [
  { Icon: InstagramIcon, href: "#", label: "Instagram" },
  { Icon: FacebookIcon, href: "#", label: "Facebook" },
  { Icon: TwitterXIcon, href: "#", label: "Twitter/X" },
  { Icon: YoutubeIcon, href: "#", label: "YouTube" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#111827] text-gray-400">
      {/* CTA Banner */}
      <div className="bg-[#7C3AED]">
        <div className="section-container py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2
              className="text-2xl md:text-3xl font-bold text-white mb-2"
              style={{ fontFamily: "var(--font-jakarta)" }}
            >
              Ready to print? Let&apos;s go. 🚀
            </h2>
            <p className="text-[#EDE9FE] text-base">
              Your idea. Our craft. Every time.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link href="/products" className="btn-gold">
              Browse Products
            </Link>
            <Link href="/batch/create" className="btn-ghost-white">
              Batch Orders
            </Link>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="section-container py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4 group w-fit">
              <div className="w-9 h-9 bg-[#7C3AED] rounded-xl flex items-center justify-center shadow-md">
                <Printer className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <span
                className="text-white font-bold text-xl"
                style={{ fontFamily: "var(--font-jakarta)" }}
              >
                Printora
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-xs">
              Vijayawada&apos;s premier custom printing store. T-shirts, banners, visiting cards,
              and more — designed by you, crafted by us.
            </p>

            {/* Contact */}
            <div className="space-y-3 mb-6">
              <a
                href="tel:+919876543210"
                className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-[#A78BFA] transition-colors group"
              >
                <Phone className="w-4 h-4 text-[#7C3AED] group-hover:text-[#A78BFA]" />
                +91 98765 43210
              </a>
              <a
                href="mailto:hello@printora.in"
                className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-[#A78BFA] transition-colors group"
              >
                <Mail className="w-4 h-4 text-[#7C3AED] group-hover:text-[#A78BFA]" />
                hello@printora.in
              </a>
              <div className="flex items-start gap-2.5 text-sm text-gray-400">
                <MapPin className="w-4 h-4 text-[#7C3AED] mt-0.5 flex-shrink-0" />
                Vijayawada, Andhra Pradesh, India
              </div>
            </div>

            {/* Social */}
            <div className="flex items-center gap-3">
              {socialLinks.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:bg-[#7C3AED]/20 hover:text-[#A78BFA] transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4" style={{ fontFamily: "var(--font-jakarta)" }}>
              Products
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.products.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-[#A78BFA] transition-colors flex items-center gap-1.5 group"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#7C3AED]" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4" style={{ fontFamily: "var(--font-jakarta)" }}>
              Services
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.services.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-[#A78BFA] transition-colors flex items-center gap-1.5 group"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#7C3AED]" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4" style={{ fontFamily: "var(--font-jakarta)" }}>
              Company
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-[#A78BFA] transition-colors flex items-center gap-1.5 group"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#7C3AED]" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="section-container py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            © {year} Printora. All rights reserved. Made with ❤️ in Vijayawada.
          </p>
          <div className="flex items-center gap-4 text-xs">
            <Link href="/privacy-policy" className="text-gray-500 hover:text-gray-300 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/refund-policy" className="text-gray-500 hover:text-gray-300 transition-colors">
              Refund Policy
            </Link>
            <Link href="/sitemap.xml" className="text-gray-500 hover:text-gray-300 transition-colors">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
