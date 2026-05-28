"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { 
  User, Mail, MapPin, CheckCircle, Upload, ShieldAlert, 
  ExternalLink, Link, Send, FileText, Check, ListChecks, Brain, Plus
} from "lucide-react";

export default function CandidateDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Profile edit state
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("Nukus");
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");
  const [education, setEducation] = useState("");
  const [currentPosition, setCurrentPosition] = useState("");
  const [status, setStatus] = useState("open_to_work");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [telegram, setTelegram] = useState("");
  
  // CV Upload state
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  const [error, setError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const user = api.auth.getCurrentUser();
    if (!user) {
      router.push("/auth");
      return;
    }
    if (user.role !== "candidate") {
      router.push("/");
      return;
    }
    setCurrentUser(user);
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const pData = await api.profile.get();
      setProfile(pData);
      
      // Seed form values
      setFullName(pData.full_name || "");
      setBio(pData.bio || "");
      setCity(pData.city || "Nukus");
      setSkills(pData.skills || "");
      setExperience(pData.experience || "");
      setEducation(pData.education || "");
      setCurrentPosition(pData.current_position || "");
      setStatus(pData.status || "open_to_work");
      setGithub(pData.github || "");
      setLinkedin(pData.linkedin || "");
      setTelegram(pData.telegram || "");

      // Applications
      const apps = await api.applications.listMy();
      setApplications(apps);

      // AI Recs
      const recs = await api.analytics.getAIRecommendations();
      setRecommendations(recs);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaveSuccess(false);
    
    try {
      const updated = await api.profile.update({
        full_name: fullName,
        bio,
        city,
        skills,
        experience,
        education,
        current_position: currentPosition,
        status,
        github,
        linkedin,
        telegram
      });
      setProfile(updated);
      setSaveSuccess(true);
      setEditing(false);
      
      // Reload recommendations in case skills changed
      const recs = await api.analytics.getAIRecommendations();
      setRecommendations(recs);

      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save profile");
    }
  };

  const handleCvUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cvFile) return;
    setUploadLoading(true);
    setUploadSuccess(false);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", cvFile);
      
      const res = await api.profile.uploadCV(formData);
      setProfile(res);
      setUploadSuccess(true);
      setCvFile(null);
      
      // Populate fields automatically from parsed results
      setFullName(res.full_name || "");
      setSkills(res.skills || "");
      setTelegram(res.telegram || "");
      setGithub(res.github || "");
      setLinkedin(res.linkedin || "");
      
      // Reload applications and recommendations
      const recs = await api.analytics.getAIRecommendations();
      setRecommendations(recs);

      setTimeout(() => setUploadSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message || "Failed to upload and parse CV");
    } finally {
      setUploadLoading(false);
    }
  };

  const calculateProfileProgress = () => {
    if (!profile) return 0;
    let points = 0;
    let total = 8;
    if (profile.full_name && profile.full_name !== "Candidate Name") points++;
    if (profile.bio) points++;
    if (profile.skills) points++;
    if (profile.experience) points++;
    if (profile.education) points++;
    if (profile.cv_filename) points++;
    if (profile.telegram) points++;
    if (profile.github || profile.linkedin) points++;
    return Math.round((points / total) * 100);
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></span>
        <p className="text-xs text-zinc-500 mt-3 font-semibold">Loading candidate portal...</p>
      </div>
    );
  }

  const progress = calculateProfileProgress();

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* ERROR DISPLAY */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-400">
          <ShieldAlert size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* DASHBOARD TOP: PROGRESS CARD */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-white">Hello, {profile?.full_name || currentUser?.name}!</h1>
          <p className="text-xs text-zinc-400">Manage your credentials, upload your resume, and track AI vacancy matches.</p>
        </div>

        {/* Profile completion gauge */}
        <div className="flex items-center gap-4 bg-zinc-950/40 border border-white/5 p-4 rounded-xl">
          <div className="w-24 bg-zinc-900 rounded-full h-2 relative">
            <div className="bg-gradient-to-r from-blue-500 to-violet-500 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
          <div>
            <div className="text-xs font-bold text-white">{progress}% Profile Strength</div>
            <p className="text-[10px] text-zinc-500">Stronger profiles match higher on AI queries.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: EDIT PROFILE AND CV PARSER */}
        <div className="lg:col-span-2 space-y-6">
          {/* CV PARSER COMPONENT */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-24 w-24 rounded-full radial-bg-blue opacity-10 blur-xl"></div>
            
            <h2 className="text-base font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
              <Brain size={18} className="text-blue-400" />
              AI CV Parser
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              Upload your CV in PDF format. Our NLP engine will analyze your skills, parse email/telegram handles, and auto-complete your profile tags.
            </p>

            {uploadSuccess && (
              <div className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-xs text-green-400 mb-4 animate-fade-in">
                <Check size={16} />
                <span>Resume parsed successfully! Extracted tags, handles, and updated your profile details.</span>
              </div>
            )}

            <form onSubmit={handleCvUpload} className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl border border-dashed border-white/10 bg-zinc-950/40">
              <div className="flex-1 w-full relative flex flex-col items-center justify-center py-4 cursor-pointer hover:bg-white/5 rounded-lg border border-white/5 transition">
                <Upload size={20} className="text-zinc-500 mb-1" />
                <span className="text-xs text-zinc-300 font-semibold">
                  {cvFile ? cvFile.name : "Select PDF resume file"}
                </span>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>

              <button
                type="submit"
                disabled={!cvFile || uploadLoading}
                className="w-full sm:w-auto px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition disabled:opacity-40"
              >
                {uploadLoading ? "Parsing PDF..." : "Upload & Parse"}
              </button>
            </form>

            {profile?.cv_filename && (
              <div className="flex items-center gap-2 text-xs text-zinc-400 mt-3 bg-zinc-950/20 p-2 rounded">
                <FileText size={14} className="text-blue-400" />
                <span>Active CV: <strong className="text-white">{profile.cv_filename}</strong></span>
              </div>
            )}
          </div>

          {/* CANDIDATE PROFILE FORM */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold text-white uppercase tracking-wider">Developer Credentials</h2>
              
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {saveSuccess && (
              <div className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-xs text-green-400 mb-4">
                <Check size={16} />
                <span>Profile saved successfully!</span>
              </div>
            )}

            {editing ? (
              <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-zinc-400 font-bold uppercase tracking-wider">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-lg bg-zinc-950 border border-white/10 p-2.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-zinc-400 font-bold uppercase tracking-wider">Current Role / Title</label>
                    <input
                      type="text"
                      value={currentPosition}
                      onChange={(e) => setCurrentPosition(e.target.value)}
                      placeholder="e.g. Junior Python Dev / CS Student"
                      className="w-full rounded-lg bg-zinc-950 border border-white/10 p-2.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                      <option value="Beruni">Beruni</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-zinc-400 font-bold uppercase tracking-wider">Availability Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full rounded-lg bg-zinc-950 border border-white/10 p-2.5 text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="open_to_work">Open to Work</option>
                      <option value="open_for_freelance">Open for Freelance</option>
                      <option value="interviewing">Interviewing</option>
                      <option value="employed">Employed / Not looking</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-zinc-400 font-bold uppercase tracking-wider">Telegram Handle</label>
                    <input
                      type="text"
                      value={telegram}
                      onChange={(e) => setTelegram(e.target.value)}
                      placeholder="e.g. aybek_dev"
                      className="w-full rounded-lg bg-zinc-950 border border-white/10 p-2.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 font-bold uppercase tracking-wider">Skills tags (Comma-separated)</label>
                  <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="Python, FastAPI, Next.js, React, Docker..."
                    className="w-full rounded-lg bg-zinc-950 border border-white/10 p-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 font-bold uppercase tracking-wider">Professional Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg bg-zinc-950 border border-white/10 p-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 font-bold uppercase tracking-wider">Work Experience Summary</label>
                  <textarea
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    rows={3}
                    placeholder="Describe your previous work roles, projects and outcomes..."
                    className="w-full rounded-lg bg-zinc-950 border border-white/10 p-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 font-bold uppercase tracking-wider">Education Details</label>
                  <textarea
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    rows={2}
                    placeholder="Universities, degrees, online certifications..."
                    className="w-full rounded-lg bg-zinc-950 border border-white/10 p-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-zinc-400 font-bold uppercase tracking-wider">GitHub Profile URL</label>
                    <input
                      type="url"
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      placeholder="https://github.com/username"
                      className="w-full rounded-lg bg-zinc-950 border border-white/10 p-2.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-zinc-400 font-bold uppercase tracking-wider">LinkedIn Profile URL</label>
                    <input
                      type="url"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full rounded-lg bg-zinc-950 border border-white/10 p-2.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 font-bold text-white transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 font-bold text-white transition"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              /* Profile Details View Mode */
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                  <div>
                    <h3 className="text-lg font-black text-white">{profile?.full_name || "Enter Full Name"}</h3>
                    <p className="text-xs text-blue-400 font-semibold mt-0.5">{profile?.current_position || "Add title (e.g. Web Developer)"}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <span className="bg-zinc-950 border border-white/5 px-2.5 py-1 rounded text-[10px] font-bold text-zinc-400 flex items-center gap-1 uppercase">
                      <MapPin size={10} />
                      {profile?.city}
                    </span>
                    <span className="bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded text-[10px] font-bold text-green-400 flex items-center gap-1 uppercase">
                      <CheckCircle size={10} />
                      {profile?.status?.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>

                {profile?.bio && (
                  <div>
                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Biography</h4>
                    <p className="text-xs text-zinc-300 leading-relaxed">{profile.bio}</p>
                  </div>
                )}

                {profile?.skills && (
                  <div>
                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Tech Stack & Tags</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.skills.split(",").map((skill: string, idx: number) => (
                        <span key={idx} className="bg-zinc-950 border border-white/5 px-2.5 py-1 rounded text-xs text-zinc-300 font-semibold">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Work History</h4>
                    <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line">
                      {profile?.experience || "No work history listed yet."}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Education</h4>
                    <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line">
                      {profile?.education || "No education listed yet."}
                    </p>
                  </div>
                </div>

                {/* Social Links info */}
                <div className="flex flex-wrap gap-4 border-t border-white/5 pt-4">
                  {profile?.telegram && (
                    <a 
                      href={`https://t.me/${profile.telegram}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition"
                    >
                      <Send size={14} className="text-blue-400" />
                      <span>@{profile.telegram}</span>
                    </a>
                  )}
                  {profile?.github && (
                    <a 
                      href={profile.github} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition"
                    >
                      <ExternalLink size={14} className="text-zinc-300" />
                      <span>GitHub</span>
                    </a>
                  )}
                  {profile?.linkedin && (
                    <a 
                      href={profile.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition"
                    >
                      <Link size={14} className="text-blue-500" />
                      <span>LinkedIn</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: JOB APPLICATIONS AND AI RECOMMENDATIONS */}
        <div className="space-y-6">
          {/* AI MATCH RECOMMENDATIONS */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-20 w-20 rounded-full radial-bg-violet opacity-25 blur-xl"></div>
            
            <h2 className="text-base font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Brain size={18} className="text-violet-400" />
              AI Recs For You
            </h2>

            {recommendations.length === 0 ? (
              <div className="text-xs text-zinc-500 text-center py-6">
                Add skills tag to your credentials above to compute matching jobs.
              </div>
            ) : (
              <div className="space-y-3">
                {recommendations.map((job) => (
                  <div 
                    key={job.id} 
                    onClick={() => router.push(`/jobs?id=${job.id}`)}
                    className="p-3 bg-zinc-950/40 hover:bg-zinc-900 border border-white/5 rounded-xl cursor-pointer transition flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white hover:text-blue-400 transition">{job.title}</h4>
                      <p className="text-[10px] text-zinc-500 mt-0.5">{job.company?.name || "Verified Corp"}</p>
                      <span className="text-[10px] font-bold text-green-400 mt-1 block">
                        {job.salary_min ? `${(job.salary_min/1000000).toFixed(1)}M UZS` : "Salary Undisclosed"}
                      </span>
                    </div>
                    <span className="h-6 w-6 flex items-center justify-center rounded bg-blue-500/10 text-[10px] font-bold text-blue-400">
                      Go
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SUBMITTED JOB APPLICATIONS */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5">
            <h2 className="text-base font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <ListChecks size={18} className="text-green-400" />
              My Applications
            </h2>

            {applications.length === 0 ? (
              <div className="text-xs text-zinc-500 text-center py-6 border border-dashed border-white/10 rounded-xl">
                No job applications submitted yet.
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div key={app.id} className="p-4 bg-zinc-950/40 border border-white/5 rounded-xl text-left relative overflow-hidden">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-white leading-tight">{app.job?.title}</h4>
                        <p className="text-[10px] text-zinc-500 mt-0.5">{app.job?.company?.name}</p>
                      </div>
                      
                      <span className="h-8 w-8 flex-shrink-0 flex items-center justify-center rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-black text-white shadow" title="AI Match Percent">
                        {app.match_score}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5 text-[10px]">
                      <span className="text-zinc-500">Applied {new Date(app.created_at).toLocaleDateString()}</span>
                      
                      <span className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[9px] ${
                        app.status === "offer" 
                          ? "bg-green-500/20 text-green-400" 
                          : app.status === "rejected" 
                          ? "bg-red-500/20 text-red-400" 
                          : "bg-blue-500/20 text-blue-400"
                      }`}>
                        {app.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
