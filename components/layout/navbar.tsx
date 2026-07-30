"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/metadata-context";
import { Menu, X, ChevronDown, LayoutDashboard, Inbox, Wallet, User as UserIcon, LogOut } from "lucide-react";
import AfridLogo from "./afrid-logo";

const PUBLIC_LINKS = [
  { href: "/#goals", label: "Mission" },
  { href: "/#why", label: "Data" },
  { href: "https://discord.gg/QfDNSdvYw", label: "Discord", external: true },
  { href: "/#waitlist", label: "Contribute" },
];

const AUTH_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/submissions", label: "Submissions", icon: Inbox },
  { href: "/wallet", label: "Wallet", icon: Wallet },
  { href: "/profile", label: "Profile", icon: UserIcon },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const displayName = user?.displayName || user?.email?.split("@")[0] || "User";
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? "glass-strong shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <nav className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0 transition-transform hover:scale-105">
          <AfridLogo className="h-9" />
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {PUBLIC_LINKS.map((link) => (
            link.external ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/[0.04]"
              >
                {link.label}
                <span className="absolute bottom-0 left-1/2 h-px w-0 bg-gradient-to-r from-[#39e0ff] to-[#b27bff] transition-all duration-300 group-hover:w-3/4 group-hover:left-[12.5%]" />
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="group relative px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/[0.04]"
              >
                {link.label}
                <span className="absolute bottom-0 left-1/2 h-px w-0 bg-gradient-to-r from-[#39e0ff] to-[#b27bff] transition-all duration-300 group-hover:w-3/4 group-hover:left-[12.5%]" />
              </Link>
            )
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {user ? (
            <div ref={userMenuRef} className="relative hidden sm:block">
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className="group flex h-9 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 text-sm font-medium text-white hover:border-[rgba(57, 224, 255,0.3)] hover:bg-white/[0.06] transition-all"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#39e0ff] to-[#b27bff] text-xs font-bold text-[#03040d] transition-transform group-hover:scale-110">
                  {initials}
                </span>
                <span className="max-w-[100px] truncate">{displayName}</span>
                <ChevronDown size={14} className={`text-muted transition-transform duration-300 ${userMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-60 rounded-2xl glass-strong p-2 shadow-2xl overflow-hidden">
                  <div className="shimmer-line" />
                  <div className="px-3 py-2.5 mb-1">
                    <p className="text-xs text-muted">Signed in as</p>
                    <p className="text-sm font-semibold text-white truncate">{user?.email}</p>
                  </div>
                  <div className="h-px bg-white/[0.06] my-1" />
                  {AUTH_LINKS.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                        pathname === href
                          ? "bg-gradient-to-r from-[#39e0ff]/10 to-transparent text-white"
                          : "text-muted hover:bg-white/[0.04] hover:text-white"
                      }`}
                    >
                      <Icon size={16} className={`transition-colors ${pathname === href ? "text-[#39e0ff]" : "text-muted group-hover:text-[#39e0ff]"}`} />
                      {label}
                      {pathname === href && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#39e0ff]" />}
                    </Link>
                  ))}
                  <div className="h-px bg-white/[0.06] my-1" />
                  <button
                    onClick={() => signOut()}
                    className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted hover:bg-[#ff6b6b]/10 hover:text-[#ff6b6b] transition-all"
                  >
                    <LogOut size={16} className="text-muted group-hover:text-[#ff6b6b] transition-colors" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/login"
                className="h-9 inline-flex items-center rounded-full px-4 text-sm font-medium text-white/80 hover:text-white transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="btn-glow group h-9 inline-flex items-center rounded-full bg-gradient-to-r from-[#39e0ff] to-[#b27bff] px-5 text-sm font-bold text-[#03040d] transition-all hover:scale-105 hover:shadow-[0_8px_24px_rgba(57,224,255,0.3)]"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden h-9 w-9 inline-flex items-center justify-center rounded-lg text-white hover:text-[#39e0ff] hover:bg-white/[0.06] transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden glass-strong border-t border-white/[0.06] overflow-hidden">
          <div className="shimmer-line" />
          <div className="px-4 py-4 flex flex-col gap-1">
            {user ? (
              <>
                <div className="mb-2 flex items-center gap-3 px-3 py-3 rounded-xl bg-white/[0.03]">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#39e0ff] to-[#b27bff] text-sm font-bold text-[#03040d]">
                    {initials}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                    <p className="text-xs text-muted truncate">{user?.email}</p>
                  </div>
                </div>
                <div className="h-px bg-white/[0.06] my-1" />
                {AUTH_LINKS.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className={`group flex items-center gap-3 px-3 py-3 text-sm rounded-xl transition-all ${
                      pathname === href ? "bg-[#39e0ff]/10 text-white" : "text-white/80 hover:bg-white/[0.04]"
                    }`}
                  >
                    <Icon size={18} className={pathname === href ? "text-[#39e0ff]" : "text-muted group-hover:text-[#39e0ff]"} />
                    {label}
                  </Link>
                ))}
                <div className="h-px bg-white/[0.06] my-1" />
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-3 px-3 py-3 text-left text-sm text-[#ff6b6b] hover:bg-[#ff6b6b]/10 rounded-xl transition-colors"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                {PUBLIC_LINKS.map((link) => (
                  link.external ? (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-3 text-sm font-medium text-white/80 hover:text-white hover:bg-white/[0.04] rounded-xl transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="px-3 py-3 text-sm font-medium text-white/80 hover:text-white hover:bg-white/[0.04] rounded-xl transition-colors"
                    >
                      {link.label}
                    </Link>
                  )
                ))}
                <div className="h-px bg-white/[0.06] my-2" />
                <Link
                  href="/login"
                  className="px-3 py-3 text-sm font-medium text-white/80 hover:text-white hover:bg-white/[0.04] rounded-xl transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="mt-1 h-11 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#39e0ff] to-[#b27bff] px-4 text-sm font-bold text-[#03040d]"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
