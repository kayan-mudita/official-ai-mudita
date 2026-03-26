"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Sparkles, Mail, Lock, User, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import SessionProvider from "@/components/SessionProvider";

const benefits = [
  "AI video content powered by Kling 2.6 & Seedance 2.0",
  "Weekly personalized content using your face & voice",
  "Automated social media scheduling",
  "Full consent-based control — nothing publishes without you",
  "14-day free trial, no credit card required",
];

function SignupForm() {
  const router = useRouter();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", industry: "real_estate", company: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error || "Signup failed"); setLoading(false); return; }

      // Auto sign in after signup
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.error) { setError("Account created but login failed"); setLoading(false); }
      else { router.push("/auth/onboarding"); }
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="absolute inset-0 mesh-gradient" />

      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left */}
        <div>
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">
              Official <span className="gradient-text">AI</span>
            </span>
          </Link>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
            Your AI marketing<br />
            <span className="gradient-text">teammate awaits</span>
          </h1>
          <p className="text-lg text-white/40 mb-8">
            Join professionals who save 15+ hours per week on content creation.
          </p>

          <ul className="space-y-3">
            {benefits.map((b, i) => (
              <li key={i} className="flex items-center gap-3 text-white/60 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                {b}
              </li>
            ))}
          </ul>
        </div>

        {/* Right - Form */}
        <div>
          <div className="glass-card p-8">
            <h2 className="text-xl font-bold mb-6">Create your account</h2>

            {error && (
              <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">First Name</label>
                  <input type="text" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="First name" autoComplete="off" className="input-field !py-2.5 text-sm" required />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">Last Name</label>
                  <input type="text" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder="Last name" autoComplete="off" className="input-field !py-2.5 text-sm" required />
                </div>
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email address" autoComplete="off" className="input-field pl-11 !py-2.5 text-sm" required />
                </div>
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min 8 characters" autoComplete="new-password" className="input-field pl-11 !py-2.5 text-sm" required minLength={8} />
                </div>
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1.5">Industry</label>
                <select value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} className="input-field !py-2.5 text-sm">
                  <option value="real_estate">Real Estate</option>
                  <option value="legal">Legal / Attorney</option>
                  <option value="medical">Medical / Healthcare</option>
                  <option value="creator">Content Creator</option>
                  <option value="other">Other Professional</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1.5">Company (optional)</label>
                <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company name (optional)" autoComplete="off" className="input-field !py-2.5 text-sm" />
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full gap-2 !mt-6 min-h-[48px] disabled:opacity-50">
                {loading ? "Creating account..." : "Start your free trial"}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            <p className="text-xs text-white/20 text-center mt-4">
              No credit card required · Cancel anytime
            </p>
          </div>

          <p className="text-center text-white/40 mt-6 text-sm">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 font-medium">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <SessionProvider>
      <SignupForm />
    </SessionProvider>
  );
}
