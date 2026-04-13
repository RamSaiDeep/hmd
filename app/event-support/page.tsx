"use client";
import { useState } from "react";

// Each row in the Dhwani requirements table
type DhwaniRow = { item: string; quantity: string };

export default function EventSupport() {
  const [submitted, setSubmitted] = useState(false);

  // Which departments are selected
  const [dhwani, setDhwani] = useState(false);
  const [prakash, setPrakash] = useState(false);
  const [kriti, setKriti] = useState(false);

  // Dhwani - dynamic table rows, start with 2 empty rows
  const [dhwaniRows, setDhwaniRows] = useState<DhwaniRow[]>([
    { item: "", quantity: "" },
    { item: "", quantity: "" },
  ]);

  // Prakash fields
  const [venue, setVenue] = useState("");
  const [lighting, setLighting] = useState<string[]>([]);

  // Kriti - free text
  const [kritiNeeds, setKritiNeeds] = useState("");

  // Add a new empty row to Dhwani table
  function addDhwaniRow() {
    setDhwaniRows((prev) => [...prev, { item: "", quantity: "" }]);
  }

  // Remove a row from Dhwani table
  function removeDhwaniRow(index: number) {
    setDhwaniRows((prev) => prev.filter((_, i) => i !== index));
  }

  // Update a specific cell in Dhwani table
  function updateDhwaniRow(index: number, field: "item" | "quantity", value: string) {
    setDhwaniRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  }

  // Toggle lighting options for Prakash
  function toggleLighting(type: string) {
    setLighting((prev) =>
      prev.includes(type) ? prev.filter((l) => l !== type) : [...prev, type]
    );
  }

  async function handleSubmit() {
    // Get form values
    const eventName = (document.getElementById('eventName') as HTMLInputElement)?.value || '';
    const organizerName = (document.getElementById('organizerName') as HTMLInputElement)?.value || '';
    const eventDate = (document.getElementById('eventDate') as HTMLInputElement)?.value || '';
    const eventTime = (document.getElementById('eventTime') as HTMLInputElement)?.value || '';
    const additionalNotes = (document.getElementById('additionalNotes') as HTMLTextAreaElement)?.value || '';
    
    // Validate required fields
    if (!eventName.trim() || !organizerName.trim() || !eventDate) {
      alert('Please fill in all required fields');
      return;
    }

    // Build departments array
    const departments: string[] = [];
    if (dhwani) departments.push('Dhwani');
    if (prakash) departments.push('Prakash');
    if (kriti) departments.push('Kriti');

    // Build request data
    const requestData = {
      eventName,
      organizerName,
      eventDate,
      eventTime,
      venue,
      departments,
      dhwaniItems: dhwani ? dhwaniRows.filter(row => row.item.trim() && row.quantity.trim()) : undefined,
      prakashVenue: prakash ? venue : undefined,
      prakashLighting: prakash ? lighting : [],
      kritiNeeds: kriti ? kritiNeeds : undefined,
      notes: additionalNotes,
    };

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to submit request');
      }

      const result = await response.json();
      console.log('Event request submitted successfully:', result);
      setSubmitted(true);
    } catch (error) {
      console.error('Submit error:', error);
      alert(error instanceof Error ? error.message : 'Failed to submit request');
    }
  }

  function handleReset() {
    setSubmitted(false);
    setDhwani(false);
    setPrakash(false);
    setKriti(false);
    setDhwaniRows([{ item: "", quantity: "" }, { item: "", quantity: "" }]);
    setVenue("");
    setLighting([]);
    setKritiNeeds("");
  }

  return (
    <div className="min-h-screen">

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="rounded-2xl p-8 border bg-card">
          <h1 className="text-2xl font-bold text-foreground mb-1">Request Event Support</h1>
          <p className="text-muted-foreground text-sm mb-8">
            Fill in your event details and select which departments you need.
          </p>

          {submitted ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-xl font-bold text-foreground mb-2">Request Submitted!</h2>
              <p className="text-muted-foreground text-sm mb-6">
                The HMD team will review and respond with what they can provide.
              </p>
              <button
                onClick={handleReset}
                className="bg-primary hover:bg-primary/90 px-6 py-3 rounded-xl font-semibold text-primary-foreground"
              >
                Submit Another
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">

              {/* Basic event details */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-muted-foreground" htmlFor="eventName">Event Name</label>
                <input
                  id="eventName"
                  type="text"
                  placeholder="Annual Cultural Fest"
                  className="rounded-xl px-4 py-3 text-sm text-foreground border bg-background focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm text-muted-foreground" htmlFor="organizerName">Organizer Name</label>
                <input
                  id="organizerName"
                  type="text"
                  placeholder="Your name"
                  className="rounded-xl px-4 py-3 text-sm text-foreground border bg-background focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-muted-foreground" htmlFor="eventDate">Event Date</label>
                  <input
                    id="eventDate"
                    type="date"
                    className="rounded-xl px-4 py-3 text-sm text-foreground border bg-background focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-muted-foreground" htmlFor="eventTime">Event Time</label>
                  <input
                    id="eventTime"
                    type="time"
                    className="rounded-xl px-4 py-3 text-sm text-foreground border bg-background focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Department selection */}
              <div className="flex flex-col gap-2">
                <label className="text-sm text-muted-foreground">Departments Needed</label>
                <p className="text-muted-foreground/70 text-xs">Select one or more — each will expand with specific requirements</p>

                {/* Dhwani checkbox */}
                <label className="flex items-center gap-3 cursor-pointer border border-border rounded-xl px-4 py-3">
                  <input
                    type="checkbox"
                    checked={dhwani}
                    onChange={(e) => setDhwani(e.target.checked)}
                    className="w-4 h-4 accent-blue-500"
                  />
                  <div>
                    <p className="text-foreground text-sm font-medium">🔊 Dhwani — Sound & Audio</p>
                    <p className="text-muted-foreground text-xs">Microphones, instruments, PA systems</p>
                  </div>
                </label>

                {/* Dhwani expanded section */}
                {dhwani && (
                  <div className="border border-border rounded-xl p-4 flex flex-col gap-3">
                    <p className="text-sm text-muted-foreground font-medium">List your audio requirements</p>
                    <p className="text-muted-foreground/70 text-xs">Add each item and how many you need. Examples: Singers, Tabla, Guitar, Wireless mic, DJ setup</p>

                    {/* Table header */}
                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-7 text-xs text-muted-foreground/70 px-1">Item / Instrument</div>
                      <div className="col-span-3 text-xs text-muted-foreground/70 px-1">Quantity</div>
                      <div className="col-span-2"></div>
                    </div>

                    {/* Rows */}
                    {dhwaniRows.map((row, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 items-center">
                        <input
                          type="text"
                          value={row.item}
                          onChange={(e) => updateDhwaniRow(index, "item", e.target.value)}
                          placeholder="e.g. Singers, Tabla, Guitar"
                          aria-label={`Dhwani item ${index + 1}`}
                          className="col-span-7 rounded-lg px-3 py-2 text-sm text-foreground border bg-background focus:outline-none focus:border-primary"
                        />
                        <input
                          type="number"
                          value={row.quantity}
                          onChange={(e) => updateDhwaniRow(index, "quantity", e.target.value)}
                          placeholder="0"
                          min="1"
                          aria-label={`Dhwani quantity ${index + 1}`}
                          className="col-span-3 rounded-lg px-3 py-2 text-sm text-foreground border bg-background focus:outline-none focus:border-primary"
                        />
                        {/* Only show remove if more than 1 row */}
                        {dhwaniRows.length > 1 ? (
                          <button
                            onClick={() => removeDhwaniRow(index)}
                            className="col-span-2 text-destructive hover:text-destructive/80 text-xs text-center"
                          >
                            Remove
                          </button>
                        ) : (
                          <div className="col-span-2" />
                        )}
                      </div>
                    ))}

                    {/* Add row button */}
                    <button
                      onClick={addDhwaniRow}
                      className="text-primary hover:text-primary/80 text-sm text-left"
                    >
                      + Add another item
                    </button>
                  </div>
                )}

                {/* Prakash checkbox */}
                <label className="flex items-center gap-3 cursor-pointer border border-border rounded-xl px-4 py-3">
                  <input
                    type="checkbox"
                    checked={prakash}
                    onChange={(e) => setPrakash(e.target.checked)}
                    className="w-4 h-4 accent-blue-500"
                  />
                  <div>
                    <p className="text-foreground text-sm font-medium">💡 Prakash — Lighting</p>
                    <p className="text-muted-foreground text-xs">Stage lighting, DMX systems, electrical setup</p>
                  </div>
                </label>

                {/* Prakash expanded section */}
                {prakash && (
                  <div className="border border-border rounded-xl p-4 flex flex-col gap-4">
                    <p className="text-sm text-muted-foreground font-medium">Lighting requirements</p>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-muted-foreground/70" htmlFor="lightingVenue">Venue / Stage location</label>
                      <input
                        id="lightingVenue"
                        type="text"
                        value={venue}
                        onChange={(e) => setVenue(e.target.value)}
                        placeholder="e.g. Main auditorium stage, Open ground, SAC hall"
                        className="rounded-lg px-3 py-2 text-sm text-foreground border bg-background focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-muted-foreground/70">Lighting type needed</label>
                      <div className="flex flex-col gap-2">
                        {[
                          { value: "white", label: "White", desc: "Bright, clean light — good for speeches, presentations" },
                          { value: "warm-white", label: "Warm White", desc: "Soft yellow tone — good for cultural events, performances" },
                          { value: "colored", label: "Colored / RGB", desc: "Dynamic colors — good for concerts, DJ nights" },
                          { value: "spotlights", label: "Spotlights", desc: "Focused beams on specific performers or areas" },
                          { value: "flood", label: "Flood Lights", desc: "Wide coverage for the entire stage or ground" },
                        ].map((opt) => (
                          <label
                            key={opt.value}
                            className="flex items-start gap-3 cursor-pointer border border-border rounded-lg px-3 py-2"
                          >
                            <input
                              type="checkbox"
                              checked={lighting.includes(opt.value)}
                              onChange={() => toggleLighting(opt.value)}
                              className="w-4 h-4 accent-blue-500 mt-0.5"
                            />
                            <div>
                              <p className="text-foreground text-sm">{opt.label}</p>
                              <p className="text-muted-foreground text-xs">{opt.desc}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Kriti checkbox */}
                <label className="flex items-center gap-3 cursor-pointer border border-border rounded-xl px-4 py-3">
                  <input
                    type="checkbox"
                    checked={kriti}
                    onChange={(e) => setKriti(e.target.checked)}
                    className="w-4 h-4 accent-blue-500"
                  />
                  <div>
                    <p className="text-foreground text-sm font-medium">🔨 Kriti — Stage & Fabrication</p>
                    <p className="text-muted-foreground text-xs">Stage setup, props, woodwork, welding</p>
                  </div>
                </label>

                {/* Kriti expanded section */}
                {kriti && (
                  <div className="border border-border rounded-xl p-4 flex flex-col gap-3">
                    <p className="text-sm text-muted-foreground font-medium">List what you need</p>
                    <p className="text-muted-foreground/70 text-xs">Describe stage setup, props, backdrops, or any fabrication requirements</p>
                    <label className="sr-only" htmlFor="kritiNeeds">Kriti requirements</label>
                    <textarea
                      id="kritiNeeds"
                      rows={5}
                      value={kritiNeeds}
                      onChange={(e) => setKritiNeeds(e.target.value)}
                      placeholder={`Example:\n- Stage platform 20x10 ft\n- Backdrop with college logo\n- 2 podiums\n- Seating arrangement for 200`}
                      className="rounded-lg px-3 py-2 text-sm text-foreground border bg-background focus:outline-none focus:border-primary resize-none"
                    />
                  </div>
                )}
              </div>

              {/* Additional notes */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-muted-foreground" htmlFor="additionalNotes">
                  Additional Notes
                  <span className="text-muted-foreground/70 ml-1">(optional)</span>
                </label>
                <textarea
                  id="additionalNotes"
                  rows={3}
                  placeholder="Anything else the team should know..."
                  className="rounded-xl px-4 py-3 text-sm text-foreground border bg-background focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <button
                onClick={handleSubmit}
                className="bg-primary hover:bg-primary/90 py-3 rounded-xl font-semibold text-primary-foreground"
              >
                Submit Request →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
