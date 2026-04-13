"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const issueTypes = ["Electrical", "Fan", "Light", "Switch", "Cupboard", "Lock", "Other"];

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
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          place,
          issueType,
          issueDetail: issueType === "Other" ? issueDetail : "",
          description,
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
    <div className="min-h-screen">

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="rounded-2xl p-8 border bg-card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-1">Register a Complaint</h1>
              <p className="text-muted-foreground text-sm">Fill in the details and our team will get back to you.</p>
            </div>
            <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
              Return Home
            </Link>
          </div>

          {error && (
            <p className="mt-4 text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          {submitted ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">✅</div>
              <h2 className="text-xl font-bold text-foreground mb-2">Complaint Registered!</h2>
              <p className="text-muted-foreground text-sm mb-6">Our team will look into it shortly.</p>
              <Button onClick={handleReset}>Register Another</Button>
            </div>
          ) : (
            <div className="flex flex-col gap-5">

              {/* Room / Place - pre-filled from user profile */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-muted-foreground" htmlFor="place">
                  Room Number / Place
                  <span className="text-muted-foreground/70 ml-1">(pre-filled from your profile, change if needed)</span>
                </label>
                <input
                  id="place"
                  type="text"
                  value={place}
                  onChange={(e) => setPlace(e.target.value)}
                  placeholder="e.g. A-204, Common Room, Corridor B"
                  className="rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary border bg-background transition"
                />
              </div>

              {/* Issue type */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-muted-foreground" htmlFor="issueType">Issue Type</label>
                <select
                  id="issueType"
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  className="rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary border bg-background transition"
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
                  <label className="text-sm text-muted-foreground" htmlFor="issueDescription">Describe the Issue</label>
                  <textarea
                    id="issueDescription"
                    rows={3}
                    placeholder="Describe what issue is..."
                    value={issueDetail}
                    onChange={(e) => setIssueDetail(e.target.value)}
                    className="rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary border bg-background transition resize-none"
                  />
                </div>
              )}

              {/* Additional details */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-muted-foreground" htmlFor="additionalDetails">
                  Additional Details <span className="text-muted-foreground/70 ml-1">(optional)</span>
                </label>
                <textarea
                  id="additionalDetails"
                  rows={3}
                  placeholder="Any extra information that might help..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary border bg-background transition resize-none"
                />
              </div>

              {/* Photo upload */}
              <div className="flex flex-col gap-2">
                <label className="text-sm text-muted-foreground">
                  Photo
                  <span className="text-muted-foreground/70 ml-1">(optional)</span>
                </label>
                <label
                  className="flex flex-col items-center justify-center border border-dashed border-border rounded-xl py-8 cursor-pointer hover:border-primary transition"
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
                      className="max-h-48 rounded-lg object-contain"
                      unoptimized
                    />
                  ) : (
                    <>
                      <span className="text-3xl mb-2">📷</span>
                      <span className="text-muted-foreground text-sm">Click to upload a photo</span>
                      <span className="text-muted-foreground/70 text-xs mt-1">JPG, PNG, WEBP supported</span>
                    </>
                  )}
                </label>
                {photo && (
                  <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                    <span>📎 {photo.name}</span>
                    <button
                      onClick={() => { setPhoto(null); setPhotoPreview(null); }}
                      className="text-destructive hover:text-destructive/80 transition"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <Button
                onClick={handleSubmit}
                disabled={loading || !place.trim() || !issueType}
              >
                {loading ? "Submitting..." : "Submit Complaint →"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
