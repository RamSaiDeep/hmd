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
  const supabase = createClient();

  const verified = searchParams.get("verified");
  const urlError = searchParams.get("error");

  const inputClass =
    "mt-1 w-full rounded-xl border border-white/25 bg-slate-900/70 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30";
  const buttonClass =
    "w-full rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-60";
  const googleClass =
    "w-full rounded-xl border border-white/20 bg-slate-900/70 px-4 py-3 text-sm text-white hover:border-cyan-400/60";

  function buildAuthCallbackUrl(nextPath: string) {
    const callbackUrl = new URL("/auth/callback", window.location.origin);
    callbackUrl.searchParams.set("next", nextPath);
    return callbackUrl.toString();
  }

  // 🔥 LOGIN
  async function handleLogin() {
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // ✅ Sync user to Prisma
    await fetch("/api/auth/sync-user", { method: "POST", credentials: "include" });

    router.push("/dashboard");
    router.refresh();
  }

  // 🔥 SIGNUP
  async function handleSignup() {
    setLoading(true);
    setError("");
    setSuccess("");

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

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone,
          room,
          role: "user",
        },
        emailRedirectTo: buildAuthCallbackUrl("/login?verified=true"),
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess("Account created! Please verify your email.");

      // Sync immediately when Supabase returns a session during signup.
      if (data.session) {
        await fetch("/api/auth/sync-user", { method: "POST", credentials: "include" });
      }
    }

    setLoading(false);
  }

  // 🔥 GOOGLE LOGIN
  async function handleGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: buildAuthCallbackUrl("/dashboard"),
      },
    });

    if (error) {
      setError(error.message);
    }
  }

  return (
    <div className="mx-auto mt-10 w-full max-w-md rounded-2xl border border-white/15 bg-slate-950/80 p-6 text-white shadow-xl">
      <h1 className="mb-4 text-2xl font-bold">
        {mode === "login" ? "Login" : "Sign Up"}
      </h1>

      {verified && <p className="text-green-400">✅ Email verified!</p>}
      {urlError && <p className="text-red-400">❌ {urlError}</p>}
      {error && <p className="text-red-400">❌ {error}</p>}
      {success && <p className="text-green-400">✅ {success}</p>}

      <div className="flex gap-2 mb-4">
        <button onClick={() => setMode("login")}>Login</button>
        <button onClick={() => setMode("signup")}>Sign Up</button>
      </div>

      {mode === "signup" && (
        <>
          <input
            className={inputClass}
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className={inputClass}
            placeholder="Room"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          />
          <input
            className={inputClass}
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </>
      )}

      <input
        className={inputClass}
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className={inputClass}
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {mode === "signup" && (
        <input
          className={inputClass}
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      )}

      <button
        className={buttonClass}
        onClick={mode === "login" ? handleLogin : handleSignup}
        disabled={loading}
      >
        {loading ? "Loading..." : mode === "login" ? "Login" : "Sign Up"}
      </button>

      <p className="text-center my-3">or</p>

      <button className={googleClass} onClick={handleGoogle}>
        Continue with Google
      </button>

      <Link href="/">← Back</Link>
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
