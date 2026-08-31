"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { loginUser } from "@/services/auth-service";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await loginUser(email, password);
      router.push("/trips");
    } catch (err: any) {
      setError(err.message || "Failed to log in. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0eee6] text-[#141413] font-[family-name:var(--font-outfit)] flex flex-col justify-between">
      {/* Floating Navbar */}
      <Navbar />

      {/* Main Form Container */}
      <main className="pt-32 pb-20 px-6 sm:px-10 max-w-md mx-auto w-full flex-grow flex flex-col justify-center">
        <div className="bg-[#faf9f5] border border-[#cccbc8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#d97757] bg-[#d97757]/10 px-3 py-1 rounded-full border border-[#d97757]/20">
              Welcome Back
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#141413]">
              Sign in to KelanaAI
            </h1>
            <p className="text-xs text-[#87867f]">
              Access your saved AI itineraries and private travel history
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3.5 flex items-center gap-2">
              <span>⚠️</span>
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-[#87867f]">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alice@email.com"
                className="w-full px-4 py-2.5 bg-white border border-[#cccbc8] rounded-xl text-sm font-medium text-[#141413] placeholder-[#87867f] focus:outline-none focus:border-[#d97757] focus:ring-1 focus:ring-[#d97757] transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-[#87867f]">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                className="w-full px-4 py-2.5 bg-white border border-[#cccbc8] rounded-xl text-sm font-medium text-[#141413] placeholder-[#87867f] focus:outline-none focus:border-[#d97757] focus:ring-1 focus:ring-[#d97757] transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-[#141413] hover:bg-[#d97757] text-white font-semibold py-3 px-4 rounded-xl text-sm transition-all shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In →</span>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="pt-2 text-center text-xs text-[#87867f]">
            Don&apos;t have an account yet?{" "}
            <Link href="/register" className="font-semibold text-[#d97757] hover:underline">
              Create account
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
