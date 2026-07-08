"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import MaintenanceGraphicCarousel from "@/components/MaintenanceGraphicCarousel";
import { MaintenanceIcon } from "@/components/MaintenanceIcons";

const issueTypes = ["Electrical", "Fan", "Light", "Switch", "Cupboard", "Lock", "Welding", "Metal Cutting", "Wood Work", "Other"];

type ComplaintApiError = {
  error?: string;
  code?: string;
  details?: string;
};

function getSubmitErrorMessage(status: number, apiError?: ComplaintApiError) {
  if (apiError?.error) return apiError.error;

  if (status === 401) return "You are not logged in. Please log in and try again.";
  if (status === 400) return "Invalid complaint data. Please check all required fields.";
  if (status >= 500) return "Server error while submitting complaint. Please try again.";
  return "Failed to submit complaint.";
}

export default function RegisterComplaint() {
  const [submitted, setSubmitted] = useState(false);
  const [issueType, setIssueType] = useState("");
  const [issueDetail, setIssueDetail] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [defaultRoom, setDefaultRoom] = useState("");

  const [place, setPlace] = useState("");

  useEffect(() => {
    async function prefillRoomFromUser() {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      const room = data.user?.user_metadata?.room;
      if (typeof room === "string" && room.trim()) {
        const normalizedRoom = room.trim();
        setDefaultRoom(normalizedRoom);
        setPlace(normalizedRoom);
      }
    }

    prefillRoomFromUser();
  }, []);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  }

  async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }

  async function handleSubmit() {
    if (!place.trim()) {
      setError("Room/Place is required.");
      return;
    }

    if (!issueType.trim()) {
      setError("Issue type is required.");
      return;
    }

    if (issueType === "Other" && !issueDetail.trim()) {
      setError("Please describe the issue when issue type is 'Other'.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let photoUrl = "";
      if (photo) {
        photoUrl = await fileToBase64(photo);
      }

      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          place,
          issueType,
          issueDetail: issueType === "Other" ? issueDetail : "",
          description,
          photoUrl: photoUrl || undefined,
        }),
      });

      const json = await res.json().catch(() => ({} as ComplaintApiError));

      if (!res.ok) {
        const apiError = json as ComplaintApiError;
        const message = getSubmitErrorMessage(res.status, apiError);
        const errorCode = apiError?.code ? ` [${apiError.code}]` : "";
        setError(`${message}${errorCode}`);
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Network error while submitting complaint. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setSubmitted(false);
    setIssueType("");
    setIssueDetail("");
    setDescription("");
    setPhoto(null);
    setPhotoPreview(null);
    setPlace(defaultRoom);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 rounded-full bg-neon-blue blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 rounded-full bg-neon-gold blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Register a Complaint</h1>
            <p className="text-muted-foreground">Tell us what needs fixing and we'll take care of it</p>
          </div>
          <Link href="/" className={cn(buttonVariants({ variant: "outline" }), "hidden sm:flex")}>
            ← Return Home
          </Link>
        </div>

        {submitted ? (
          // Success state
          <div className="max-w-2xl mx-auto glass p-12 rounded-2xl text-center">
            <div className="text-6xl mb-6 animate-float">✅</div>
            <h2 className="text-3xl font-bold text-foreground mb-3">Complaint Registered!</h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Thank you! Our maintenance team will review your request and get back to you shortly. 
              You can track the status from your dashboard.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button onClick={handleReset} className="px-8 py-2 bg-neon-blue text-black font-semibold hover:shadow-lg hover:shadow-neon-blue/50">
                Submit Another Complaint
              </Button>
              <Link href="/">
                <Button className="px-8 py-2 border border-neon-gold text-neon-gold hover:bg-neon-gold/10">
                  Return to Home
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          // Form state
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left side - Graphics */}
            <div className="hidden lg:block h-[600px]">
              <MaintenanceGraphicCarousel />
            </div>

            {/* Right side - Form */}
            <div className="glass p-8 rounded-2xl"
              style={{
                background: 'rgba(26, 31, 46, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(0, 212, 255, 0.1)'
              }}
            >
              {error && (
                <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                  <p className="text-sm text-red-400" role="alert">
                    {error}
                  </p>
                </div>
              )}

              <div className="space-y-6">

                {/* Room / Place - pre-filled from user profile */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-muted-foreground" htmlFor="place">
                    Room Number / Place
                  </label>
                  <input
                    id="place"
                    type="text"
                    value={place}
                    onChange={(e) => setPlace(e.target.value)}
                    placeholder="e.g. A-204, Common Room, Corridor B"
                    className="rounded-lg px-4 py-3 text-sm bg-background/50 border border-neon-blue/20 text-foreground placeholder-muted-foreground focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue/30 transition"
                  />
                  <p className="text-xs text-muted-foreground">Pre-filled from your profile, change if needed</p>
                </div>

                {/* Issue type with icon preview */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-muted-foreground" htmlFor="issueType">
                    Issue Type
                  </label>
                  <div className="flex gap-2">
                    <select
                      id="issueType"
                      value={issueType}
                      onChange={(e) => setIssueType(e.target.value)}
                      className="flex-1 rounded-lg px-4 py-3 text-sm bg-background/50 border border-neon-blue/20 text-foreground focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue/30 transition appearance-none"
                    >
                      <option value="">Select an issue type</option>
                      {issueTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    {issueType && (
                      <div className="w-12 h-12 rounded-lg border border-neon-blue/20 flex items-center justify-center text-neon-blue flex-shrink-0">
                        <MaintenanceIcon type={issueType} className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Extra description only if Other */}
                {issueType === "Other" && (
                  <div className="flex flex-col gap-2 animate-slide-in-left">
                    <label className="text-sm font-medium text-muted-foreground" htmlFor="issueDescription">
                      Describe the Issue
                    </label>
                    <textarea
                      id="issueDescription"
                      rows={3}
                      placeholder="Describe what needs to be fixed..."
                      value={issueDetail}
                      onChange={(e) => setIssueDetail(e.target.value)}
                      className="rounded-lg px-4 py-3 text-sm bg-background/50 border border-neon-blue/20 text-foreground placeholder-muted-foreground focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue/30 transition resize-none"
                    />
                  </div>
                )}

                {/* Additional details */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-muted-foreground" htmlFor="additionalDetails">
                    Additional Details <span className="text-xs text-muted-foreground/70 font-normal">(optional)</span>
                  </label>
                  <textarea
                    id="additionalDetails"
                    rows={3}
                    placeholder="Any extra information that might help our team..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="rounded-lg px-4 py-3 text-sm bg-background/50 border border-neon-blue/20 text-foreground placeholder-muted-foreground focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue/30 transition resize-none"
                  />
                </div>

                {/* Photo upload */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Photo Evidence <span className="text-xs text-muted-foreground/70 font-normal">(optional)</span>
                  </label>
                  <label
                    className="flex flex-col items-center justify-center border-2 border-dashed border-neon-blue/30 hover:border-neon-blue/60 rounded-lg py-8 cursor-pointer transition"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    {photoPreview ? (
                      <Image
                        src={photoPreview}
                        alt="Preview"
                        width={512}
                        height={512}
                        className="max-h-40 rounded-lg object-contain"
                        unoptimized
                      />
                    ) : (
                      <>
                        <span className="text-4xl mb-3">📸</span>
                        <span className="text-muted-foreground text-sm">Click to upload a photo</span>
                        <span className="text-muted-foreground/70 text-xs mt-1">JPG, PNG, WEBP • Max 5MB</span>
                      </>
                    )}
                  </label>
                  {photo && (
                    <div className="flex items-center justify-between text-xs px-1 py-2">
                      <span className="text-muted-foreground">📎 {photo.name}</span>
                      <button
                        onClick={() => { setPhoto(null); setPhotoPreview(null); }}
                        className="text-neon-gold hover:text-neon-gold/70 transition font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {/* Submit button */}
                <button
                  onClick={handleSubmit}
                  disabled={loading || !place.trim() || !issueType}
                  className="w-full mt-4 px-6 py-3 rounded-lg bg-gradient-to-r from-neon-blue to-neon-gold text-black font-bold hover:shadow-lg hover:shadow-neon-blue/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "⏳ Submitting..." : "Submit Complaint →"}
                </button>
              </div>

              {/* Mobile graphics - Show below form on small screens */}
              <div className="lg:hidden h-96 mt-8">
                <MaintenanceGraphicCarousel />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile return home link */}
      <div className="lg:hidden text-center mt-8 pb-8">
        <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
          ← Return Home
        </Link>
      </div>
    </div>
  );
}
