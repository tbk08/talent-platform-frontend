"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { 
  Search, Briefcase, Cpu, Users, Award, TrendingUp, 
  MapPin, DollarSign, Building2, Brain, ArrowRight, UserCheck
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  useEffect(() => {
    // Check current user
    const user = api.auth.getCurrentUser();
    setCurrentUser(user);

    // Fetch market statistics
    api.analytics.getMarket()
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load statistics:", err);
        setLoading(false);
      });

    // If logged in as candidate, fetch AI recommendations
    if (user && user.role === "candidate") {
      api.analytics.getAIRecommendations()
        .then(jobs => {
          setRecommendations(jobs);
        })
        .catch(err => console.error("Failed to load recommendations", err));
    }
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/jobs?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/jobs");
    }
  };

  // Mock stats fallback if database is loading/empty
  const displayStats = stats || {
    total_candidates: 125,
    total_companies: 18,
    total_jobs: 32,
    demanded_skills: [
      { skill: "Python", count: 18 },
      { skill: "JavaScript", count: 15 },
      { skill: "TypeScript", count: 12 },
      { skill: "Next.js", count: 10 },
      { skill: "FastAPI", count: 8 },
      { skill: "Arduino / IoT", count: 6 },
    ],
    average_salaries: [
      { experience_level: "Junior", average_salary: 4500000 },
      { experience_level: "Middle", average_salary: 10000000 },
      { experience_level: "Senior", average_salary: 20000000 },
      { experience_level: "Lead", average_salary: 32000000 },
    ],
    regional_distribution: [
      { city: "Nukus", candidate_count: 85, job_count: 24 },
      { city: "Muynak", candidate_count: 12, job_count: 4 },
      { city: "Khojeyli", candidate_count: 15, job_count: 2 },
      { city: "Kungrad", candidate_count: 13, job_count: 2 },
    ]
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* 1. HERO SECTION */}
      <section className="relative px-4 pt-20 pb-16 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto w-full">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/5 px-4 py-1.5 text-xs font-semibold text-blue-400 mb-6 animate-pulse">
          <Brain size={14} />
          <span>AI-Powered HR Ecosystem</span>
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-6">
          IT Talent Platform <br />
          <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-green-400 bg-clip-text text-transparent">
            Karakalpakstan
          </span>
        </h1>
        
        <p className="text-base sm:text-lg text-zinc-400 max-w-3xl mx-auto mb-10 leading-relaxed">
          The centralized HR infrastructure for IT Park Karakalpakstan. Connecting developers, robotics engineers, startups, and universities with local and international companies.
        </p>

        {/* Search bar */}
        <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto relative mb-16">
          <div className="relative flex items-center rounded-xl bg-zinc-900 border border-white/10 p-2 shadow-2xl focus-within:border-blue-500/50 transition">
            <Search className="text-zinc-500 ml-3" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search IT jobs, stacks, or skills (e.g. FastAPI, Next.js, Embedded)..."
              className="w-full bg-transparent px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-2.5 text-xs font-bold text-white transition hover:shadow-[0_0_15px_rgba(37,99,235,0.4)]"
            >
              Search
            </button>
          </div>
        </form>

        {/* Core Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {[
            { value: displayStats.total_candidates, label: "Active Talents", icon: UserCheck, color: "text-blue-400" },
            { value: displayStats.total_companies, label: "Verified Partners", icon: Building2, color: "text-violet-400" },
            { value: displayStats.total_jobs, label: "Open Roles", icon: Briefcase, color: "text-green-400" },
            { value: "17", label: "KK Districts Connected", icon: MapPin, color: "text-amber-400" },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="glass-panel p-4 rounded-xl border border-white/5 text-center">
                <div className="flex justify-center mb-1">
                  <Icon size={18} className={stat.color} />
                </div>
                <div className="text-2xl font-extrabold text-white">{stat.value}</div>
                <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-zinc-500 mt-0.5">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. SPECIALIZED ECOSYSTEM MODULES */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white text-center mb-10">
          Ecosystem Hubs
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Robotics Hub */}
          <div className="glass-panel glass-panel-hover p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 h-24 w-24 rounded-full radial-bg-blue opacity-20 blur-xl"></div>
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/10 text-blue-400 mb-4 border border-blue-500/20">
                <Cpu size={20} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Robotics & IoT Hub</h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                Specialized portal for Karakalpakstan's robotics engineers, Arduino developers, drone engineers, and embedded programmers. Showcasing actual regional hardware projects.
              </p>
            </div>
            <Link href="/robotics" className="inline-flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300 group/link">
              <span>Explore Projects</span>
              <ArrowRight size={14} className="transition-transform group-hover/link:translate-x-1" />
            </Link>
          </div>

          {/* Startup builder */}
          <div className="glass-panel glass-panel-hover p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 h-24 w-24 rounded-full radial-bg-violet opacity-20 blur-xl"></div>
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-600/10 text-violet-400 mb-4 border border-violet-500/20">
                <Users size={20} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Startup Team Builder</h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                Forming the future digital leaders of Nukus and Muynak. Search for co-founders, UI/UX designers, project managers, and backend engineers to build startup MVPs.
              </p>
            </div>
            <Link href="/startups" className="inline-flex items-center gap-1 text-xs font-bold text-violet-400 hover:text-violet-300 group/link">
              <span>Build Startup Teams</span>
              <ArrowRight size={14} className="transition-transform group-hover/link:translate-x-1" />
            </Link>
          </div>

          {/* Internships */}
          <div className="glass-panel glass-panel-hover p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 h-24 w-24 rounded-full radial-bg-green opacity-20 blur-xl"></div>
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-600/10 text-green-400 mb-4 border border-green-500/20">
                <Award size={20} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Internship Platform</h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                Launchpad for students and juniors. Apply to university practices, corporate graduate programs, and residency opportunities sponsored by IT Park.
              </p>
            </div>
            <Link href="/internships" className="inline-flex items-center gap-1 text-xs font-bold text-green-400 hover:text-green-300 group/link">
              <span>View Opportunities</span>
              <ArrowRight size={14} className="transition-transform group-hover/link:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* 3. AI RECOMMENDATIONS BOX */}
      {currentUser && currentUser.role === "candidate" && (
        <section className="px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="glass-panel border-blue-500/20 p-6 rounded-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-violet-600/5 pointer-events-none"></div>
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-md bg-blue-500/10 px-2.5 py-1 text-xs font-bold text-blue-400">
                  <Brain size={12} />
                  <span>AI Recommendations Active</span>
                </div>
                <h3 className="text-xl font-extrabold text-white mt-2">Personalized Vacancy Matches</h3>
                <p className="text-xs text-zinc-400 mt-1">Based on the skills listed in your developer profile.</p>
              </div>
              
              <Link href="/candidate" className="rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold px-4 py-2 transition">
                View My Matches
              </Link>
            </div>

            {recommendations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {recommendations.slice(0, 2).map((job, idx) => (
                  <div key={idx} className="bg-zinc-950/80 border border-white/5 rounded-xl p-4 flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-white text-sm">{job.title}</h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5">{job.company?.name || "Company"}</p>
                      <div className="flex gap-1.5 flex-wrap mt-2">
                        {job.skills.split(",").slice(0, 3).map((skill: string, sIdx: number) => (
                          <span key={sIdx} className="bg-zinc-900 border border-white/5 px-2 py-0.5 rounded text-[10px] text-zinc-300">
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Link href={`/jobs?id=${job.id}`} className="p-1.5 rounded-lg bg-white/5 text-zinc-300 hover:text-white transition">
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-xs text-zinc-500 py-6">
                Update your skills in the Candidate Dashboard to receive highly accurate matching scores.
              </div>
            )}
          </div>
        </section>
      )}

      {/* 4. LABOR MARKET ANALYTICS */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-zinc-950/40 border-y border-white/5 w-full">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Karakalpakstan IT Labor Market Insights
            </h2>
            <p className="text-xs text-zinc-400 mt-2 max-w-xl mx-auto">
              Real-time regional analytics aggregated from platforms job openings, universities datasets, and active registrations.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chart 1: Demanded Skills */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-zinc-400 mb-6 flex items-center gap-2">
                <TrendingUp size={16} className="text-blue-400" />
                Most Demanded Skills
              </h3>
              
              <div className="space-y-4">
                {displayStats.demanded_skills.map((skill: any, idx: number) => {
                  // Calculate percentage relative to first count
                  const maxCount = displayStats.demanded_skills[0].count;
                  const percent = Math.round((skill.count / maxCount) * 100);
                  
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-white">{skill.skill}</span>
                        <span className="text-zinc-400">{skill.count} jobs</span>
                      </div>
                      <div className="w-full bg-zinc-900 rounded-full h-1.5">
                        <div 
                          className="bg-blue-500 h-1.5 rounded-full" 
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chart 2: Salaries by Level */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-zinc-400 mb-6 flex items-center gap-2">
                <DollarSign size={16} className="text-green-400" />
                Average Tech Salaries (Monthly)
              </h3>

              <div className="space-y-5">
                {displayStats.average_salaries.map((sal: any, idx: number) => {
                  const maxSalary = 32000000;
                  const percent = Math.round((sal.average_salary / maxSalary) * 100);
                  
                  // Format UZS
                  const formattedSalary = (sal.average_salary / 1000000).toFixed(1) + "M UZS";
                  
                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-white">{sal.experience_level}</span>
                        <span className="text-green-400 font-bold">{formattedSalary}</span>
                      </div>
                      <div className="w-full bg-zinc-900 rounded-full h-1.5">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-1.5 rounded-full" 
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-zinc-500 mt-6 text-center">
                *Aggregated from local companies and foreign investor postings.
              </p>
            </div>

            {/* Chart 3: Regional distribution */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-zinc-400 mb-6 flex items-center gap-2">
                <MapPin size={16} className="text-violet-400" />
                Regional Distribution
              </h3>

              <div className="space-y-4">
                {displayStats.regional_distribution.map((reg: any, idx: number) => {
                  return (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/40 border border-white/5 text-xs">
                      <span className="font-bold text-white">{reg.city}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-blue-400 font-medium">{reg.candidate_count} Talents</span>
                        <span className="text-violet-400 font-medium">{reg.job_count} Jobs</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
