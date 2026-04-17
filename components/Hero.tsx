import Link from "next/link";

// Big center section at the top of the page
export default function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center text-center py-20 sm:py-32 px-4 min-h-[calc(100vh-64px)] overflow-hidden">
      {/* Background Image */}
      {/* Background Image placeholder - Add image here later */}
      {/* Overlay to ensure text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-bg)]/90 via-[var(--color-bg-secondary)]/80 to-[var(--color-bg)] z-0"></div>

      <div className="relative z-10 flex flex-col items-center w-full">
        {/* Pill badge */}
        <div className="border border-[var(--color-primary-light)]/50 backdrop-blur-md bg-[var(--color-bg)]/40 rounded-full px-4 py-2 text-xs sm:text-sm text-[var(--color-text)] font-semibold shadow-sm mb-8">
          ✨ Imagine • Innovate • Inspire
        </div>

        {/* Main heading */}
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 leading-tight text-[var(--color-text)] max-w-4xl drop-shadow-sm">
          Hostel Maintenance <br />
          <span className="text-[var(--color-primary-light)] bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-accent-cyan)] bg-clip-text text-transparent">Department</span>
        </h1>

        <p className="text-[var(--color-text-secondary)] sm:text-gray-300 dark:text-gray-300 max-w-2xl mb-10 text-base sm:text-lg leading-relaxed font-medium">
          Professional technical support for all hostel events and maintenance needs. Sound, light, and expert craftsmanship operated by students, for students.
        </p>

        {/* CTA button - goes to complaint registration page */}
        <Link
          href="/register-complaint"
          className="bg-[var(--color-primary-light)] hover:bg-[var(--color-primary-lighter)] text-white dark:text-[var(--color-bg)] transition-all px-8 py-4 rounded-xl font-bold text-base sm:text-lg shadow-lg hover:shadow-[var(--color-primary-light)]/50 border border-[var(--color-primary-lighter)]/20 hover:scale-105 transform duration-200 inline-block"
        >
          Register Complaint →
        </Link>
      </div>

      {/* Decorative element */}
      <div className="relative z-10 mt-16 sm:mt-24 text-6xl opacity-20 animate-pulse drop-shadow-xl">
        ⚡
      </div>
    </section>
  );
}
