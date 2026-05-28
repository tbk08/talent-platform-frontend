"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { LogIn, UserPlus, Eye, EyeOff, ShieldAlert, Check } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<"candidate" | "company">("candidate");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // If already logged in, redirect to correct panel
    const user = api.auth.getCurrentUser();
    if (user) {
      redirectUser(user.role);
    }
  }, []);

  const redirectUser = (userRole: string) => {
    if (userRole === "admin") router.push("/admin");
    else if (userRole === "company") router.push("/company");
    else router.push("/candidate");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        // Sign In
        const res = await api.auth.login({ email, password });
        window.dispatchEvent(new Event("auth-state-change"));
        setSuccess(true);
        setTimeout(() => {
          redirectUser(res.role);
        }, 800);
      } else {
        // Register
        await api.auth.register({
          email,
          password,
          role,
        });
        
        // Auto-login after registration
        const res = await api.auth.login({ email, password });
        
        // If they registered as a company, let them know they need to wait for moderation
        // (but we still login so they can fill profile)
        window.dispatchEvent(new Event("auth-state-change"));
        setSuccess(true);
        setTimeout(() => {
          redirectUser(res.role);
        }, 800);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full radial-bg-blue opacity-30 pointer-events-none blur-[80px]"></div>

      <div className="w-full max-w-md space-y-6 glass-panel p-8 rounded-2xl border border-white/10 relative z-10 shadow-2xl">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="mt-2 text-xs text-zinc-400">
            {isLogin ? "Sign in to access your talent dashboard" : "Join the IT Talent Ecosystem of Karakalpakstan"}
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
            <ShieldAlert size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-xs text-green-400">
            <Check size={16} />
            <span>Success! Redirecting you now...</span>
          </div>
        )}

        {/* Register Role Selector */}
        {!isLogin && (
          <div className="grid grid-cols-2 gap-3 p-1 rounded-lg bg-zinc-950 border border-white/5">
            <button
              type="button"
              onClick={() => setRole("candidate")}
              className={`py-2 text-xs font-bold rounded-md transition ${
                role === "candidate"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              I am a Candidate
            </button>
            <button
              type="button"
              onClick={() => setRole("company")}
              className={`py-2 text-xs font-bold rounded-md transition ${
                role === "company"
                  ? "bg-violet-600 text-white shadow-md"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              I am a Recruiter
            </button>
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-zinc-900 px-4 py-2.5 text-sm text-white placeholder-zinc-500 transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="e.g. name@domain.com"
            />
          </div>

          <div className="space-y-1 relative">
            <label className="text-xs font-semibold text-zinc-300">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-zinc-900 pl-4 pr-10 py-2.5 text-sm text-white placeholder-zinc-500 transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-500 hover:text-zinc-300"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r ${
              role === "company" && !isLogin
                ? "from-violet-600 to-indigo-600 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                : "from-blue-600 to-violet-600 hover:shadow-[0_0_20px_rgba(37,99,235,0.3)]"
            } py-2.5 text-sm font-bold text-white transition duration-300 disabled:opacity-50`}
          >
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
            ) : isLogin ? (
              <>
                <LogIn size={16} />
                Sign In
              </>
            ) : (
              <>
                <UserPlus size={16} />
                Register
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold transition"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}
