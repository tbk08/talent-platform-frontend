"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { 
  Search, MapPin, Briefcase, DollarSign, Calendar, 
  Brain, ShieldAlert, Check, X, Building2, Terminal
} from "lucide-react";

function JobsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Search & Filter State
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [city, setCity] = useState("");
  const [type, setType] = useState("");
  const [exp, setExp] = useState("");
  
  // Selected Job Details State
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [applying, setApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [applyLoading, setApplyLoading] = useState(false);
  const [applySuccess, setApplySuccess] = useState<any>(null); // holds application response with score
  
  // Auth status
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    setCurrentUser(api.auth.getCurrentUser());
    fetchJobs();
  }, [searchParams]);

  const fetchJobs = () => {
    setLoading(true);
    const queryVal = searchParams.get("q") || "";
    
    api.jobs.list({
      q: queryVal,
      city: city || undefined,
      type: type || undefined,
      experience_level: exp || undefined
    })
    .then(data => {
      setJobs(data);
      setLoading(false);
      
      // If a specific job ID is passed in query, auto-select it
      const jobIdParam = searchParams.get("id");
      if (jobIdParam && data.length > 0) {
        const found = data.find((j: any) => j.id === Number(jobIdParam));
        if (found) setSelectedJob(found);
      }
    })
    .catch(err => {
      console.error(err);
      setError("Failed to fetch job vacancies");
      setLoading(false);
    });
  };

  const handleFilterChange = (e: React.FormEvent) => {
    e.preventDefault();
    // Update query params
    const params = new URLSearchParams();
    if (q) params.append("q", q);
    router.push(`/jobs?${params.toString()}`);
    fetchJobs();
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    setApplyLoading(true);
    setError("");

    try {
      const res = await api.jobs.apply(selectedJob.id, { cover_letter: coverLetter });
      setApplySuccess(res);
      // Reset form
      setCoverLetter("");
    } catch (err: any) {
      setError(err.message || "Failed to submit application");
    } finally {
      setApplyLoading(false);
    }
  };

  const getJobStatusBadgeClass = (jobType: string) => {
    switch (jobType) {
      case "remote": return "bg-green-500/10 text-green-400 border border-green-500/20";
      case "hybrid": return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      default: return "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20";
    }
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-6 relative">
      {/* 1. FILTER SIDEBAR */}
      <aside className="w-full md:w-64 flex-shrink-0">
        <div className="glass-panel p-6 rounded-2xl sticky top-20 border border-white/5 space-y-6">
          <h2 className="text-base font-bold text-white uppercase tracking-wider mb-2">Filters</h2>
          
          <form onSubmit={handleFilterChange} className="space-y-4">
            {/* Search Input */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Keywords</label>
              <div className="relative">
                <input
                  type="text"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Python, React, UI..."
                  className="w-full rounded-lg bg-zinc-950 border border-white/10 px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* City Filter */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">City</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-lg bg-zinc-950 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">All Regions</option>
                <option value="Nukus">Nukus</option>
                <option value="Muynak">Muynak</option>
                <option value="Khojeyli">Khojeyli</option>
                <option value="Kungrad">Kungrad</option>
                <option value="Chimbay">Chimbay</option>
              </select>
            </div>

            {/* Type Filter */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Job Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-lg bg-zinc-950 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">All Types</option>
                <option value="office">Office</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            {/* Exp Level */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Experience</label>
              <select
                value={exp}
                onChange={(e) => setExp(e.target.value)}
                className="w-full rounded-lg bg-zinc-950 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">All Levels</option>
                <option value="junior">Junior</option>
                <option value="middle">Middle</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition mt-2"
            >
              Apply Filters
            </button>
          </form>
        </div>
      </aside>

      {/* 2. JOB LISTINGS GRID */}
      <section className="flex-1 flex flex-col gap-4">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <span className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></span>
            <p className="text-xs text-zinc-500 mt-3 font-semibold">Loading job postings...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="glass-panel text-center py-20 rounded-2xl border border-white/5">
            <Briefcase size={36} className="text-zinc-600 mx-auto mb-3 animate-pulse" />
            <p className="text-sm font-semibold text-zinc-400">No job vacancies found</p>
            <p className="text-xs text-zinc-600 mt-1">Try resetting search keywords or criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                onClick={() => {
                  setSelectedJob(job);
                  setApplying(false);
                  setApplySuccess(null);
                  setError("");
                }}
                className={`glass-panel p-5 rounded-2xl cursor-pointer transition border duration-200 text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  selectedJob?.id === job.id 
                    ? "border-blue-500 bg-blue-500/5" 
                    : "border-white/5 hover:border-white/20 hover:bg-white/5"
                }`}
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                      <Building2 size={12} className="text-blue-500" />
                      {job.company?.name || "Verified Company"}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${getJobStatusBadgeClass(job.type)}`}>
                      {job.type}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-white leading-tight">{job.title}</h3>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      {job.city}
                    </span>
                    {job.salary_min && (
                      <span className="flex items-center gap-1 font-bold text-green-400">
                        <DollarSign size={12} />
                        {(job.salary_min / 1_000_000).toFixed(1)}M - {(job.salary_max / 1_000_000).toFixed(1)}M {job.salary_currency}
                      </span>
                    )}
                    <span className="flex items-center gap-1 uppercase tracking-wider text-[10px] font-bold text-violet-400">
                      {job.experience_level}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {job.skills.split(",").map((skill: string, idx: number) => (
                      <span key={idx} className="bg-zinc-900 border border-white/5 text-zinc-300 px-2 py-0.5 rounded text-[10px]">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
                
                <button className="flex-shrink-0 rounded-lg border border-white/10 hover:border-white/20 bg-white/5 px-4 py-2 text-xs font-bold text-white transition">
                  Details
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. SIDE PANEL DETAILS (SLIDE OVER / MODAL DETAILS) */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-end animate-fade-in md:static md:bg-transparent md:backdrop-blur-none md:flex md:w-96 md:h-[calc(100vh-8rem)] md:sticky md:top-24">
          <div className="w-full max-w-lg h-full bg-zinc-950 md:bg-zinc-900/60 border-l border-white/10 md:border md:rounded-2xl p-6 overflow-y-auto flex flex-col justify-between glass-panel relative animate-slide-in">
            {/* Close button for mobile overlay */}
            <button 
              onClick={() => setSelectedJob(null)}
              className="absolute top-4 right-4 md:hidden h-8 w-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white"
            >
              <X size={16} />
            </button>

            <div>
              <div className="border-b border-white/10 pb-4 mb-4">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                  <Building2 size={12} className="text-blue-500" />
                  {selectedJob.company?.name || "Company Profile"}
                </span>
                <h3 className="text-xl font-extrabold text-white mt-1 leading-snug">{selectedJob.title}</h3>
                
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="bg-zinc-950 border border-white/5 px-2.5 py-1 rounded-md text-[10px] font-bold text-zinc-400 flex items-center gap-1">
                    <MapPin size={10} />
                    {selectedJob.city}
                  </span>
                  <span className="bg-zinc-950 border border-white/5 px-2.5 py-1 rounded-md text-[10px] font-bold text-blue-400 flex items-center gap-1 capitalize">
                    <Briefcase size={10} />
                    {selectedJob.type}
                  </span>
                  <span className="bg-zinc-950 border border-white/5 px-2.5 py-1 rounded-md text-[10px] font-bold text-violet-400 flex items-center gap-1 uppercase">
                    <Terminal size={10} />
                    {selectedJob.experience_level}
                  </span>
                </div>
              </div>

              {/* Salary / Date details */}
              <div className="grid grid-cols-2 gap-4 bg-zinc-950/60 p-4 rounded-xl border border-white/5 mb-6 text-xs">
                <div>
                  <div className="text-zinc-500 font-medium">Estimated Salary</div>
                  <div className="text-green-400 font-bold mt-0.5">
                    {selectedJob.salary_min 
                      ? `${(selectedJob.salary_min / 1000000).toFixed(1)}M - ${(selectedJob.salary_max / 1000000).toFixed(1)}M ${selectedJob.salary_currency}`
                      : "Not disclosed"}
                  </div>
                </div>
                <div>
                  <div className="text-zinc-500 font-medium">Posted Date</div>
                  <div className="text-white font-medium mt-0.5 flex items-center gap-1">
                    <Calendar size={12} className="text-zinc-400" />
                    {new Date(selectedJob.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4 mb-6">
                <div>
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Description</h4>
                  <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line">{selectedJob.description}</p>
                </div>
                
                <div>
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Requirements</h4>
                  <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line">{selectedJob.requirements}</p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Tech Stack Required</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedJob.skills.split(",").map((skill: string, idx: number) => (
                      <span key={idx} className="bg-zinc-950 border border-white/10 text-zinc-300 px-3 py-1 rounded text-xs font-medium">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* APPLICATION CONTAINER */}
            <div className="border-t border-white/10 pt-4 mt-4">
              {applySuccess ? (
                /* Application Success & AI MATCH DISPLAY */
                <div className="space-y-3 p-4 rounded-xl border border-green-500/20 bg-green-500/5 animate-fade-in">
                  <div className="flex items-center gap-1.5 text-green-400 font-bold text-xs">
                    <Check size={16} />
                    <span>Application Submitted!</span>
                  </div>
                  
                  {/* AI Match Gauge */}
                  <div className="border-t border-white/5 pt-3 mt-3 flex items-center gap-4">
                    <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/10 border border-blue-500/20 text-center">
                      <div className="text-sm font-black text-white">{applySuccess.match_score}%</div>
                      <div className="absolute -inset-0.5 rounded-full bg-blue-500 opacity-20 blur-sm"></div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1">
                        <Brain size={12} className="text-blue-400" />
                        <span>AI Match Score</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 leading-relaxed mt-0.5">
                        {applySuccess.match_details?.explanation || "The resume matching engine successfully completed scoring."}
                      </p>
                    </div>
                  </div>
                  
                  {applySuccess.match_details?.missing_skills?.length > 0 && (
                    <div className="text-[10px] text-zinc-400">
                      <span className="font-semibold text-zinc-300">Suggested additions to your skills: </span>
                      {applySuccess.match_details.missing_skills.join(", ")}
                    </div>
                  )}

                  <button 
                    onClick={() => {
                      setApplySuccess(null);
                      setApplying(false);
                    }}
                    className="w-full py-1.5 rounded bg-zinc-800 text-[10px] font-bold text-white mt-1 hover:bg-zinc-700 transition"
                  >
                    Done
                  </button>
                </div>
              ) : applying ? (
                /* Cover Letter input form */
                <form onSubmit={handleApply} className="space-y-3 animate-fade-in">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Cover Letter (Optional)</label>
                    <textarea
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      placeholder="Briefly state your suitability for this position..."
                      rows={3}
                      className="w-full rounded-lg bg-zinc-950 border border-white/10 p-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-1.5 text-red-400 text-[10px] font-bold">
                      <ShieldAlert size={12} />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setApplying(false)}
                      className="flex-1 py-2 rounded-lg bg-zinc-800 text-xs font-bold text-zinc-300 hover:text-white transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={applyLoading}
                      className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition flex items-center justify-center"
                    >
                      {applyLoading ? "Submitting..." : "Submit Apply"}
                    </button>
                  </div>
                </form>
              ) : (
                /* Primary CTA button */
                <div>
                  {currentUser ? (
                    currentUser.role === "candidate" ? (
                      <button
                        onClick={() => setApplying(true)}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] text-xs font-bold text-white transition"
                      >
                        Apply for this Job
                      </button>
                    ) : (
                      <div className="text-center text-[10px] text-zinc-500">
                        Recruiters and admins cannot apply to jobs.
                      </div>
                    )
                  ) : (
                    <button
                      onClick={() => router.push("/auth")}
                      className="w-full py-3 rounded-xl bg-zinc-800 text-xs font-bold text-white hover:bg-zinc-700 transition"
                    >
                      Sign In to Apply
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex flex-col items-center justify-center py-20">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></span>
        <p className="text-xs text-zinc-500 mt-3 font-semibold">Loading search page...</p>
      </div>
    }>
      <JobsPageContent />
    </Suspense>
  );
}
