"use client";
import { useState } from "react";

type DhwaniRow = { item: string; quantity: string };

const lightingOptions = [
  { value: "white", label: "White — Bright clean light" },
  { value: "warm-white", label: "Warm White — Soft yellow tone" },
  { value: "colored", label: "Colored / RGB — Dynamic colors" },
  { value: "spotlights", label: "Spotlights — Focused beams" },
  { value: "flood", label: "Flood Lights — Wide coverage" },
];

export default function MusicPrograms() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

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
  const [lighting, setLighting] = useState<string[]>([]);

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

  function toggleLighting(value: string) {
    setLighting((prev) =>
      prev.includes(value) ? prev.filter((l) => l !== value) : [...prev, value]
    );
  }

  async function handleSubmit() {
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
      organizerName,
      eventDate,
      eventTime,
      venue,
      soundItems: soundRows.filter((row) => row.item.trim() && row.quantity.trim()),
      needsLight,
      lighting: needsLight ? lighting : [],
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
      console.log("Music program request submitted:", result);
      setError("");
      setSubmitted(true);
    } catch (error) {
      console.error("Submit error:", error);
      setError(error instanceof Error ? error.message : "Failed to submit request");
    }
  }

  function handleReset() {
    setSubmitted(false);
    setError("");
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
    <div>

      <h1>Music Programs</h1>
      <p>Request sound and lighting support for your music event.</p>

      {submitted ? (
        <div>
          <p>✅ Request submitted successfully!</p>
          <p>Our team will review and get back to you.</p>
          <button onClick={handleReset}>Submit Another</button>
        </div>
      ) : (
        <div>
          {error && (
            <div>
              <strong>{error}</strong>
            </div>
          )}

          {/* Basic details */}
          <div>
            <label>Event Name *</label>
            <br />
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="e.g. Rock Night, Classical Evening"
            />
          </div>

          <br />

          <div>
            <label htmlFor="organizerName">Organizer Name</label>
            <br />
            <input
              id="organizerName"
              type="text"
              value={organizerName}
              onChange={(e) => setOrganizerName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          <br />

          <div>
            <label htmlFor="eventDate">Date *</label>
            &nbsp;
            <input
              id="eventDate"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
            />
            &nbsp;&nbsp;
            <label htmlFor="eventTime">Time</label>
            &nbsp;
            <input
              id="eventTime"
              type="time"
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
            />
          </div>

          <br />

          <div>
            <label htmlFor="venue">Venue *</label>
            <br />
            <input
              id="venue"
              type="text"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="e.g. SAC auditorium, Open air theatre"
            />
          </div>

          <br />

          {/* Sound requirements table */}
          <div>
            <h2>🔊 Sound Requirements (Dhwani)</h2>
            <p>List each instrument, mic, or equipment and how many you need:</p>

            <table border={1}>
              <thead>
                <tr>
                  <th>Item / Instrument</th>
                  <th>Quantity</th>
                  <th>Remove</th>
                </tr>
              </thead>
              <tbody>
                {soundRows.map((row, index) => (
                  <tr key={index}>
                    <td>
                      <input
                        type="text"
                        value={row.item}
                        onChange={(e) => updateSoundRow(index, "item", e.target.value)}
                        placeholder="e.g. Vocalist, Guitar, Keyboard, Wireless mic"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={row.quantity}
                        onChange={(e) => updateSoundRow(index, "quantity", e.target.value)}
                        placeholder="0"
                        min="1"
                      />
                    </td>
                    <td>
                      {soundRows.length > 1 && (
                        <button onClick={() => removeSoundRow(index)}>Remove</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <br />
            <button onClick={addSoundRow}>+ Add another item</button>
          </div>

          <br />

          {/* Lighting */}
          <div>
            <label>
              <input
                type="checkbox"
                checked={needsLight}
                onChange={(e) => setNeedsLight(e.target.checked)}
              />
              &nbsp; 💡 Need Lighting Support (Prakash)?
            </label>
          </div>

          {needsLight && (
            <div>
              <h3>Lighting Requirements</h3>
              {lightingOptions.map((opt) => (
                <div key={opt.value}>
                  <label>
                    <input
                      type="checkbox"
                      checked={lighting.includes(opt.value)}
                      onChange={() => toggleLighting(opt.value)}
                    />
                    &nbsp; {opt.label}
                  </label>
                </div>
              ))}
            </div>
          )}

          <br />

          {/* Additional notes */}
          <div>
            <label htmlFor="notes">Additional Notes (optional)</label>
            <br />
            <textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything else the team should know..."
            />
          </div>

          <br />

          <button onClick={handleSubmit}>Submit Request →</button>
        </div>
      )}
    </div>
  );
}