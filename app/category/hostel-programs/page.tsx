"use client";
import { useState } from "react";

// Program types for non-festival events
const programTypes = ["Dance", "Drama", "Cultural Event", "Sports Event", "Workshop", "Other"];

// Dhwani row type for sound requirements
type DhwaniRow = { item: string; quantity: string };

export default function HostelPrograms() {
  const [submitted, setSubmitted] = useState(false);

  // Is this a festival or other program?
  const [programCategory, setProgramCategory] = useState<"festival" | "other" | "">("");

  // Festival specific state
  const [needsSound, setNeedsSound] = useState(false);
  const [needsLight, setNeedsLight] = useState(false);
  const [decorations, setDecorations] = useState<string[]>([]);

  // Sound requirements table (same as Dhwani in event support)
  const [soundRows, setSoundRows] = useState<DhwaniRow[]>([
    { item: "", quantity: "" },
    { item: "", quantity: "" },
  ]);

  // Other program specific state
  const [programType, setProgramType] = useState("");
  const [programDescription, setProgramDescription] = useState("");

  // Common fields
  const [eventName, setEventName] = useState("");
  const [organizerName, setOrganizerName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [venue, setVenue] = useState("");

  // Error state for debugging
  const [error, setError] = useState("");

  function toggleDecoration(type: string) {
    setDecorations((prev) =>
      prev.includes(type) ? prev.filter((d) => d !== type) : [...prev, type]
    );
  }

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

  function handleSubmit() {
    // Basic validation with clear error messages for debugging
    if (!eventName.trim()) {
      setError("Error: Event name is required");
      return;
    }
    if (!programCategory) {
      setError("Error: Please select whether this is a festival or other program");
      return;
    }
    if (!eventDate) {
      setError("Error: Event date is required");
      return;
    }
    if (programCategory === "other" && !programType) {
      setError("Error: Please select the program type");
      return;
    }

    // Clear error and submit
    setError("");
    console.log("Hostel program request submitted:", {
      eventName,
      organizerName,
      programCategory,
      eventDate,
      eventTime,
      venue,
      // Festival specific
      needsSound,
      needsLight,
      decorations,
      soundRows: needsSound ? soundRows : [],
      // Other program specific
      programType: programCategory === "other" ? programType : "",
      programDescription: programCategory === "other" ? programDescription : "",
    });

    setSubmitted(true);
  }

  function handleReset() {
    setSubmitted(false);
    setProgramCategory("");
    setNeedsSound(false);
    setNeedsLight(false);
    setDecorations([]);
    setSoundRows([{ item: "", quantity: "" }, { item: "", quantity: "" }]);
    setProgramType("");
    setProgramDescription("");
    setEventName("");
    setOrganizerName("");
    setEventDate("");
    setEventTime("");
    setVenue("");
    setError("");
  }

  return (
    <div>

      <h1>Hostel Programs</h1>
      <p>Request support for your hostel program or festival.</p>

      {submitted ? (
        <div>
          <p>✅ Request submitted successfully!</p>
          <p>Our team will review and get back to you.</p>
          <button onClick={handleReset}>Submit Another</button>
        </div>
      ) : (
        <div>
          {/* Show error clearly if any */}
          {error && (
            <div>
              <strong>{error}</strong>
            </div>
          )}

          {/* Common fields */}
          <div>
            <label>Event / Program Name *</label>
            <br />
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="e.g. Diwali Celebrations, Annual Day"
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
            <br />
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
            <label htmlFor="venue">Venue</label>
            <br />
            <input
              id="venue"
              type="text"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="e.g. Hostel common room, Open ground"
            />
          </div>

          <br />

          {/* Program category selection */}
          <div>
            <label>What type of program is this? *</label>
            <br />
            <label>
              <input
                type="radio"
                name="programCategory"
                value="festival"
                checked={programCategory === "festival"}
                onChange={() => setProgramCategory("festival")}
              />
              &nbsp; Festival (Diwali, Holi, Ugadi, etc.)
            </label>
            &nbsp;&nbsp;
            <label>
              <input
                type="radio"
                name="programCategory"
                value="other"
                checked={programCategory === "other"}
                onChange={() => setProgramCategory("other")}
              />
              &nbsp; Other Program (Dance, Drama, Event, etc.)
            </label>
          </div>

          <br />

          {/* FESTIVAL section */}
          {programCategory === "festival" && (
            <div>
              <h2>Festival Support Requirements</h2>
              <p>Select what support you need for the festival:</p>

              {/* Sound support */}
              <div>
                <label>
                  <input
                    type="checkbox"
                    checked={needsSound}
                    onChange={(e) => setNeedsSound(e.target.checked)}
                  />
                  &nbsp; 🔊 Sound Support (Dhwani)
                </label>
              </div>

              {/* Sound requirements table - shows when sound is checked */}
              {needsSound && (
                <div>
                  <h3>Sound Requirements</h3>
                  <p>List each item and how many you need:</p>

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
                              placeholder="e.g. Wireless mic, Speaker, Tabla"
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
              )}

              <br />

              {/* Light support */}
              <div>
                <label>
                  <input
                    type="checkbox"
                    checked={needsLight}
                    onChange={(e) => setNeedsLight(e.target.checked)}
                  />
                  &nbsp; 💡 Lighting Support (Prakash)
                </label>
              </div>

              {/* Lighting options - shows when light is checked */}
              {needsLight && (
                <div>
                  <h3>Lighting Requirements</h3>
                  <p>What kind of lighting do you need?</p>
                  {[
                    { value: "white", label: "White — Bright clean light" },
                    { value: "warm-white", label: "Warm White — Soft yellow tone" },
                    { value: "colored", label: "Colored / RGB — Dynamic colors" },
                    { value: "spotlights", label: "Spotlights — Focused beams" },
                    { value: "flood", label: "Flood Lights — Wide coverage" },
                  ].map((opt) => (
                    <div key={opt.value}>
                      <label>
                        <input type="checkbox" value={opt.value} />
                        &nbsp; {opt.label}
                      </label>
                    </div>
                  ))}
                </div>
              )}

              <br />

              {/* Decoration support */}
              <div>
                <h3>Decoration Support</h3>
                <p>Select which decoration support you need:</p>
                {[
                  { value: "lighting-decoration", label: "Lighting Decoration" },
                  { value: "stage-decoration", label: "Stage Decoration" },
                  { value: "backdrop-banner", label: "Backdrop / Banner Setup" },
                ].map((opt) => (
                  <div key={opt.value}>
                    <label>
                      <input
                        type="checkbox"
                        checked={decorations.includes(opt.value)}
                        onChange={() => toggleDecoration(opt.value)}
                      />
                      &nbsp; {opt.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* OTHER PROGRAM section */}
          {programCategory === "other" && (
            <div>
              <h2>Program Details</h2>

              <div>
                <label htmlFor="programType">Program Type *</label>
                <br />
                <select
                  id="programType"
                  value={programType}
                  onChange={(e) => setProgramType(e.target.value)}
                >
                  <option value="">Select program type</option>
                  {programTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <br />

              <div>
                <label htmlFor="programDescription">What support do you need?</label>
                <br />
                <textarea
                  id="programDescription"
                  rows={4}
                  value={programDescription}
                  onChange={(e) => setProgramDescription(e.target.value)}
                  placeholder="Describe what you need — sound system, lighting, stage setup, chairs, etc."
                />
              </div>
            </div>
          )}

          <br />

          <button onClick={handleSubmit}>Submit Request →</button>
        </div>
      )}
    </div>
  );
}