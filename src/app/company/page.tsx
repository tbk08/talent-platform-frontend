"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { 
  Building2, MapPin, Globe, ShieldAlert, Check, Plus, 
  Briefcase, Users, FileText, Brain, Phone, Calendar, ArrowUpRight
} from "lucide-react";

export default function CompanyDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Edit company details state
  const [editingCompany, setEditingCompany] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [industry, setIndustry] = useState("");
  
  // Post job state
  const [postingJob, setPostingJob] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [jobReqs, setJobReqs] = useState("");
  const [jobSkills, setJobSkills] = useState("");
  const [jobType, setJobType] = useState("office");
  const [jobExp, setJobExp] = useState("middle");
  const [jobSalaryMin, setJobSalaryMin] = useState<number>(0);
  const [jobSalaryMax, setJobSalaryMax] = useState<number>(0);
  const [jobCity, setJobCity] = useState("Nukus");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const user = api.auth.getCurrentUser();
    if (!user) {
      router.push("/auth");
      return;
    }
    if (user.role !== "company") {
      router.push("/");
      return;
    }
    setCurrentUser(user);
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const coData = await api.companies.getMy();
      setCompany(coData);
      setCompanyName(coData.name || "");
      setDescription(coData.description || "");
      setWebsite(coData.website || "");
      setAddress(coData.address || "");
      setIndustry(coData.industry || "");

      const jobsData = await api.jobs.listMy();
      setJobs(jobsData);
      
      if (jobsData.length > 0) {
        setSelectedJobId(jobsData[0].id);
        fetchApplicants(jobsData[0].id);
      }
    } catch (err: any) {
      console.error(err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicants = (jobId: number) => {
    api.jobs.getApplications(jobId)
      .then(data => {
        setApplicants(data);
      })
      .catch(err => console.error("Failed to load applicants", err));
  };

  const handleJobSelect = (jobId: number) => {
    setSelectedJobId(jobId);
    fetchApplicants(jobId);
  };

  const handleCompanySave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    try {
      const updated = await api.companies.updateMy({
        name: companyName,
        description,
        website,
        address,
        industry
      });
      setCompany(updated);
      setEditingCompany(false);
      setSuccess("Company profile updated!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    }
  };

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setActionLoading(true);

    try {
      const newJob = await api.jobs.create({
        title: jobTitle,
        description: jobDesc,
        requirements: jobReqs,
        skills: jobSkills,
        type: jobType,
        experience_level: jobExp,
        salary_min: jobSalaryMin || undefined,
        salary_max: jobSalaryMax || undefined,
        city: jobCity
      });
      
      setJobs([newJob, ...jobs]);
      setPostingJob(false);
      setSuccess("Job vacancy published successfully!");
      setSelectedJobId(newJob.id);
      fetchApplicants(newJob.id);
      
      // Reset form
      setJobTitle("");
      setJobDesc("");
      setJobReqs("");
      setJobSkills("");
      setJobSalaryMin(0);
      setJobSalaryMax(0);
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to post job");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusUpdate = async (appId: number, nextStatus: string) => {
    try {
      await api.applications.updateStatus(appId, nextStatus);
      // Reload applicants
      if (selectedJobId) {
        fetchApplicants(selectedJobId);
      }
    } catch (err: any) {
      setError("Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></span>
        <p className="text-xs text-zinc-500 mt-3 font-semibold">Loading company dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* 1. VERIFICATION BANNER */}
      {!company?.verified && (
        <div className="flex items-center gap-3 rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 text-xs text-violet-400">
          <ShieldAlert size={20} className="flex-shrink-0 animate-pulse text-violet-400" />
          <div>
            <span className="font-bold">Pending Moderator Verification: </span>
            Your account is currently under review by IT Park administrators. You can build your company profile, but vacancy publishing will be unlocked after verification is approved.
          </div>
        </div>
      )}

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: COMPANY DETAILS & POST JOB FORM */}
        <div className="lg:col-span-1 space-y-6">
          {/* COMPANY PROFILE DETAILS */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5">
            <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
              <h2 className="text-base font-bold text-white uppercase tracking-wider">Company Profile</h2>
              {!editingCompany && (
                <button
                  onClick={() => setEditingCompany(true)}
                  className="text-xs text-blue-400 hover:text-blue-300 font-bold transition"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {editingCompany ? (
              <form onSubmit={handleCompanySave} className="space-y-4 text-xs text-left">
                <div className="space-y-1">
                  <label className="text-zinc-400 font-bold uppercase tracking-wider">Company Name</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full rounded-lg bg-zinc-950 border border-white/10 p-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 font-bold uppercase tracking-wider">Industry</label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g. IT, FinTech, E-commerce"
                    className="w-full rounded-lg bg-zinc-950 border border-white/10 p-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 font-bold uppercase tracking-wider">Website URL</label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://domain.com"
                    className="w-full rounded-lg bg-zinc-950 border border-white/10 p-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 font-bold uppercase tracking-wider">Office Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street name, City"
                    className="w-full rounded-lg bg-zinc-950 border border-white/10 p-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 font-bold uppercase tracking-wider">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full rounded-lg bg-zinc-950 border border-white/10 p-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingCompany(false)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 font-bold text-white transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 font-bold text-white transition"
                  >
                    Save
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 text-left">
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-1.5">
                    <Building2 size={18} className="text-blue-400" />
                    {company.name}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">{company.industry || "Industry unlisted"}</p>
                </div>
                
                {company.description && (
                  <p className="text-xs text-zinc-300 leading-relaxed">{company.description}</p>
                )}

                <div className="space-y-2 border-t border-white/5 pt-3 text-xs text-zinc-400">
                  {company.website && (
                    <a href={company.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white transition">
                      <Globe size={14} className="text-blue-500" />
                      <span>{company.website}</span>
                    </a>
                  )}
                  {company.address && (
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-violet-500" />
                      <span>{company.address}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ACTIVE VACANCIES LIST FOR MY COMPANY */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 text-left">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase size={16} className="text-violet-400" />
                Active Roles ({jobs.length})
              </h2>

              {company?.verified && !postingJob && (
                <button
                  onClick={() => setPostingJob(true)}
                  className="rounded-full bg-blue-600 hover:bg-blue-500 p-1.5 text-white transition"
                  title="Post new Job"
                >
                  <Plus size={14} />
                </button>
              )}
            </div>

            {jobs.length === 0 ? (
              <div className="text-xs text-zinc-500 text-center py-6 border border-dashed border-white/10 rounded-xl">
                No vacancies published yet.
              </div>
            ) : (
              <div className="space-y-2">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => handleJobSelect(job.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition text-xs flex justify-between items-center ${
                      selectedJobId === job.id
                        ? "border-blue-500/50 bg-blue-500/5 text-white font-semibold"
                        : "border-white/5 hover:bg-white/5 text-zinc-400"
                    }`}
                  >
                    <span>{job.title}</span>
                    <ArrowUpRight size={14} className={selectedJobId === job.id ? "text-blue-400" : "text-zinc-600"} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: CANDIDATES SCREENING (AI MATCH) AND POST VACANCY FORM */}
        <div className="lg:col-span-2 space-y-6">
          {postingJob ? (
            /* NEW VACANCY POST FORM */
            <div className="glass-panel p-6 rounded-2xl border border-white/5 text-left">
              <h2 className="text-base font-bold text-white uppercase tracking-wider mb-4 border-b border-white/5 pb-2">Publish IT Vacancy</h2>
              
              <form onSubmit={handlePostJob} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-zinc-400 font-bold uppercase tracking-wider">Vacancy Title</label>
                    <input
                      type="text"
                      required
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="e.g. Backend Engineer (Python)"
                      className="w-full rounded-lg bg-zinc-950 border border-white/10 p-2.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-zinc-400 font-bold uppercase tracking-wider">City Location</label>
                    <select
                      value={jobCity}
                      onChange={(e) => setJobCity(e.target.value)}
                      className="w-full rounded-lg bg-zinc-950 border border-white/10 p-2.5 text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="Nukus">Nukus</option>
                      <option value="Muynak">Muynak</option>
                      <option value="Khojeyli">Khojeyli</option>
                      <option value="Kungrad">Kungrad</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-zinc-400 font-bold uppercase tracking-wider">Work Environment</label>
                    <select
                      value={jobType}
                      onChange={(e) => setJobType(e.target.value)}
                      className="w-full rounded-lg bg-zinc-950 border border-white/10 p-2.5 text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="office">Office Placement</option>
                      <option value="hybrid">Hybrid Work</option>
                      <option value="remote">Fully Remote</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-zinc-400 font-bold uppercase tracking-wider">Target Level</label>
                    <select
                      value={jobExp}
                      onChange={(e) => setJobExp(e.target.value)}
                      className="w-full rounded-lg bg-zinc-950 border border-white/10 p-2.5 text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="junior">Junior Developer</option>
                      <option value="middle">Middle Specialist</option>
                      <option value="senior">Senior Engineer</option>
                      <option value="lead">Lead / Architect</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-zinc-400 font-bold uppercase tracking-wider">Minimum Salary (UZS)</label>
                    <input
                      type="number"
                      value={jobSalaryMin || ""}
                      onChange={(e) => setJobSalaryMin(Number(e.target.value))}
                      placeholder="e.g. 8000000"
                      className="w-full rounded-lg bg-zinc-950 border border-white/10 p-2.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-zinc-400 font-bold uppercase tracking-wider">Maximum Salary (UZS)</label>
                    <input
                      type="number"
                      value={jobSalaryMax || ""}
                      onChange={(e) => setJobSalaryMax(Number(e.target.value))}
                      placeholder="e.g. 14000000"
                      className="w-full rounded-lg bg-zinc-950 border border-white/10 p-2.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 font-bold uppercase tracking-wider">Required Skills (Comma-separated)</label>
                  <input
                    type="text"
                    required
                    value={jobSkills}
                    onChange={(e) => setJobSkills(e.target.value)}
                    placeholder="Python, FastAPI, SQL, Docker (Used to compute AI Match scoring)"
                    className="w-full rounded-lg bg-zinc-950 border border-white/10 p-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 font-bold uppercase tracking-wider">Job Description</label>
                  <textarea
                    required
                    value={jobDesc}
                    onChange={(e) => setJobDesc(e.target.value)}
                    rows={4}
                    placeholder="Describe tasks, roles, team outline..."
                    className="w-full rounded-lg bg-zinc-950 border border-white/10 p-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 font-bold uppercase tracking-wider">Candidate Requirements</label>
                  <textarea
                    required
                    value={jobReqs}
                    onChange={(e) => setJobReqs(e.target.value)}
                    rows={3}
                    placeholder="List required experience, degrees, technical background..."
                    className="w-full rounded-lg bg-zinc-950 border border-white/10 p-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setPostingJob(false)}
                    className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 font-bold text-white transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 font-bold text-white transition"
                  >
                    {actionLoading ? "Publishing..." : "Publish Vacancy"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* APPLICANTS SCREENING DASHBOARD */
            <div className="glass-panel p-6 rounded-2xl border border-white/5 text-left">
              <h2 className="text-base font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-1.5">
                <Users size={18} className="text-blue-400" />
                Candidates Screening Pipeline
              </h2>

              {!selectedJobId ? (
                <div className="text-xs text-zinc-500 text-center py-20 border border-dashed border-white/10 rounded-2xl">
                  Select or publish a job vacancy to view matching applicants.
                </div>
              ) : applicants.length === 0 ? (
                <div className="text-xs text-zinc-500 text-center py-20 border border-dashed border-white/10 rounded-2xl">
                  No applications received yet for the selected position.
                </div>
              ) : (
                <div className="space-y-6">
                  {applicants.map((app) => (
                    <div key={app.id} className="p-5 rounded-2xl bg-zinc-950/40 border border-white/5 space-y-4">
                      {/* Top profile banner */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-3">
                        <div>
                          <h3 className="text-sm font-bold text-white">{app.candidate?.full_name}</h3>
                          <p className="text-[11px] text-zinc-400 mt-0.5">{app.candidate?.current_position || "CS Student"}</p>
                          <div className="flex items-center gap-4 text-[10px] text-zinc-500 mt-1">
                            <span className="flex items-center gap-1">
                              <MapPin size={10} />
                              {app.candidate?.city}
                            </span>
                            {app.candidate?.telegram && (
                              <span className="text-blue-400 flex items-center gap-1">
                                <Phone size={10} />
                                @{app.candidate.telegram}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* AI score Gauge */}
                        <div className="flex items-center gap-3 bg-zinc-900 border border-white/5 px-3 py-1.5 rounded-xl">
                          <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-center border border-blue-500/20">
                            <span className="text-[10px] font-black text-white">{app.match_score}%</span>
                            <div className="absolute -inset-0.5 rounded-full bg-blue-500 opacity-20 blur-sm"></div>
                          </div>
                          <div>
                            <div className="text-[10px] font-bold text-white flex items-center gap-0.5">
                              <Brain size={10} className="text-blue-400" />
                              AI Match
                            </div>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-green-400">
                              {app.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* AI Matching explanation details */}
                      {app.match_details && (
                        <div className="text-[11px] space-y-2 bg-zinc-950/60 p-3 rounded-lg border border-white/5">
                          <div className="text-zinc-300 font-semibold">{app.match_details.explanation}</div>
                          
                          <div className="grid grid-cols-2 gap-4 pt-1">
                            {app.match_details.matched_skills?.length > 0 && (
                              <div>
                                <span className="font-bold text-green-500 uppercase tracking-widest text-[9px] block">Matching Stack:</span>
                                <span className="text-zinc-400 mt-0.5 block">{app.match_details.matched_skills.join(", ")}</span>
                              </div>
                            )}
                            {app.match_details.missing_skills?.length > 0 && (
                              <div>
                                <span className="font-bold text-red-400 uppercase tracking-widest text-[9px] block">Missing Stack:</span>
                                <span className="text-zinc-400 mt-0.5 block">{app.match_details.missing_skills.join(", ")}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Cover letter or Experience block */}
                      {app.cover_letter && (
                        <div>
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Applicant Note:</span>
                          <p className="text-[11px] text-zinc-300 bg-zinc-900/40 p-3 rounded border border-white/5 italic">
                            "{app.cover_letter}"
                          </p>
                        </div>
                      )}

                      {/* Recruiter Action Row */}
                      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-white/5 text-xs">
                        <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                          <Calendar size={12} />
                          Applied {new Date(app.created_at).toLocaleDateString()}
                        </span>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleStatusUpdate(app.id, "rejected")}
                            disabled={app.status === "rejected"}
                            className="px-3 py-1.5 rounded-lg border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-[10px] font-bold text-red-400 transition disabled:opacity-40"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(app.id, "interview")}
                            disabled={app.status === "interview"}
                            className="px-3 py-1.5 rounded-lg border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 text-[10px] font-bold text-blue-400 transition disabled:opacity-40"
                          >
                            Invite to Interview
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(app.id, "offer")}
                            disabled={app.status === "offer"}
                            className="px-4 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 text-[10px] font-bold text-white transition disabled:opacity-40"
                          >
                            Extend Offer
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
