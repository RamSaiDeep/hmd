import Link from "next/link";

export default function OthersPage() {
  return (
    <div>
      <nav>
        <Link href="/">HMD</Link>
        <Link href="/">← Home</Link>
      </nav>

      <h1>Others</h1>
      <p>Other support options available from HMD.</p>

      {/* Planning an event section */}
      <div>
        <h2>📅 Planning an Event?</h2>
        <p>
          Need technical support for a hostel event, fest, or cultural program?
          Fill out the event support form and our team will review what they can provide.
        </p>
        <p>We cover:</p>
        <ul>
          <li>🔊 Dhwani — Sound and audio (microphones, instruments, PA systems)</li>
          <li>💡 Prakash — Lighting (stage lights, DMX systems, electrical setup)</li>
          <li>🔨 Kriti — Stage and fabrication (setup, props, backdrops, woodwork)</li>
        </ul>
        <Link href="/event-support">Request Event Support →</Link>
      </div>

      <hr />

      {/* General complaint section */}
      <div>
        <h2>🔧 Other Maintenance Complaints</h2>
        <p>
          Have a maintenance issue that does not fit Hostel Programs, Music, or SRDRS?
          Register it here and our team will look into it.
        </p>
        <Link href="/register-complaint">Register a Complaint →</Link>
      </div>

      <hr />

      {/* Other categories */}
      <div>
        <h2>Looking for something else?</h2>
        <ul>
          <li><Link href="/category/hostel-programs">Hostel Programs →</Link></li>
          <li><Link href="/category/music-programs">Music Programs →</Link></li>
          <li><Link href="/category/srdrs">SRDRS Recording Studio →</Link></li>
        </ul>
      </div>
    </div>
  );
}