"use client";
import { useEffect, useState } from "react";

// Days of the week
const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Mock booked slots
const bookedSlots = [
  "Monday-9:00 AM",
  "Monday-10:00 AM",
  "Tuesday-2:00 PM",
  "Wednesday-11:00 AM",
  "Wednesday-12:00 PM",
  "Thursday-9:00 AM",
  "Friday-3:00 PM",
  "Friday-4:00 PM",
  "Saturday-10:00 AM",
];

type Booking = {
  day: string;
  slot: string;
  purpose: string;
  description: string;
  name: string;
};

type InstrumentRow = { item: string; quantity: string };

export default function SRDRSPage() {
  // Selected day and 24-hour format time (e.g. "14:00")
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const getTwoMonthRange = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const min = `${yyyy}-${mm}-${dd}`;

    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 2);
    const max_yyyy = maxDate.getFullYear();
    const max_mm = String(maxDate.getMonth() + 1).padStart(2, '0');
    const max_dd = String(maxDate.getDate()).padStart(2, '0');
    const max = `${max_yyyy}-${max_mm}-${max_dd}`;
    return { min, max };
  };

  const { min: minDateStr, max: maxDateStr } = getTwoMonthRange();

  function formatDate(dateStr: string): string {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
      }
    } catch (e) {}
    return dateStr;
  }


  // Booking form fields
  const [bookingName, setBookingName] = useState("");
  const [recordingType, setRecordingType] = useState("Vocal"); // Vocal, Instrument, Midi
  const [artistName, setArtistName] = useState("");
  
  // Instrument rows (dynamic table)
  const [instrumentRows, setInstrumentRows] = useState<InstrumentRow[]>([
    { item: "", quantity: "" },
    { item: "", quantity: "" },
  ]);

  const [recordingDescription, setRecordingDescription] = useState("");

  // Bookings state
  const [confirmedBookings, setConfirmedBookings] = useState<Booking[]>([]);
  const [dbBookings, setDbBookings] = useState<Array<{ day: string; slot: string }>>([]);

  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchBookings() {
      try {
        const res = await fetch("/api/bookings");
        if (res.ok) {
          const data = await res.json();
          setDbBookings(data.bookings || []);
        }
      } catch (err) {
        console.error("Error fetching bookings:", err);
      }
    }
    fetchBookings();
  }, []);

  // Convert 24-hour time (e.g. "14:30") to 12-hour format (e.g. "2:30 PM")
  function convertTo12HourFormat(time24: string): string {
    if (!time24) return "";
    const [hoursStr, minutesStr] = time24.split(":");
    let hours = parseInt(hoursStr, 10);
    const minutes = minutesStr;
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    return `${hours}:${minutes} ${ampm}`;
  }

  const selectedTime12Hour = convertTo12HourFormat(selectedTime);

  // Check if a slot is booked
  function isBooked(day: string, slot: string): boolean {
    const key = `${day}-${slot}`;
    if (bookedSlots.includes(key)) return true;
    if (confirmedBookings.some((b) => b.day === day && b.slot === slot)) return true;
    return dbBookings.some((b) => b.day === day && b.slot === slot);
  }

  // Instrument rows helpers
  function addInstrumentRow() {
    setInstrumentRows((prev) => [...prev, { item: "", quantity: "" }]);
  }

  function removeInstrumentRow(index: number) {
    setInstrumentRows((prev) => prev.filter((_, i) => i !== index));
  }

  function updateInstrumentRow(index: number, field: "item" | "quantity", value: string) {
    setInstrumentRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  }

  async function handleBooking(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    // Validation
    if (!selectedDay) {
      setError("Error: Please select a day of the week");
      return;
    }
    if (!selectedTime) {
      setError("Error: Please select a time");
      return;
    }
    if (isBooked(selectedDay, selectedTime12Hour)) {
      setError(`Error: The time "${selectedTime12Hour}" on ${selectedDay} is already booked`);
      return;
    }
    if (!bookingName.trim()) {
      setError("Error: Booking name is required");
      return;
    }
    if (!recordingDescription.trim()) {
      setError("Error: Description of what you are recording is required");
      return;
    }

    // Conditional field validation & formatting
    let finalArtistName = "N/A";
    let finalVocalOrInstrument = recordingType;

    if (recordingType === "Vocal") {
      if (!artistName.trim()) {
        setError("Error: Recording artist name is required for Vocal recording");
        return;
      }
      finalArtistName = artistName.trim();
    } else if (recordingType === "Midi") {
      if (!artistName.trim()) {
        setError("Error: Person's name is required for MIDI recording");
        return;
      }
      finalArtistName = artistName.trim();
    } else if (recordingType === "Instrument") {
      const validRows = instrumentRows.filter((row) => row.item.trim() !== "");
      if (validRows.length === 0) {
        setError("Error: Please specify at least one instrument details");
        return;
      }
      // Check that all valid rows have quantities
      for (const row of validRows) {
        if (!row.quantity.trim()) {
          setError(`Error: Please specify quantity for instrument "${row.item}"`);
          return;
        }
      }
      finalVocalOrInstrument = `Instrument: ${validRows.map((r) => `${r.item.trim()} (${r.quantity.trim()})`).join(", ")}`;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          day: selectedDay,
          slot: selectedTime12Hour,
          purpose: "Studio Booking",
          description: recordingDescription,
          bookingName: bookingName,
          recordingTime: selectedTime12Hour,
          artistName: finalArtistName,
          vocalOrInstrument: finalVocalOrInstrument,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to book slot");
        setIsSubmitting(false);
        return;
      }

      console.log("SRDRS booking submitted successfully");

      // Add to confirmed bookings
      setConfirmedBookings((prev) => [
        ...prev,
        {
          day: selectedDay,
          slot: selectedTime12Hour,
          name: bookingName,
          purpose: "Studio Booking",
          description: recordingDescription,
        },
      ]);

      setSubmitted(true);
      
      // Reset form states
      setSelectedDay("");
      setSelectedTime("");
      setBookingName("");
      setArtistName("");
      setRecordingDescription("");
      setInstrumentRows([
        { item: "", quantity: "" },
        { item: "", quantity: "" },
      ]);
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleReset() {
    setSubmitted(false);
    setError("");
  }

  const isCurrentlyBooked = selectedDay && selectedTime && isBooked(selectedDay, selectedTime12Hour);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">SRDRS — Studio Booking</h1>
          <p className="mt-2 text-gray-600">Book a session in the recording studio.</p>
        </div>

        {submitted ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center border border-gray-200">
            <div className="text-green-600 text-5xl mb-4">✅</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Slot Booked Successfully!</h2>
            <p className="text-gray-600 mb-6">Our team will confirm your booking shortly.</p>
            <button
              onClick={handleReset}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
            >
              Book Another Slot
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleBooking} className="space-y-6">
              {/* Day & Time selectors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="day" className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    id="day"
                    type="date"
                    min={minDateStr}
                    max={maxDateStr}
                    value={selectedDay}
                    onChange={(e) => {
                      setSelectedDay(e.target.value);
                      setSubmitted(false);
                      setError("");
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                    Time *
                  </label>
                  <input
                    id="time"
                    type="time"
                    value={selectedTime}
                    onChange={(e) => {
                      setSelectedTime(e.target.value);
                      setSubmitted(false);
                      setError("");
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                    required
                  />
                  {selectedTime && (
                    <p className="mt-1.5 text-sm text-gray-600 font-medium">
                      Selected time: <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{selectedTime12Hour}</span>
                    </p>
                  )}
                </div>

              </div>

              {/* Booking collision warning */}
              {selectedDay && selectedTime && isCurrentlyBooked && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800 font-medium">
                    ⚠️ Time "{selectedTime12Hour}" on {formatDate(selectedDay)} is already booked. Please choose a different day or time.
                  </p>
                </div>
              )}


              {/* Booking Name */}
              <div>
                <label htmlFor="bookingName" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name *
                </label>
                <input
                  id="bookingName"
                  type="text"
                  value={bookingName}
                  onChange={(e) => setBookingName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  required
                />
              </div>

              {/* Recording Type (Vocal / Instrument / Midi) */}
              <div>
                <span className="block text-sm font-medium text-gray-700 mb-2">Recording Type *</span>
                <div className="flex gap-6">
                  {["Vocal", "Instrument", "Midi"].map((type) => (
                    <label key={type} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="recordingType"
                        value={type}
                        checked={recordingType === type}
                        onChange={(e) => {
                          setRecordingType(e.target.value);
                          setError("");
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-gray-700 font-medium">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Conditional: Artist Name (Vocal) */}
              {recordingType === "Vocal" && (
                <div>
                  <label htmlFor="artistName" className="block text-sm font-medium text-gray-700 mb-2">
                    Recording Artist Name *
                  </label>
                  <input
                    id="artistName"
                    type="text"
                    value={artistName}
                    onChange={(e) => setArtistName(e.target.value)}
                    placeholder="Name of vocalist/artist"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    required
                  />
                </div>
              )}

              {/* Conditional: Person's Name (MIDI) */}
              {recordingType === "Midi" && (
                <div>
                  <label htmlFor="personName" className="block text-sm font-medium text-gray-700 mb-2">
                    Person's Name *
                  </label>
                  <input
                    id="personName"
                    type="text"
                    value={artistName}
                    onChange={(e) => setArtistName(e.target.value)}
                    placeholder="Name of the person"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    required
                  />
                </div>
              )}

              {/* Conditional: Instruments (Instrument) */}
              {recordingType === "Instrument" && (
                <div className="border border-gray-200 rounded-md p-4 bg-gray-50/50">
                  <h4 className="text-md font-medium text-gray-900 mb-1">Instrument Details *</h4>
                  <p className="text-xs text-gray-600 mb-3">List each instrument and quantity needed:</p>

                  <div className="space-y-2">
                    {instrumentRows.map((row, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={row.item}
                          onChange={(e) => updateInstrumentRow(index, "item", e.target.value)}
                          placeholder="e.g. Acoustic Guitar, Keyboard, Tabla"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                          required
                        />
                        <input
                          type="text"
                          value={row.quantity}
                          onChange={(e) => updateInstrumentRow(index, "quantity", e.target.value)}
                          placeholder="Qty"
                          className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                          required
                        />
                        {instrumentRows.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeInstrumentRow(index)}
                            className="px-3 py-2 text-red-600 hover:text-red-800 font-medium text-sm transition-colors"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addInstrumentRow}
                    className="mt-3 px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md font-medium text-sm transition-colors shadow-sm"
                  >
                    + Add Instrument
                  </button>
                </div>
              )}

              {/* Description */}
              <div>
                <label htmlFor="recordingDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  Describe what you are recording *
                </label>
                <textarea
                  id="recordingDescription"
                  rows={3}
                  value={recordingDescription}
                  onChange={(e) => setRecordingDescription(e.target.value)}
                  placeholder="e.g. Original song for college fest, Podcast episode about hostel life..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting || !!isCurrentlyBooked}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Submitting..." : "Confirm Booking →"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Confirmed Bookings list */}
        {confirmedBookings.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-8 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Bookings This Session</h2>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-4 py-2 font-medium text-gray-700">Day</th>
                    <th className="px-4 py-2 font-medium text-gray-700">Slot</th>
                    <th className="px-4 py-2 font-medium text-gray-700">Purpose</th>
                    <th className="px-4 py-2 font-medium text-gray-700">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {confirmedBookings.map((b, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium text-gray-900">{formatDate(b.day)}</td>

                      <td className="px-4 py-2 text-gray-600">{b.slot}</td>
                      <td className="px-4 py-2 text-gray-600">{b.purpose}</td>
                      <td className="px-4 py-2 text-gray-600 whitespace-pre-wrap max-w-xs">{b.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}