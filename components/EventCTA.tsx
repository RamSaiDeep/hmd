import Link from "next/link";

// The "Planning an Event?" banner at the bottom
export default function EventCTA() {
  return (
    <section className="px-8 py-8">
      <div className="bg-[#111827] border border-white/10 rounded-xl p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-bold mb-1">📅 Planning an Event?</h3>
          <p className="text-gray-400 text-sm">
            Request technical support for hostel events, fests, or cultural programs.
          </p>
        </div>
        <Link
          href="/event-support"
          className="bg-blue-600 hover:bg-blue-500 text-white transition px-6 py-3 rounded-xl font-semibold whitespace-nowrap"
          style={{ color: "#fff" }}
        >
          Request Event Support →
        </Link>
      </div>
    </section>
  );
}