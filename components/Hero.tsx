import Link from "next/link";

// Big center section at the top of the page
export default function Hero() {
  return (
    <section className="flex flex-col items-center justify-center text-center py-32 px-4">
      {/* Pill badge */}
      <div className="border border-white/20 rounded-full px-4 py-1 text-sm text-gray-400 mb-8">
        • Imagine • Innovate • Inspire
      </div>

      {/* Main heading */}
      <h1 className="text-6xl font-bold mb-4 leading-tight">
        Hostel Maintenance <br />
        <span className="text-blue-400">Department</span>
      </h1>

      <p className="text-gray-400 max-w-lg mb-10 text-lg">
        Professional technical support for all hostel events and maintenance
        needs. Sound, light, and expert craftsmanship.
      </p>

      {/* CTA button - goes to complaint registration page */}
      <Link
        href="/register-complaint"
        className="bg-blue-600 hover:bg-blue-500 transition px-6 py-3 rounded-xl font-semibold text-lg"
      >
        Register Complaint →
      </Link>
    </section>
  );
}