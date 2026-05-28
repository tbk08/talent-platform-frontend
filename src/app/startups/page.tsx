"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Users, Plus, ShieldAlert, Check, Mail, Award, X, Terminal, FileText } from "lucide-react";

export default function StartupTeamBuilder() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Form State
  const [postingRequest, setPostingRequest] = useState(false);
  const [startupName, setStartupName] = useState("");
  const [description, setDescription] = useState("");
  const [lookingFor, setLookingFor] = useState("Co-founder");
  const [skillsRequired, setSkillsRequired] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    setCurrentUser(api.auth.getCurrentUser());
    fetchRequests();
  }, []);

  const fetchRequests = () => {
    setLoading(true);
    api.startups.list()
      .then(data => {
        setRequests(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Failed to load team building requests");
        setLoading(false);
      });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setActionLoading(true);

    try {
      const res = await api.startups.create({
        startup_name: startupName,
        description,
        looking_for: lookingFor,
        skills_required: skillsRequired,
        contact_email: contactEmail
      });

      setRequests([res, ...requests]);
      setPostingRequest(false);
      setSuccess("Startup team request published!");
      
      // Reset form
      setStartupName("");
      setDescription("");
      setSkillsRequired("");
      setContactEmail("");
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError("Failed to submit request");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* HEADER BAR */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1 bg-violet-500/10 border border-violet-500/20 px-2.5 py-0.5 rounded text-[10px] font-bold text-violet-400 uppercase tracking-widest mb-1.5">
            Ecosystem Co-founding
          </div>
          <h1 className="text-2xl font-black text-white">Startup Team Builder</h1>
          <p className="text-xs text-zinc-400">Find co-founders, UI/UX designers, PMs, and developers to build new tech platforms.</p>
        </div>

        {currentUser && (
          <button
            onClick={() => setPostingRequest(true)}
            className="flex items-center gap-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 px-4 py-2 text-xs font-bold text-white transition"
          >
            <Plus size={16} />
            Post Team Request
          </button>
        )}
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

      {/* NEW REQUEST MODAL */}
      {postingRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-zinc-900 border border-white/10 rounded-2xl p-6 relative glass-panel text-left space-y-4 animate-scale-up">
            <button 
              onClick={() => setPostingRequest(false)}
              className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white"
            >
              <X size={16} />
            </button>

            <h2 className="text-lg font-bold text-white border-b border-white/5 pb-2">Post Startup Team Request</h2>
            
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-zinc-400 font-bold uppercase tracking-wider">Startup Project Name</label>
                <input
                  type="text"
                  required
                  value={startupName}
                  onChange={(e) => setStartupName(e.target.value)}
                  placeholder="e.g. Takyir Smart Delivery"
                  className="w-full rounded-lg bg-zinc-950 border border-white/10 p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-zinc-400 font-bold uppercase tracking-wider">Role Looking For</label>
                  <select
                    value={lookingFor}
                    onChange={(e) => setLookingFor(e.target.value)}
                    className="w-full rounded-lg bg-zinc-950 border border-white/10 p-2.5 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Co-founder">Co-founder</option>
                    <option value="Frontend Developer">Frontend Developer</option>
                    <option value="Backend Developer">Backend Developer</option>
                    <option value="UI/UX Designer">UI/UX Designer</option>
                    <option value="Embedded Developer">Embedded Developer</option>
                    <option value="Project Manager">Project Manager</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 font-bold uppercase tracking-wider">Contact Email</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="e.g. info@startup.com"
                    className="w-full rounded-lg bg-zinc-950 border border-white/10 p-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 font-bold uppercase tracking-wider">Skills Required (Comma-separated)</label>
                <input
                  type="text"
                  required
                  value={skillsRequired}
                  onChange={(e) => setSkillsRequired(e.target.value)}
                  placeholder="e.g. React Native, Figma, UI/UX"
                  className="w-full rounded-lg bg-zinc-950 border border-white/10 p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 font-bold uppercase tracking-wider">Startup Pitch / Description</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Detail the startup idea, current progress, target market, and equity/compensation options..."
                  className="w-full rounded-lg bg-zinc-950 border border-white/10 p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-xs font-bold text-white transition mt-2"
              >
                {actionLoading ? "Posting..." : "Publish Request"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* REQUESTS LIST GRID */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></span>
          <p className="text-xs text-zinc-500 mt-3 font-semibold">Loading team requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="glass-panel text-center py-20 rounded-2xl border border-white/5">
          <Users size={36} className="text-zinc-600 mx-auto mb-3 animate-pulse" />
          <p className="text-sm font-semibold text-zinc-400">No team-building requests posted yet</p>
          <p className="text-xs text-zinc-600 mt-1">Submit your startup pitch to start recruiting developers!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {requests.map((req) => (
            <div key={req.id} className="glass-panel p-6 rounded-2xl border border-white/5 text-left flex flex-col justify-between space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 h-24 w-24 rounded-full radial-bg-violet opacity-10 blur-xl"></div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-2">
                  <h3 className="text-lg font-black text-white">{req.startup_name}</h3>
                  <span className="bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 rounded text-[10px] font-bold text-violet-400 flex items-center gap-1 uppercase">
                    <Award size={10} />
                    Looking for: {req.looking_for}
                  </span>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line">{req.description}</p>

                {/* Skills tags required */}
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                    <Terminal size={10} />
                    Required Stack
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {req.skills_required.split(",").map((skill: string, idx: number) => (
                      <span key={idx} className="bg-zinc-950 border border-white/10 text-zinc-300 px-2.5 py-0.5 rounded text-[10px]">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contact Button */}
              <div className="flex items-center justify-between border-t border-white/5 pt-3">
                <span className="text-[10px] text-zinc-500">
                  Posted {new Date(req.created_at).toLocaleDateString()}
                </span>
                
                <a 
                  href={`mailto:${req.contact_email}?subject=Interested in ${req.startup_name}`}
                  className="flex items-center gap-1 rounded bg-zinc-950 hover:bg-white/5 border border-white/10 px-3 py-1.5 text-[10px] font-bold text-white transition"
                >
                  <Mail size={12} className="text-violet-400" />
                  <span>Contact Founder</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
