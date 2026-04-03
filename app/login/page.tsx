"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function LoginContent() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [room, setRoom] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const verified = searchParams.get("verified");
  const urlError = searchParams.get("error");

  const supabase = createClient();
  const inputClass =
    "mt-1 w-full rounded-xl border border-white/25 bg-slate-900/70 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30";
  const tabButtonClass =
    "rounded-lg border border-white/20 px-4 py-2 text-sm text-white transition hover:border-cyan-400/60 hover:bg-slate-800/80";
  const actionButtonClass =
    "w-full rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60";
  const googleButtonClass =
    "w-full rounded-xl border border-white/20 bg-slate-900/70 px-4 py-3 text-sm text-white transition hover:border-cyan-400/60 hover:bg-slate-800/80";

  async function handleLogin() {
    setLoading(true);
    setError("");

    console.log("Login attempt for:", email);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log("Login error:", error.message);
      setError(error.message);
      setLoading(false);
    } else {
      console.log("Login successful, redirecting to dashboard");
      router.push("/dashboard");
      router.refresh();
    }
  }

  async function handleSignup() {
    setLoading(true);
    setError("");
    setSuccess("");

    // Validation
    if (!name.trim()) {
      setError("Name is required");
      setLoading(false);
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    console.log("Signup attempt for:", email);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone,
          room,
          role: "user",
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.log("Signup error:", error.message);
      setError(error.message);
    } else {
      setSuccess("Account created! Please check your email to verify your account.");
      console.log("Signup successful — verification email sent to:", email);
    }

    setLoading(false);
  }

  async function handleGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.log("Google login error:", error.message);
      setError(error.message);
    }
  }

  return (
    <div className="mx-auto mt-10 w-full max-w-md rounded-2xl border border-white/15 bg-slate-950/80 p-6 text-white shadow-xl">
      <h1 className="mb-4 text-2xl font-bold">{mode === "login" ? "Login" : "Sign Up"}</h1>

      {verified && (
        <p role="status" className="mb-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">✅ Email verified! You can now log in.</p>
      )}
      {urlError && (
        <p role="alert" className="mb-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">❌ {urlError}</p>
      )}
      {error && (
        <p role="alert" className="mb-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">❌ {error}</p>
      )}
      {success && (
        <p role="status" className="mb-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">✅ {success}</p>
      )}

      <div className="mb-5 flex gap-2">
        <button className={tabButtonClass} onClick={() => { setMode("login"); setError(""); setSuccess(""); }}>
          Login
        </button>
        <button className={tabButtonClass} onClick={() => { setMode("signup"); setError(""); setSuccess(""); }}>
          Sign Up
        </button>
      </div>

      {mode === "signup" && (
        <>
          <div className="mb-4">
            <label htmlFor="fullName">Full Name *</label>
            <input
              className={inputClass}
              id="fullName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sumanth Konduri"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="roomNumber">Room Number</label>
            <input
              className={inputClass}
              id="roomNumber"
              type="text"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="A-204"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              className={inputClass}
              id="phoneNumber"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
            />
          </div>
        </>
      )}

      <div className="mb-4">
        <label htmlFor="email">Email *</label>
        <input
          className={inputClass}
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="password">Password *</label>
        <input
          className={inputClass}
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="minimum 8 characters"
        />
      </div>

      {mode === "signup" && (
        <div className="mb-4">
          <label htmlFor="confirmPassword">Confirm Password *</label>
          <input
            className={inputClass}
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="repeat password"
          />
        </div>
      )}

      <button
        className={actionButtonClass}
        onClick={mode === "login" ? handleLogin : handleSignup}
        disabled={loading}
      >
        {loading
          ? "Please wait..."
          : mode === "login"
            ? "Login →"
            : "Create Account →"}
      </button>

      <p className="my-4 text-center text-sm text-slate-300">or</p>

      <button className={googleButtonClass} onClick={handleGoogle}>
        Continue with Google
      </button>

      <div className="mt-4 text-sm">
        <Link className="text-cyan-300 hover:text-cyan-200" href="/">← Back to Home</Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
