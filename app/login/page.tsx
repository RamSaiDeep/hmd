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
    "mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30";
  const buttonClass =
    "w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60";
  const googleClass =
    "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground hover:border-primary/60";

  async function syncUserToDatabase() {
    const response = await fetch("/api/auth/sync-user", { method: "POST" });
    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(data.error || "Failed to save your profile. Please try again.");
    }
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

    try {
      await syncUserToDatabase();
      router.push("/dashboard");
      router.refresh();
    } catch (syncError) {
      setError(syncError instanceof Error ? syncError.message : "Failed to sync account");
      setLoading(false);
    }
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
          name: name.trim(),
          phone: phone.trim(),
          room: room.trim(),
          role: "user",
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      try {
        await syncUserToDatabase();
        router.push("/dashboard");
        router.refresh();
        return;
      } catch (syncError) {
        setError(syncError instanceof Error ? syncError.message : "Failed to sync account");
        setLoading(false);
        return;
      }
    }

    setSuccess("Account created! Please verify your email, then log in.");
    setLoading(false);
  }

  // 🔥 GOOGLE LOGIN - DISABLED FOR SECURITY
  // async function handleGoogle() {
  //   const { error } = await supabase.auth.signInWithOAuth({
  //     provider: "google",
  //     options: {
  //       redirectTo: `${window.location.origin}/auth/callback`,
  //     },
  //   });

  //   if (error) {
  //     setError(error.message);
  //   }
  // }

  return (
    <div className="mx-auto mt-10 w-full max-w-md rounded-2xl border bg-card p-6 text-foreground shadow-xl">
      <h1 className="mb-4 text-2xl font-bold">
        {mode === "login" ? "Login" : "Sign Up"}
      </h1>

      {verified && <p className="text-emerald-500 mb-3">✅ Email verified!</p>}
      {urlError && <p className="text-destructive mb-3">❌ {urlError}</p>}
      {error && <p className="text-destructive mb-3">❌ {error}</p>}
      {success && <p className="text-emerald-500 mb-3">✅ {success}</p>}

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

      {/* Google login disabled for security */}
      {/* <button className={googleClass} onClick={handleGoogle}>
        Continue with Google
      </button> */}

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
