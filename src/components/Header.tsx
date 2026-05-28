"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { LogOut, User, Menu, X, Cpu, Users, Award, ShieldAlert, Briefcase } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check auth status
    const user = api.auth.getCurrentUser();
    setCurrentUser(user);
    
    // Add custom listener for custom login events (to react instantly to sign in/out)
    const handleAuthChange = () => {
      setCurrentUser(api.auth.getCurrentUser());
    };
    window.addEventListener("auth-state-change", handleAuthChange);
    return () => window.removeEventListener("auth-state-change", handleAuthChange);
  }, [pathname]);

  const handleLogout = () => {
    api.auth.logout();
    setCurrentUser(null);
    window.dispatchEvent(new Event("auth-state-change"));
    router.push("/");
  };

  const navLinks = [
    { href: "/jobs", label: "Jobs", icon: Briefcase },
    { href: "/robotics", label: "Robotics Hub", icon: Cpu },
    { href: "/startups", label: "Startup Teams", icon: Users },
    { href: "/internships", label: "Internships", icon: Award },
  ];

  const getDashboardLink = () => {
    if (!currentUser) return "/auth";
    if (currentUser.role === "admin") return "/admin";
    if (currentUser.role === "company") return "/company";
    return "/candidate";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-zinc-950/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-violet-600 p-[1.5px] transition-transform duration-300 group-hover:scale-105">
            <div className="flex h-full w-full items-center justify-center rounded-[7px] bg-zinc-950 font-black text-white text-base">
              IT
            </div>
            <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-tr from-blue-600 to-violet-600 opacity-30 blur group-hover:opacity-60 transition duration-300"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black tracking-wider text-white uppercase sm:text-base">
              Talent Platform
            </span>
            <span className="text-[10px] font-bold text-green-500 tracking-widest uppercase -mt-1">
              Karakalpakstan
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? "text-blue-400 font-semibold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Icon size={16} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop CTA / User controls */}
        <div className="hidden md:flex items-center gap-4">
          {currentUser ? (
            <div className="flex items-center gap-3">
              <Link
                href={getDashboardLink()}
                className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10 hover:border-white/20"
              >
                <User size={12} className="text-blue-400" />
                <span>{currentUser.name || "My Portal"}</span>
                <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-blue-300">
                  {currentUser.role}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-transparent text-zinc-400 transition hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20"
                title="Sign Out"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <Link
              href="/auth"
              className="relative inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-2 text-xs font-bold text-white transition duration-300 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex md:hidden h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-400 transition hover:bg-white/10 hover:text-white"
        >
          {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="border-b border-white/10 bg-zinc-950 px-4 py-4 md:hidden flex flex-col gap-4 animate-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 text-sm font-semibold py-2 px-3 rounded-lg ${
                    isActive
                      ? "bg-blue-600/10 text-blue-400"
                      : "text-zinc-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  {link.label}
                </Link>
              );
            })}
          </nav>
          
          <hr className="border-white/10" />

          <div>
            {currentUser ? (
              <div className="flex flex-col gap-3">
                <Link
                  href={getDashboardLink()}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-blue-400" />
                    <span>{currentUser.name}</span>
                  </div>
                  <span className="rounded bg-blue-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-blue-300">
                    {currentUser.role}
                  </span>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 py-2.5 text-sm font-bold text-red-400 transition hover:bg-red-500/10"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/auth"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 py-2.5 text-sm font-bold text-white transition"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
