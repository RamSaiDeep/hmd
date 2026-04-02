"use client";
import { useState } from "react";
import Link from "next/link";

const issueTypes = ["Electrical", "Fan", "Light", "Switch", "Cupboard", "Lock", "Other"];

export default function RegisterComplaint() {
  const [submitted, setSubmitted] = useState(false);
  const [issueType, setIssueType] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // In reality this comes from the logged in user's profile
  // For now we hardcode it - later pulled from session
  const [place, setPlace] = useState("A-204");

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  }

  function handleSubmit() {
    setSubmitted(true);
  }

  function handleReset() {
    setSubmitted(false);
    setIssueType("");
    setPhoto(null);
    setPhotoPreview(null);
    setPlace("A-204");
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0a0f1a" }}>
      <nav className="flex items-center justify-between px-8 py-4 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-blue-600 rounded-lg w-8 h-8 flex items-center justify-center font-bold text-sm text-white">H</div>
          <span className="font-semibold text-lg text-white">MD</span>
        </Link>
        <Link href="/" className="text-gray-300 hover:text-white text-sm transition">← Home</Link>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="rounded-2xl p-8 border border-white/10" style={{ backgroundColor: "#111827" }}>
          <h1 className="text-2xl font-bold text-white mb-1">Register a Complaint</h1>
          <p className="text-gray-300 text-sm mb-8">Fill in the details and our team will get back to you.</p>

          {submitted ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">✅</div>
              <h2 className="text-xl font-bold text-white mb-2">Complaint Registered!</h2>
              <p className="text-gray-300 text-sm mb-6">Our team will look into it shortly.</p>
              <button
                onClick={handleReset}
                className="bg-blue-600 hover:bg-blue-500 transition px-6 py-3 rounded-xl font-semibold text-white"
              >
                Register Another
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-5">

              {/* Room / Place - pre-filled from user profile */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-300">
                  Room Number / Place
                  <span className="text-gray-500 ml-1">(pre-filled from your profile, change if needed)</span>
                </label>
                <input
                  type="text"
                  value={place}
                  onChange={(e) => setPlace(e.target.value)}
                  placeholder="e.g. A-204, Common Room, Corridor B"
                  className="rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 border border-white/10 transition"
                  style={{ backgroundColor: "#1e2a3a" }}
                />
              </div>

              {/* Issue type */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-300">Issue Type</label>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  className="rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 border border-white/10 transition"
                  style={{ backgroundColor: "#1e2a3a" }}
                >
                  <option value="">Select an issue type</option>
                  {issueTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Extra description only if Other */}
              {issueType === "Other" && (
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-gray-300">Describe the Issue</label>
                  <textarea
                    rows={3}
                    placeholder="Describe what the issue is..."
                    className="rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 border border-white/10 transition resize-none"
                    style={{ backgroundColor: "#1e2a3a" }}
                  />
                </div>
              )}

              {/* Additional details */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-300">
                  Additional Details
                  <span className="text-gray-500 ml-1">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Any extra information that might help..."
                  className="rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 border border-white/10 transition resize-none"
                  style={{ backgroundColor: "#1e2a3a" }}
                />
              </div>

              {/* Photo upload */}
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-300">
                  Photo
                  <span className="text-gray-500 ml-1">(optional)</span>
                </label>
                <label
                  className="flex flex-col items-center justify-center border border-dashed border-white/20 rounded-xl py-8 cursor-pointer hover:border-blue-500/50 transition"
                  style={{ backgroundColor: "#1e2a3a" }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="max-h-48 rounded-lg object-contain" />
                  ) : (
                    <>
                      <span className="text-3xl mb-2">📷</span>
                      <span className="text-gray-300 text-sm">Click to upload a photo</span>
                      <span className="text-gray-500 text-xs mt-1">JPG, PNG, WEBP supported</span>
                    </>
                  )}
                </label>
                {photo && (
                  <div className="flex items-center justify-between text-xs text-gray-300 px-1">
                    <span>📎 {photo.name}</span>
                    <button
                      onClick={() => { setPhoto(null); setPhotoPreview(null); }}
                      className="text-red-400 hover:text-red-300 transition"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-500 transition py-3 rounded-xl font-semibold text-white mt-2"
              >
                Submit Complaint →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}