"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Award, Plus, ShieldAlert, Check, MapPin, Calendar, Clock, X, Terminal } from "lucide-react";

export default function InternshipPlatform() {
  const [internships, setInternships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Filters state
  const [filterType, setFilterType] = useState("");
  
  // Posting Form State
  const [postingInternship, setPostingInternship] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("3 months");
  const [requirements, setRequirements] = useState("");
  const [programType, setProgramType] = useState("junior_program");
  const [city, setCity] = useState("Nukus");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    setCurrentUser(api.auth.getCurrentUser());
    fetchInternships();
  }, [filterType]);

  const fetchInternships = () => {
    setLoading(true);
    api.internships.list({ program_type: filterType || undefined })
      .then(data => {
        setInternships(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Failed to load internships");
        setLoading(false);
      });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setActionLoading(true);

    try {
      const res = await api.internships.create({
        company_name: companyName,
        title,
        description,
        duration,
        requirements,
        program_type: programType,
        city
      });

      setInternships([res, ...internships]);
      setPostingInternship(false);
      setSuccess("Internship opportunity posted successfully!");
      
      // Reset form
      setCompanyName("");
      setTitle("");
      setDescription("");
      setRequirements("");
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError("Failed to submit internship opportunity");
    } finally {
      setActionLoading(false);
    }
  };

  const getProgramTypeLabel = (type: string) => {
    switch (type) {
      case "university_practice": return "University Practice";
      case "graduate_program": return "Graduate Program";
      default: return "Junior Placement";
    }
  };

  const getProgramBadgeClass = (type: string) => {
    switch (type) {
      case "university_practice": return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      case "graduate_program": return "bg-violet-500/10 text-violet-400 border border-violet-500/20";
      default: return "bg-green-500/10 text-green-400 border border-green-500/20";
    }
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* HEADER BAR */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1 bg-green-500/10 border border-green-500/20 px-2.5 py-0.5 rounded text-[10px] font-bold text-green-400 uppercase tracking-widest mb-1.5">
            Career Kickstart
          </div>
          <h1 className="text-2xl font-black text-white">Internship Portal</h1>
          <p className="text-xs text-zinc-400">Discover graduate tracks, company residencies, and university student practices in IT.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Program filter select */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-lg bg-zinc-950 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">All Programs</option>
            <option value="junior_program">Junior Placement</option>
            <option value="university_practice">University Practice</option>
            <option value="graduate_program">Graduate Program</option>
          </select>

          {currentUser && (currentUser.role === "company" || currentUser.role === "admin") && (
            <button
              onClick={() => setPostingInternship(true)}
              className="flex items-center gap-1.5 rounded-lg bg-green-600 hover:bg-green-500 px-4 py-2 text-xs font-bold text-white transition whitespace-nowrap"
            >
              <Plus size={16} />
              Post Internship
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-400">
          <ShieldAlert size={16} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 p-4 text-xs text-green-400">
          <Check size={16} />
          <span>{success}</span>
        </div>
      )}

      {/* NEW INTERNSHIP MODAL */}
      {postingInternship && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-zinc-900 border border-white/10 rounded-2xl p-6 relative glass-panel text-left space-y-4 animate-scale-up">
            <button 
              onClick={() => setPostingInternship(false)}
              className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white"
            >
              <X size={16} />
            </button>

            <h2 className="text-lg font-bold text-white border-b border-white/5 pb-2">Post Internship Placement</h2>
            
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-zinc-400 font-bold uppercase tracking-wider">Company / Institution Name</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Nukus Software House"
                    className="w-full rounded-lg bg-zinc-950 border border-white/10 p-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 font-bold uppercase tracking-wider">Internship Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Frontend Web Intern"
                    className="w-full rounded-lg bg-zinc-950 border border-white/10 p-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-zinc-400 font-bold uppercase tracking-wider">Program Type</label>
                  <select
                    value={programType}
                    onChange={(e) => setProgramType(e.target.value)}
                    className="w-full rounded-lg bg-zinc-950 border border-white/10 p-2.5 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="junior_program">Junior Placement</option>
                    <option value="university_practice">University Practice</option>
                    <option value="graduate_program">Graduate Program</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 font-bold uppercase tracking-wider">Duration</label>
                  <input
                    type="text"
                    required
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 3 months"
                    className="w-full rounded-lg bg-zinc-950 border border-white/10 p-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 font-bold uppercase tracking-wider">City</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-lg bg-zinc-950 border border-white/10 p-2.5 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Nukus">Nukus</option>
                    <option value="Muynak">Muynak</option>
                    <option value="Khojeyli">Khojeyli</option>
                    <option value="Kungrad">Kungrad</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 font-bold uppercase tracking-wider">Placement Requirements</label>
                <input
                  type="text"
                  required
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="e.g. Basic HTML/CSS, JavaScript syntax, OOP knowledge"
                  className="w-full rounded-lg bg-zinc-950 border border-white/10 p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 font-bold uppercase tracking-wider">Program Description</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Outline the learning curriculum, mentorship scheme, hours required, and potential of full-time hiring..."
                  className="w-full rounded-lg bg-zinc-950 border border-white/10 p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-2.5 rounded-lg bg-green-600 hover:bg-green-500 text-xs font-bold text-white transition mt-2"
              >
                {actionLoading ? "Submitting..." : "Post Opportunity"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* INTERNSHIPS GRID */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></span>
          <p className="text-xs text-zinc-500 mt-3 font-semibold">Loading opportunities...</p>
        </div>
      ) : internships.length === 0 ? (
        <div className="glass-panel text-center py-20 rounded-2xl border border-white/5">
          <Award size={36} className="text-zinc-600 mx-auto mb-3 animate-pulse" />
          <p className="text-sm font-semibold text-zinc-400">No internship programs found</p>
          <p className="text-xs text-zinc-600 mt-1">Try changing filter parameters or check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {internships.map((intern) => (
            <div key={intern.id} className="glass-panel p-6 rounded-2xl border border-white/5 text-left flex flex-col justify-between space-y-4 relative overflow-hidden group">
              <div className="absolute top-0 right-0 h-20 w-20 rounded-full radial-bg-green opacity-10 blur-xl"></div>
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{intern.company_name}</span>
                    
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${getProgramBadgeClass(intern.program_type)}`}>
                      {getProgramTypeLabel(intern.program_type)}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-white leading-snug group-hover:text-green-400 transition">{intern.title}</h3>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">{intern.description}</p>
                
                {intern.requirements && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                      <Terminal size={10} />
                      Basic requirements
                    </span>
                    <p className="text-[11px] text-zinc-300 italic">"{intern.requirements}"</p>
                  </div>
                )}
              </div>

              {/* Footer specs */}
              <div className="flex items-center justify-between border-t border-white/5 pt-3 text-[10px] text-zinc-500">
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  Duration: <strong className="text-zinc-300 font-semibold">{intern.duration}</strong>
                </span>

                <span className="flex items-center gap-1">
                  <MapPin size={12} />
                  {intern.city}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
