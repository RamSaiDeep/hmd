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
    <div>

      <h1>{mode === "login" ? "Login" : "Sign Up"}</h1>

      {verified && (
        <p style={{ color: "green" }}>✅ Email verified! You can now log in.</p>
      )}
      {urlError && (
        <p style={{ color: "red" }}>❌ {urlError}</p>
      )}
      {error && (
        <p style={{ color: "red" }}>❌ {error}</p>
      )}
      {success && (
        <p style={{ color: "green" }}>✅ {success}</p>
      )}

      <div>
        <button onClick={() => { setMode("login"); setError(""); setSuccess(""); }}>
          Login
        </button>
        <button onClick={() => { setMode("signup"); setError(""); setSuccess(""); }}>
          Sign Up
        </button>
      </div>

      <br />

      {mode === "signup" && (
        <>
          <div>
            <label>Full Name *</label>
            <br />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sumanth Konduri"
            />
          </div>
          <br />
          <div>
            <label>Room Number</label>
            <br />
            <input
              type="text"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="A-204"
            />
          </div>
          <br />
          <div>
            <label>Phone Number</label>
            <br />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
            />
          </div>
          <br />
        </>
      )}

      <div>
        <label>Email *</label>
        <br />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </div>
      <br />

      <div>
        <label>Password *</label>
        <br />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="minimum 8 characters"
        />
      </div>
      <br />

      {mode === "signup" && (
        <>
          <div>
            <label>Confirm Password *</label>
            <br />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="repeat password"
            />
          </div>
          <br />
        </>
      )}

      <button
        onClick={mode === "login" ? handleLogin : handleSignup}
        disabled={loading}
      >
        {loading
          ? "Please wait..."
          : mode === "login"
          ? "Login →"
          : "Create Account →"}
      </button>

      <br /><br />

      <p>or</p>

      <button onClick={handleGoogle}>
        Continue with Google
      </button>

      <br /><br />
      <Link href="/">← Back to Home</Link>
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