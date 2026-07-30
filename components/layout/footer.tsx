"use client";

import Link from "next/link";
import { Github, Twitter, Linkedin, Mail, MessageCircle } from "lucide-react";

const FOOTER_LINKS = [
  {
    title: "Platform",
    links: [
      { label: "Mission", href: "/#goals" },
      { label: "Data Types", href: "/#why" },
      { label: "Contribute", href: "/#waitlist" },
      { label: "Discord", href: "https://discord.gg/QfDNSdvYw", external: true },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Submissions", href: "/submissions" },
      { label: "Wallet", href: "/wallet" },
      { label: "Profile", href: "/profile" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/privacy" },
      { label: "Data Consent", href: "/settings/legal" },
    ],
  },
];

const SOCIAL_LINKS = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Github, href: "#", label: "GitHub" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: MessageCircle, href: "https://discord.gg/QfDNSdvYw", label: "Discord" },
  { icon: Mail, href: "#", label: "Email" },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-white/[0.06] mt-8 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#39e0ff]/[0.03] rounded-full blur-[120px]" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#b27bff]/[0.03] rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-6 sm:px-8 py-14">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <div className="text-xl font-extrabold uppercase tracking-[0.14em] text-white mb-3">
              AFRID
            </div>
            <p className="max-w-xs text-sm text-muted leading-relaxed">
              Powered by ALAD.ai. Share your reality, represent your culture,
              and earn by building the foundation for African AI.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-muted transition-all hover:border-[#39e0ff]/30 hover:text-[#39e0ff] hover:bg-[#39e0ff]/[0.06]"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_LINKS.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/80">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted transition-colors hover:text-white"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-muted transition-colors hover:text-white"
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

        <div className="mt-12 flex flex-col items-center gap-4">
          <div className="h-px w-full max-w-xs bg-gradient-to-r from-transparent via-[#39e0ff]/30 to-transparent" />
          <p className="text-sm text-muted">
            © {new Date().getFullYear()} AFRID. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
