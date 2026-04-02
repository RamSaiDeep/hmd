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

  function handleSubmit() {
    setSubmitted(true);
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
        <div className="rounded-2xl p-8 border border-white/10">
          <h1 className="text-2xl font-bold text-white mb-1">Request Event Support</h1>
          <p className="text-gray-300 text-sm mb-8">
            Fill in your event details and select which departments you need.
          </p>

          {submitted ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-xl font-bold text-white mb-2">Request Submitted!</h2>
              <p className="text-gray-300 text-sm mb-6">
                The HMD team will review and respond with what they can provide.
              </p>
              <button
                onClick={handleReset}
                className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-semibold text-white"
              >
                Submit Another
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">

              {/* Basic event details */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-300" htmlFor="eventName">Event Name</label>
                <input
                  id="eventName"
                  type="text"
                  placeholder="Annual Cultural Fest"
                  className="rounded-xl px-4 py-3 text-sm text-white border border-white/10 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-300" htmlFor="organizerName">Organizer Name</label>
                <input
                  id="organizerName"
                  type="text"
                  placeholder="Your name"
                  className="rounded-xl px-4 py-3 text-sm text-white border border-white/10 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-gray-300" htmlFor="eventDate">Event Date</label>
                  <input
                    id="eventDate"
                    type="date"
                    className="rounded-xl px-4 py-3 text-sm text-white border border-white/10 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-gray-300" htmlFor="eventTime">Event Time</label>
                  <input
                    id="eventTime"
                    type="time"
                    className="rounded-xl px-4 py-3 text-sm text-white border border-white/10 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Department selection */}
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-300">Departments Needed</label>
                <p className="text-gray-500 text-xs">Select one or more — each will expand with specific requirements</p>

                {/* Dhwani checkbox */}
                <label className="flex items-center gap-3 cursor-pointer border border-white/10 rounded-xl px-4 py-3">
                  <input
                    type="checkbox"
                    checked={dhwani}
                    onChange={(e) => setDhwani(e.target.checked)}
                    className="w-4 h-4 accent-blue-500"
                  />
                  <div>
                    <p className="text-white text-sm font-medium">🔊 Dhwani — Sound & Audio</p>
                    <p className="text-gray-400 text-xs">Microphones, instruments, PA systems</p>
                  </div>
                </label>

                {/* Dhwani expanded section */}
                {dhwani && (
                  <div className="border border-white/10 rounded-xl p-4 flex flex-col gap-3">
                    <p className="text-sm text-gray-300 font-medium">List your audio requirements</p>
                    <p className="text-gray-500 text-xs">Add each item and how many you need. Examples: Singers, Tabla, Guitar, Wireless mic, DJ setup</p>

                    {/* Table header */}
                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-7 text-xs text-gray-400 px-1">Item / Instrument</div>
                      <div className="col-span-3 text-xs text-gray-400 px-1">Quantity</div>
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
                          className="col-span-7 rounded-lg px-3 py-2 text-sm text-white border border-white/10 focus:outline-none focus:border-blue-500"
                        />
                        <input
                          type="number"
                          value={row.quantity}
                          onChange={(e) => updateDhwaniRow(index, "quantity", e.target.value)}
                          placeholder="0"
                          min="1"
                          aria-label={`Dhwani quantity ${index + 1}`}
                          className="col-span-3 rounded-lg px-3 py-2 text-sm text-white border border-white/10 focus:outline-none focus:border-blue-500"
                        />
                        {/* Only show remove if more than 1 row */}
                        {dhwaniRows.length > 1 ? (
                          <button
                            onClick={() => removeDhwaniRow(index)}
                            className="col-span-2 text-red-400 hover:text-red-300 text-xs text-center"
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
                      className="text-blue-400 hover:text-blue-300 text-sm text-left"
                    >
                      + Add another item
                    </button>
                  </div>
                )}

                {/* Prakash checkbox */}
                <label className="flex items-center gap-3 cursor-pointer border border-white/10 rounded-xl px-4 py-3">
                  <input
                    type="checkbox"
                    checked={prakash}
                    onChange={(e) => setPrakash(e.target.checked)}
                    className="w-4 h-4 accent-blue-500"
                  />
                  <div>
                    <p className="text-white text-sm font-medium">💡 Prakash — Lighting</p>
                    <p className="text-gray-400 text-xs">Stage lighting, DMX systems, electrical setup</p>
                  </div>
                </label>

                {/* Prakash expanded section */}
                {prakash && (
                  <div className="border border-white/10 rounded-xl p-4 flex flex-col gap-4">
                    <p className="text-sm text-gray-300 font-medium">Lighting requirements</p>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-gray-400" htmlFor="lightingVenue">Venue / Stage location</label>
                      <input
                        id="lightingVenue"
                        type="text"
                        value={venue}
                        onChange={(e) => setVenue(e.target.value)}
                        placeholder="e.g. Main auditorium stage, Open ground, SAC hall"
                        className="rounded-lg px-3 py-2 text-sm text-white border border-white/10 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-gray-400">Lighting type needed</label>
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
                            className="flex items-start gap-3 cursor-pointer border border-white/10 rounded-lg px-3 py-2"
                          >
                            <input
                              type="checkbox"
                              checked={lighting.includes(opt.value)}
                              onChange={() => toggleLighting(opt.value)}
                              className="w-4 h-4 accent-blue-500 mt-0.5"
                            />
                            <div>
                              <p className="text-white text-sm">{opt.label}</p>
                              <p className="text-gray-400 text-xs">{opt.desc}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Kriti checkbox */}
                <label className="flex items-center gap-3 cursor-pointer border border-white/10 rounded-xl px-4 py-3">
                  <input
                    type="checkbox"
                    checked={kriti}
                    onChange={(e) => setKriti(e.target.checked)}
                    className="w-4 h-4 accent-blue-500"
                  />
                  <div>
                    <p className="text-white text-sm font-medium">🔨 Kriti — Stage & Fabrication</p>
                    <p className="text-gray-400 text-xs">Stage setup, props, woodwork, welding</p>
                  </div>
                </label>

                {/* Kriti expanded section */}
                {kriti && (
                  <div className="border border-white/10 rounded-xl p-4 flex flex-col gap-3">
                    <p className="text-sm text-gray-300 font-medium">List what you need</p>
                    <p className="text-gray-500 text-xs">Describe stage setup, props, backdrops, or any fabrication requirements</p>
                    <label className="sr-only" htmlFor="kritiNeeds">Kriti requirements</label>
                    <textarea
                      id="kritiNeeds"
                      rows={5}
                      value={kritiNeeds}
                      onChange={(e) => setKritiNeeds(e.target.value)}
                      placeholder={`Example:\n- Stage platform 20x10 ft\n- Backdrop with college logo\n- 2 podiums\n- Seating arrangement for 200`}
                      className="rounded-lg px-3 py-2 text-sm text-white border border-white/10 focus:outline-none focus:border-blue-500 resize-none"
                    />
                  </div>
                )}
              </div>

              {/* Additional notes */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-300" htmlFor="additionalNotes">
                  Additional Notes
                  <span className="text-gray-500 ml-1">(optional)</span>
                </label>
                <textarea
                  id="additionalNotes"
                  rows={3}
                  placeholder="Anything else the team should know..."
                  className="rounded-xl px-4 py-3 text-sm text-white border border-white/10 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <button
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-semibold text-white"
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