"use client";
import { useState } from "react";

type DhwaniRow = { item: string; quantity: string };

export default function MusicPrograms() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Basic fields
  const [eventName, setEventName] = useState("");
  const [organizerName, setOrganizerName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [venue, setVenue] = useState("");

  // Sound requirements table
  const [soundRows, setSoundRows] = useState<DhwaniRow[]>([
    { item: "", quantity: "" },
    { item: "", quantity: "" },
  ]);

  // Lighting
  const [needsLight, setNeedsLight] = useState(false);
  const [lighting, setLighting] = useState<string>("");

  // Additional notes
  const [notes, setNotes] = useState("");

  function addSoundRow() {
    setSoundRows((prev) => [...prev, { item: "", quantity: "" }]);
  }

  function removeSoundRow(index: number) {
    setSoundRows((prev) => prev.filter((_, i) => i !== index));
  }

  function updateSoundRow(index: number, field: "item" | "quantity", value: string) {
    setSoundRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  }

  async function handleSubmit() {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    // Clear any previous errors
    setError("");
    
    // Validation
    if (!eventName.trim()) {
      setError("Error: Event name is required");
      return;
    }
    if (!eventDate) {
      setError("Error: Event date is required");
      return;
    }
    if (!venue.trim()) {
      setError("Error: Venue is required");
      return;
    }
    if (soundRows.every((r) => !r.item.trim())) {
      setError("Error: Please add at least one sound requirement");
      return;
    }
    
    // Build request data
    const requestData = {
      eventName,
      organizer: organizerName,
      eventDate,
      eventTime,
      venue,
      soundItems: soundRows.filter((row) => row.item.trim() && row.quantity.trim()),
      needsLight,
      lighting: needsLight && lighting.trim() ? [lighting.trim()] : [],
      notes,
    };

    try {
      const response = await fetch("/api/music-programs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to submit request");
      }

      const result = await response.json();
      setError("");
      setSubmitted(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to submit request");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleReset() {
    setSubmitted(false);
    setError("");
    setIsSubmitting(false);
    setEventName("");
    setOrganizerName("");
    setEventDate("");
    setEventTime("");
    setVenue("");
    setSoundRows([{ item: "", quantity: "" }, { item: "", quantity: "" }]);
    setNeedsLight(false);
    setLighting([]);
    setNotes("");
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="rounded-2xl p-8 border bg-card">
          <h1 className="text-2xl font-bold text-foreground mb-1">Music Programs</h1>
          <p className="text-muted-foreground text-sm mb-8">Request sound and lighting support for your music event.</p>

          {submitted ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">✅</div>
              <h2 className="text-xl font-bold text-foreground mb-2">Request Submitted!</h2>
              <p className="text-muted-foreground text-sm mb-6">Our team will review and get back to you.</p>
              <button 
                onClick={handleReset}
                className="bg-primary hover:bg-primary/90 px-6 py-3 rounded-xl font-semibold text-primary-foreground"
              >
                Submit Another
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {error && (
                <div className="p-4 rounded-lg border border-destructive/20 bg-destructive/5">
                  <p className="text-sm text-destructive font-medium">{error}</p>
                </div>
              )}

              {/* Basic details */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-muted-foreground" htmlFor="eventName">Event Name *</label>
                <input
                  id="eventName"
                  type="text"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="e.g. Rock Night, Classical Evening"
                  className="rounded-xl px-4 py-3 text-sm text-foreground border bg-background focus:outline-none focus:border-primary transition"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm text-muted-foreground" htmlFor="organizerName">Organizer Name</label>
                <input
                  id="organizerName"
                  type="text"
                  value={organizerName}
                  onChange={(e) => setOrganizerName(e.target.value)}
                  placeholder="Your name"
                  className="rounded-xl px-4 py-3 text-sm text-foreground border bg-background focus:outline-none focus:border-primary transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-muted-foreground" htmlFor="eventDate">Date *</label>
                  <input
                    id="eventDate"
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="rounded-xl px-4 py-3 text-sm text-foreground border bg-background focus:outline-none focus:border-primary transition"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-muted-foreground" htmlFor="eventTime">Time</label>
                  <input
                    id="eventTime"
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="rounded-xl px-4 py-3 text-sm text-foreground border bg-background focus:outline-none focus:border-primary transition"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm text-muted-foreground" htmlFor="venue">Venue *</label>
                <input
                  id="venue"
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g. SAC auditorium, Open air theatre"
                  className="rounded-xl px-4 py-3 text-sm text-foreground border bg-background focus:outline-none focus:border-primary transition"
                />
              </div>

              {/* Sound requirements table */}
              <div className="border border-border rounded-xl p-4 flex flex-col gap-4">
                <h2 className="text-lg font-semibold text-foreground">🔊 Sound Requirements (Dhwani)</h2>
                <p className="text-sm text-muted-foreground">List each instrument, mic, or equipment and how many you need:</p>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left text-xs text-muted-foreground/70 px-2 py-2">Item / Instrument</th>
                        <th className="text-left text-xs text-muted-foreground/70 px-2 py-2">Quantity</th>
                        <th className="text-left text-xs text-muted-foreground/70 px-2 py-2">Remove</th>
                      </tr>
                    </thead>
                    <tbody>
                      {soundRows.map((row, index) => (
                        <tr key={index} className="border-b border-border">
                          <td className="px-2 py-2">
                            <input
                              type="text"
                              value={row.item}
                              onChange={(e) => updateSoundRow(index, "item", e.target.value)}
                              placeholder="e.g. Vocalist, Guitar, Keyboard, Wireless mic"
                              className="w-full rounded-lg px-3 py-2 text-sm text-foreground border bg-background focus:outline-none focus:border-primary"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="number"
                              value={row.quantity}
                              onChange={(e) => updateSoundRow(index, "quantity", e.target.value)}
                              placeholder="0"
                              min="1"
                              className="w-full rounded-lg px-3 py-2 text-sm text-foreground border bg-background focus:outline-none focus:border-primary"
                            />
                          </td>
                          <td className="px-2 py-2">
                            {soundRows.length > 1 && (
                              <button 
                                onClick={() => removeSoundRow(index)}
                                className="text-destructive hover:text-destructive/80 text-sm"
                              >
                                Remove
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button 
                  onClick={addSoundRow}
                  className="text-primary hover:text-primary/80 text-sm text-left"
                >
                  + Add another item
                </button>
              </div>

              {/* Lighting */}
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-3 cursor-pointer border border-border rounded-xl px-4 py-3">
                  <input
                    type="checkbox"
                    checked={needsLight}
                    onChange={(e) => setNeedsLight(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="text-foreground text-sm font-medium">💡 Need Lighting Support (Prakash)?</p>
                    <p className="text-muted-foreground text-xs">Stage lighting, DMX systems, electrical setup</p>
                  </div>
                </label>

                {needsLight && (
                  <div className="border border-border rounded-xl p-4 flex flex-col gap-3">
                    <h3 className="text-sm font-medium text-foreground">Lighting Requirements</h3>
                    <textarea
                      value={lighting}
                      onChange={(e) => setLighting(e.target.value)}
                      placeholder="Describe your lighting requirements (e.g. RGB strobing, warm wash for stage, spot on drums...)"
                      rows={4}
                      className="w-full rounded-xl px-4 py-3 text-sm text-foreground border border-border bg-background focus:outline-none focus:border-primary transition"
                    />
                  </div>
                )}
              </div>

              {/* Additional notes */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-muted-foreground" htmlFor="notes">
                  Additional Notes <span className="text-muted-foreground/70 ml-1">(optional)</span>
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Anything else the team should know..."
                  className="rounded-xl px-4 py-3 text-sm text-foreground border bg-background focus:outline-none focus:border-primary transition resize-none"
                />
              </div>

              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/90 py-3 rounded-xl font-semibold text-primary-foreground w-full disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : "Submit Request →"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}