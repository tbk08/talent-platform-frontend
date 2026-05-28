import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IT Talent Platform Karakalpakstan | IT Park",
  description: "AI-powered HR-tech ecosystem platform for job seekers, recruiters, robotics engineers, startups, and university practices in Republic of Karakalpakstan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full dark`}
    >
      <body className="bg-zinc-950 text-zinc-100 min-h-screen flex flex-col relative selection:bg-blue-500/30 selection:text-blue-200 overflow-x-hidden antialiased">
        {/* Neon decorative background glow elements */}
        <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full radial-bg-blue pointer-events-none -z-10 blur-[100px]"></div>
        <div className="absolute top-1/3 right-1/4 h-[600px] w-[600px] rounded-full radial-bg-violet pointer-events-none -z-10 blur-[120px]"></div>
        
        <Header />
        
        <main className="flex-1 flex flex-col">
          {children}
        </main>
        
        <footer className="border-t border-white/5 bg-zinc-950/80 py-8 px-4 sm:px-6 lg:px-8 mt-auto backdrop-blur-sm">
          <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col items-center md:items-start">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black tracking-wider text-white uppercase">
                  IT Talent Platform
                </span>
                <span className="rounded bg-green-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-green-400">
                  IT Park
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-1 text-center md:text-left">
                Centralized IT HR Infrastructure of the Republic of Karakalpakstan.
              </p>
            </div>
            
            <div className="flex items-center gap-6 text-xs text-zinc-400">
              <span className="hover:text-white transition cursor-pointer">Privacy Policy</span>
              <span className="hover:text-white transition cursor-pointer">Terms of Service</span>
              <span className="hover:text-white transition cursor-pointer">Contact Support</span>
            </div>
            
            <div className="text-xs text-zinc-500">
              &copy; {new Date().getFullYear()} IT Park Karakalpakstan. All rights reserved.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
