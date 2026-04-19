"use client";
import { useState } from "react";

// Dhwani row type for sound requirements
type DhwaniRow = { item: string; quantity: string };

export default function Events() {
  const [submitted, setSubmitted] = useState(false);

  // Support requirements
  const [needsSound, setNeedsSound] = useState(false);
  const [needsLight, setNeedsLight] = useState(false);
  const [decorations, setDecorations] = useState<string[]>([]);
  const [lighting, setLighting] = useState<string[]>([]);

  // Sound requirements table
  const [soundRows, setSoundRows] = useState<DhwaniRow[]>([
    { item: "", quantity: "" },
    { item: "", quantity: "" },
  ]);

  // Event details
  const [eventName, setEventName] = useState("");
  const [organizerName, setOrganizerName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [venue, setVenue] = useState("");
  const [description, setDescription] = useState("");

  // Error state
  const [error, setError] = useState("");

  function toggleDecoration(type: string) {
    setDecorations((prev) =>
      prev.includes(type) ? prev.filter((d) => d !== type) : [...prev, type]
    );
  }

  function toggleLighting(type: string) {
    setLighting((prev) =>
      prev.includes(type) ? prev.filter((l) => l !== type) : [...prev, type]
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
    // Basic validation
    if (!eventName.trim()) {
      setError("Error: Event name is required");
      return;
    }
    if (!eventDate) {
      setError("Error: Event date is required");
      return;
    }

    // Clear error and submit
    setError("");
    console.log("Event request submitted:", {
      eventName,
      organizerName,
      eventDate,
      eventTime,
      venue,
      description,
      needsSound,
      needsLight,
      decorations,
      lighting,
      soundRows: needsSound ? soundRows : [],
    });

    setSubmitted(true);
  }

  function handleReset() {
    setSubmitted(false);
    setNeedsSound(false);
    setNeedsLight(false);
    setDecorations([]);
    setLighting([]);
    setSoundRows([{ item: "", quantity: "" }, { item: "", quantity: "" }]);
    setEventName("");
    setOrganizerName("");
    setEventDate("");
    setEventTime("");
    setVenue("");
    setDescription("");
    setError("");
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Events Program</h1>
          <p className="mt-2 text-gray-600">Request support for your event or program.</p>
        </div>

        {submitted ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-green-600 text-5xl mb-4">✅</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Request Submitted Successfully!</h2>
            <p className="text-gray-600 mb-6">Our team will review your request and get back to you soon.</p>
            <button
              onClick={handleReset}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
            >
              Submit Another Request
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8">
            {/* Error display */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
              {/* Event Name */}
              <div>
                <label htmlFor="eventName" className="block text-sm font-medium text-gray-700 mb-2">
                  Event / Program Name *
                </label>
                <input
                  id="eventName"
                  type="text"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="e.g. Diwali Celebrations, Annual Day"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Organizer Name */}
              <div>
                <label htmlFor="organizerName" className="block text-sm font-medium text-gray-700 mb-2">
                  Organizer Name
                </label>
                <input
                  id="organizerName"
                  type="text"
                  value={organizerName}
                  onChange={(e) => setOrganizerName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    id="eventDate"
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="eventTime" className="block text-sm font-medium text-gray-700 mb-2">
                    Time
                  </label>
                  <input
                    id="eventTime"
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Venue */}
              <div>
                <label htmlFor="venue" className="block text-sm font-medium text-gray-700 mb-2">
                  Venue
                </label>
                <input
                  id="venue"
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g. Hostel common room, Open ground"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the event"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Event Support Requirements */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Event Support Requirements</h3>
                  <p className="text-gray-600 mb-4">Select what support you need for your event:</p>
                </div>

                {/* Sound Support */}
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={needsSound}
                      onChange={(e) => setNeedsSound(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-gray-700">🔊 Sound Support (Dhwani)</span>
                  </label>
                </div>

                {/* Sound Requirements Table */}
                {needsSound && (
                  <div className="border border-gray-200 rounded-md p-4">
                    <h4 className="text-md font-medium text-gray-900 mb-2">Sound Requirements</h4>
                    <p className="text-gray-600 mb-4">List each item and how many you need:</p>

                    <div className="space-y-2">
                      {soundRows.map((row, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={row.item}
                            onChange={(e) => updateSoundRow(index, "item", e.target.value)}
                            placeholder="e.g. Wireless mic, Speaker, Tabla"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <input
                            type="text"
                            value={row.quantity}
                            onChange={(e) => updateSoundRow(index, "quantity", e.target.value)}
                            placeholder="Quantity"
                            className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          {soundRows.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeSoundRow(index)}
                              className="px-3 py-2 text-red-600 hover:text-red-800 font-medium"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={addSoundRow}
                      className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md font-medium transition-colors"
                    >
                      + Add Item
                    </button>
                  </div>
                )}

                {/* Lighting Support */}
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={needsLight}
                      onChange={(e) => setNeedsLight(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-gray-700">💡 Lighting Support</span>
                  </label>
                </div>

                {/* Lighting Requirements */}
                {needsLight && (
                  <div className="border border-gray-200 rounded-md p-4">
                    <h4 className="text-md font-medium text-gray-900 mb-2">Lighting Requirements</h4>
                    <p className="text-gray-600 mb-4">What kind of lighting do you need?</p>
                    <div className="space-y-2">
                      {[
                        { value: "white", label: "White — Bright clean light" },
                        { value: "warm-white", label: "Warm White — Soft yellow tone" },
                        { value: "colored", label: "Colored / RGB — Dynamic colors" },
                        { value: "spotlights", label: "Spotlights — Focused beams" },
                        { value: "flood", label: "Flood Lights — Wide coverage" },
                      ].map((opt) => (
                        <label key={opt.value} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={lighting.includes(opt.value)}
                            onChange={() => toggleLighting(opt.value)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-gray-700">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Decoration Support */}
                <div className="border border-gray-200 rounded-md p-4">
                  <h4 className="text-md font-medium text-gray-900 mb-2">Decoration Support</h4>
                  <p className="text-gray-600 mb-4">Select which decoration support you need:</p>
                  <div className="space-y-2">
                    {[
                      { value: "lighting-decoration", label: "Lighting Decoration" },
                      { value: "stage-decoration", label: "Stage Decoration" },
                      { value: "backdrop-banner", label: "Backdrop / Banner Setup" },
                    ].map((opt) => (
                      <label key={opt.value} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={decorations.includes(opt.value)}
                          onChange={() => toggleDecoration(opt.value)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-gray-700">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Submit Request →
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}