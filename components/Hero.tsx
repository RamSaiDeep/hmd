import Link from "next/link";

// Big center section at the top of the page
export default function Hero() {
  return (
    <section className="flex flex-col items-center justify-center text-center py-20 sm:py-32 px-4 min-h-[calc(100vh-64px)] bg-gradient-to-b from-[var(--color-bg)] via-[var(--color-bg-secondary)] to-[var(--color-bg)]">
      {/* Pill badge */}
      <div className="border border-[var(--color-primary-light)]/30 bg-[var(--color-bg-secondary)] rounded-full px-4 py-2 text-xs sm:text-sm text-[var(--color-text-secondary)] mb-8 font-medium">
        ✨ Imagine • Innovate • Inspire
      </div>

      {/* Main heading */}
      <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 leading-tight text-[var(--color-text)] max-w-4xl">
        Hostel Maintenance <br />
        <span className="text-[var(--color-primary-light)] bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-accent-cyan)] bg-clip-text text-transparent">Department</span>
      </h1>

      <p className="text-[var(--color-text-secondary)] max-w-2xl mb-10 text-base sm:text-lg leading-relaxed">
        Professional technical support for all hostel events and maintenance needs. Sound, light, and expert craftsmanship at your service.
      </p>

      {/* CTA button - goes to complaint registration page */}
      <Link
        href="/register-complaint"
        className="bg-[var(--color-primary-light)] hover:bg-[var(--color-primary-lighter)] text-[var(--color-bg)] transition px-8 py-4 rounded-xl font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl hover:scale-105 transform duration-200 inline-block"
      >
        Register Complaint →
      </Link>

      {/* Decorative element */}
      <div className="mt-16 sm:mt-24 text-6xl opacity-10 animate-pulse">
        ⚙️
      </div>
    </section>
  );
}
