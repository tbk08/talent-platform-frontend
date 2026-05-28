"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Shield, Building2, Check, ShieldAlert, Award, FileText, Trash2, Users } from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [pendingCompanies, setPendingCompanies] = useState<any[]>([]);
  const [marketStats, setMarketStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const user = api.auth.getCurrentUser();
    if (!user) {
      router.push("/auth");
      return;
    }
    if (user.role !== "admin") {
      router.push("/");
      return;
    }
    setCurrentUser(user);
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const pending = await api.companies.listPending();
      setPendingCompanies(pending);

      const stats = await api.analytics.getMarket();
      setMarketStats(stats);
    } catch (err: any) {
      console.error(err);
      setError("Failed to fetch administrator records");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    setError("");
    setSuccess("");
    try {
      await api.companies.verify(id);
      setSuccess("Company account verified successfully!");
      // Reload lists
      const pending = await api.companies.listPending();
      setPendingCompanies(pending);
      
      const stats = await api.analytics.getMarket();
      setMarketStats(stats);

      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError("Failed to verify company");
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></span>
        <p className="text-xs text-zinc-500 mt-3 font-semibold">Loading admin panel...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* TOP HEADER */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center gap-4 text-left">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600/10 border border-violet-500/20 text-violet-400">
          <Shield size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white">Central Admin Dashboard</h1>
          <p className="text-xs text-zinc-400">Moderating companies, approving IT Park recruiters, and auditing market diagnostics.</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT SECTION: PENDING COMPANIES LIST */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/5 text-left">
            <h2 className="text-base font-bold text-white uppercase tracking-wider mb-4 border-b border-white/5 pb-2 flex items-center gap-2">
              <Building2 size={18} className="text-blue-400" />
              Recruiter Approval Queue ({pendingCompanies.length})
            </h2>

            {pendingCompanies.length === 0 ? (
              <div className="text-xs text-zinc-500 text-center py-12 border border-dashed border-white/10 rounded-xl">
                No companies pending verification. All partners are verified.
              </div>
            ) : (
              <div className="space-y-4">
                {pendingCompanies.map((co) => (
                  <div key={co.id} className="p-4 bg-zinc-950/40 border border-white/5 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                      <h3 className="text-sm font-bold text-white">{co.name}</h3>
                      <p className="text-[11px] text-zinc-500 mt-0.5">{co.industry || "No industry listed"}</p>
                      {co.website && (
                        <a 
                          href={co.website} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-[10px] text-blue-400 hover:underline mt-1 block"
                        >
                          {co.website}
                        </a>
                      )}
                    </div>

                    <button
                      onClick={() => handleApprove(co.id)}
                      className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-[11px] font-bold text-white transition self-end sm:self-auto"
                    >
                      Approve & Verify
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SECTION: SYSTEM STATS SUMMARY */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/5 text-left">
            <h2 className="text-base font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Shield size={18} className="text-violet-400" />
              System Diagnostics
            </h2>

            {marketStats && (
              <div className="space-y-4 text-xs">
                <div className="flex justify-between p-3 rounded bg-zinc-950/60 border border-white/5">
                  <span className="text-zinc-400">Total Registered Talents</span>
                  <span className="font-bold text-white">{marketStats.total_candidates}</span>
                </div>
                <div className="flex justify-between p-3 rounded bg-zinc-950/60 border border-white/5">
                  <span className="text-zinc-400">Total Verified Companies</span>
                  <span className="font-bold text-white">{marketStats.total_companies}</span>
                </div>
                <div className="flex justify-between p-3 rounded bg-zinc-950/60 border border-white/5">
                  <span className="text-zinc-400">Total Active Vacancies</span>
                  <span className="font-bold text-white">{marketStats.total_jobs}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
