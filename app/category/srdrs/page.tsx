"use client";
import { useState } from "react";
import Link from "next/link";

// Recording purposes
const recordingPurposes = [
  "Song Recording",
  "Podcast",
  "Voiceover",
  "Music Composition",
  "Band Practice Recording",
  "Interview",
  "Other",
];

// Time slots available each day
const timeSlots = [
  "9:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "12:00 PM - 1:00 PM",
  "2:00 PM - 3:00 PM",
  "3:00 PM - 4:00 PM",
  "4:00 PM - 5:00 PM",
  "5:00 PM - 6:00 PM",
];

// Days of the week shown in calendar
const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Mock booked slots - later comes from database
// Format: "Monday-9:00 AM - 10:00 AM" = booked
const bookedSlots = [
  "Monday-9:00 AM - 10:00 AM",
  "Monday-10:00 AM - 11:00 AM",
  "Tuesday-2:00 PM - 3:00 PM",
  "Wednesday-11:00 AM - 12:00 PM",
  "Wednesday-12:00 PM - 1:00 PM",
  "Thursday-9:00 AM - 10:00 AM",
  "Friday-3:00 PM - 4:00 PM",
  "Friday-4:00 PM - 5:00 PM",
  "Saturday-10:00 AM - 11:00 AM",
];

type Booking = {
  day: string;
  slot: string;
  purpose: string;
  description: string;
  name: string;
};

export default function SRDRSPage() {
  // Which slot the user has selected
  const [selectedSlot, setSelectedSlot] = useState<{ day: string; slot: string } | null>(null);

  // Booking form fields
  const [bookingName, setBookingName] = useState("");
  const [recordingPurpose, setRecordingPurpose] = useState("");
  const [recordingDescription, setRecordingDescription] = useState("");

  // All confirmed bookings (starts with mock data)
  const [confirmedBookings, setConfirmedBookings] = useState<Booking[]>([]);

  // Error state for debugging
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Check if a slot is booked
  function isBooked(day: string, slot: string): boolean {
    const key = `${day}-${slot}`;
    // Check mock booked slots
    if (bookedSlots.includes(key)) return true;
    // Check user confirmed bookings
    return confirmedBookings.some((b) => b.day === day && b.slot === slot);
  }

  // When user clicks a free slot
  function selectSlot(day: string, slot: string) {
    if (isBooked(day, slot)) {
      setError(`Error: Slot ${slot} on ${day} is already booked`);
      return;
    }
    setError("");
    setSelectedSlot({ day, slot });
    setSubmitted(false);
  }

  function handleBooking() {
    // Validation with debug messages
    if (!selectedSlot) {
      setError("Error: No slot selected — click a free slot first");
      return;
    }
    if (!bookingName.trim()) {
      setError("Error: Your name is required");
      return;
    }
    if (!recordingPurpose) {
      setError("Error: Please select the recording purpose");
      return;
    }
    if (!recordingDescription.trim()) {
      setError("Error: Please describe what you are recording");
      return;
    }

    setError("");
    console.log("SRDRS booking submitted:", {
      day: selectedSlot.day,
      slot: selectedSlot.slot,
      name: bookingName,
      purpose: recordingPurpose,
      description: recordingDescription,
    });

    // Add to confirmed bookings
    setConfirmedBookings((prev) => [
      ...prev,
      {
        day: selectedSlot.day,
        slot: selectedSlot.slot,
        name: bookingName,
        purpose: recordingPurpose,
        description: recordingDescription,
      },
    ]);

    setSubmitted(true);
    setSelectedSlot(null);
    setBookingName("");
    setRecordingPurpose("");
    setRecordingDescription("");
  }

  return (
    <div>

      <h1>SRDRS — Recording Studio</h1>
      <p>
        Book a time slot in our recording studio. Green slots are available,
        red slots are already booked.
      </p>

      {error && (
        <div>
          <strong>{error}</strong>
        </div>
      )}

      {submitted && (
        <div>
          <strong>✅ Slot booked successfully! Our team will confirm your booking.</strong>
        </div>
      )}

      {/* Weekly Calendar */}
      <div style={{ overflowX: "auto" }}>
        <table border={1} width="100%">
          <thead>
            <tr>
              {/* Empty corner cell */}
              <th>Time Slot</th>
              {weekDays.map((day) => (
                <th key={day}>{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((slot) => (
              <tr key={slot}>
                {/* Time slot label on the left */}
                <td>{slot}</td>

                {/* One cell per day */}
                {weekDays.map((day) => {
                  const booked = isBooked(day, slot);
                  const isSelected =
                    selectedSlot?.day === day && selectedSlot?.slot === slot;

                  return (
                    <td
                      key={day}
                      onClick={() => !booked && selectSlot(day, slot)}
                      style={{
                        cursor: booked ? "not-allowed" : "pointer",
                        backgroundColor: isSelected
                          ? "blue"
                          : booked
                          ? "red"
                          : "green",
                        color: "white",
                        textAlign: "center",
                        padding: "8px",
                      }}
                    >
                      {isSelected ? "Selected" : booked ? "Booked" : "Free"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <br />

      {/* Booking form - only shows when a slot is selected */}
      {selectedSlot && (
        <div>
          <h2>Book Slot: {selectedSlot.slot} on {selectedSlot.day}</h2>

          <div>
            <label>Your Name *</label>
            <br />
            <input
              type="text"
              value={bookingName}
              onChange={(e) => setBookingName(e.target.value)}
              placeholder="Your full name"
            />
          </div>

          <br />

          <div>
            <label>Recording Purpose *</label>
            <br />
            <select
              value={recordingPurpose}
              onChange={(e) => setRecordingPurpose(e.target.value)}
            >
              <option value="">Select purpose</option>
              {recordingPurposes.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <br />

          <div>
            <label>Describe what you are recording *</label>
            <br />
            <textarea
              rows={3}
              value={recordingDescription}
              onChange={(e) => setRecordingDescription(e.target.value)}
              placeholder="e.g. Original Telugu song for college fest, Podcast episode about hostel life..."
              style={{ width: "100%" }}
            />
          </div>

          <br />

          <button onClick={handleBooking}>Confirm Booking →</button>
          &nbsp;
          <button onClick={() => { setSelectedSlot(null); setError(""); }}>Cancel</button>
        </div>
      )}

      {/* Show user's confirmed bookings */}
      {confirmedBookings.length > 0 && (
        <div>
          <h2>Your Bookings This Session</h2>
          <table border={1}>
            <thead>
              <tr>
                <th>Day</th>
                <th>Slot</th>
                <th>Purpose</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {confirmedBookings.map((b, index) => (
                <tr key={index}>
                  <td>{b.day}</td>
                  <td>{b.slot}</td>
                  <td>{b.purpose}</td>
                  <td>{b.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}