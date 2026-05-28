"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Cpu, MapPin, Wrench, User, Users, Plus, ShieldAlert, Check, X } from "lucide-react";

export default function RoboticsHub() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Create project form state
  const [postingProject, setPostingProject] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [teamName, setTeamName] = useState("");
  const [leadName, setLeadName] = useState("");
  const [techStack, setTechStack] = useState("");
  const [hardwareUsed, setHardwareUsed] = useState("");
  const [location, setLocation] = useState("Nukus");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    setCurrentUser(api.auth.getCurrentUser());
    fetchProjects();
  }, []);

  const fetchProjects = () => {
    setLoading(true);
    api.robotics.list()
      .then(data => {
        setProjects(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Failed to load projects");
        setLoading(false);
      });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setActionLoading(true);

    try {
      const res = await api.robotics.create({
        title,
        description,
        team_name: teamName || undefined,
        lead_name: leadName || undefined,
        tech_stack: techStack,
        hardware_used: hardwareUsed,
        location
      });
      
      setProjects([res, ...projects]);
      setPostingProject(false);
      setSuccess("Robotics project published successfully!");
      
      // Reset form
      setTitle("");
      setDescription("");
      setTeamName("");
      setLeadName("");
      setTechStack("");
      setHardwareUsed("");
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError("Failed to register project");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* HEADER BAR */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1.5">
            Hardware Engineering
          </div>
          <h1 className="text-2xl font-black text-white">Robotics Talent Hub</h1>
          <p className="text-xs text-zinc-400">Discover embedded projects, IoT sensors, and autonomous rovers built in Karakalpakstan.</p>
        </div>

        {currentUser && (
          <button
            onClick={() => setPostingProject(true)}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-bold text-white transition"
          >
            <Plus size={16} />
            Showcase Project
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

      {/* NEW PROJECT MODAL DIALOG */}
      {postingProject && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-zinc-900 border border-white/10 rounded-2xl p-6 relative glass-panel text-left space-y-4 animate-scale-up">
            <button 
              onClick={() => setPostingProject(false)}
              className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white"
            >
              <X size={16} />
            </button>

            <h2 className="text-lg font-bold text-white border-b border-white/5 pb-2">Showcase Robotics Project</h2>
            
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-zinc-400 font-bold uppercase tracking-wider">Project Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Autonomous Cotton Weeder v1"
                  className="w-full rounded-lg bg-zinc-950 border border-white/10 p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-zinc-400 font-bold uppercase tracking-wider">Team / Lab Name</label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="e.g. Nukus RoboLab"
                    className="w-full rounded-lg bg-zinc-950 border border-white/10 p-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 font-bold uppercase tracking-wider">Lead Developer Name</label>
                  <input
                    type="text"
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    placeholder="e.g. Aybek Davletov"
                    className="w-full rounded-lg bg-zinc-950 border border-white/10 p-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-zinc-400 font-bold uppercase tracking-wider">Software Stack</label>
                  <input
                    type="text"
                    required
                    value={techStack}
                    onChange={(e) => setTechStack(e.target.value)}
                    placeholder="e.g. C++, Arduino, ROS, Python"
                    className="w-full rounded-lg bg-zinc-950 border border-white/10 p-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 font-bold uppercase tracking-wider">Location (City)</label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
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
                <label className="text-zinc-400 font-bold uppercase tracking-wider">Hardware Components Used</label>
                <input
                  type="text"
                  required
                  value={hardwareUsed}
                  onChange={(e) => setHardwareUsed(e.target.value)}
                  placeholder="e.g. ESP32, Soil sensors, 20W Solar Panel, Solenoid valve"
                  className="w-full rounded-lg bg-zinc-950 border border-white/10 p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 font-bold uppercase tracking-wider">Project Description</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Detail the problem solved, design structure, and results..."
                  className="w-full rounded-lg bg-zinc-950 border border-white/10 p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition mt-2"
              >
                {actionLoading ? "Submitting..." : "Submit Project"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PROJECTS LIST GRID */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></span>
          <p className="text-xs text-zinc-500 mt-3 font-semibold">Loading projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="glass-panel text-center py-20 rounded-2xl border border-white/5">
          <Cpu size={36} className="text-zinc-600 mx-auto mb-3 animate-pulse" />
          <p className="text-sm font-semibold text-zinc-400">No robotics projects registered yet</p>
          <p className="text-xs text-zinc-600 mt-1">Be the first to share your embedded engineering showcase!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="glass-panel p-6 rounded-2xl border border-white/5 text-left flex flex-col justify-between space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 h-24 w-24 rounded-full radial-bg-blue opacity-10 blur-xl"></div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-lg font-black text-white leading-snug">{project.title}</h3>
                  <span className="bg-zinc-950 border border-white/5 px-2.5 py-1 rounded text-[10px] font-bold text-zinc-400 flex items-center gap-1 uppercase">
                    <MapPin size={10} />
                    {project.location}
                  </span>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line">{project.description}</p>

                {/* Hardware components list */}
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                    <Wrench size={10} />
                    Hardware components
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {project.hardware_used.split(",").map((hw: string, idx: number) => (
                      <span key={idx} className="bg-zinc-950 border border-white/10 text-blue-400 px-2 py-0.5 rounded text-[10px] font-semibold">
                        {hw.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Software stack list */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                    <Cpu size={10} />
                    Firmware / Stack
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {project.tech_stack.split(",").map((tech: string, idx: number) => (
                      <span key={idx} className="bg-zinc-900 border border-white/5 text-zinc-300 px-2 py-0.5 rounded text-[10px]">
                        {tech.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Team details bar */}
              <div className="flex items-center justify-between border-t border-white/5 pt-3 text-[10px] text-zinc-500">
                <span className="flex items-center gap-1">
                  <User size={12} />
                  Lead: <strong className="text-zinc-300 font-semibold">{project.lead_name || "Independent"}</strong>
                </span>
                
                {project.team_name && (
                  <span className="flex items-center gap-1">
                    <Users size={12} />
                    Team: <strong className="text-zinc-300 font-semibold">{project.team_name}</strong>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
