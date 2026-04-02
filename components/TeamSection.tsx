// The 3 departments - Dhwani, Prakash, Kriti
const teams = [
  {
    name: "Dhwani",
    desc: "Complete audio engineering for events, from PA systems to live mixing and professional recording.",
    icon: "🔊",
    accentColor: "from-[var(--color-accent-red)]/20",
  },
  {
    name: "Prakash",
    desc: "Stage lighting design, DMX-controlled systems, and electrical maintenance for every event.",
    icon: "💡",
    accentColor: "from-[var(--color-accent-amber)]/20",
  },
  {
    name: "Kriti",
    desc: "Custom fabrication, stage set design, welding, and woodwork for memorable productions.",
    icon: "🔨",
    accentColor: "from-[var(--color-accent-emerald)]/20",
  },
];

export default function TeamSection() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 bg-[var(--color-bg)]">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-[var(--color-primary-light)] text-xs sm:text-sm font-semibold tracking-widest uppercase mb-3">
            ⚙️ Our Teams
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-[var(--color-text)]">Three Departments, One Mission</h2>
          <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto text-base sm:text-lg">
            Crafting experiences through sound, light, and skilled hands.
          </p>
        </div>

        {/* Team cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {teams.map((team) => (
            <div
              key={team.name}
              className={`group relative rounded-xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-bg-secondary)] to-[var(--color-bg)] p-8 hover:border-[var(--color-primary-light)]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[var(--color-primary-light)]/10 hover:-translate-y-1`}
            >
              {/* Accent background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${team.accentColor} to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              
              {/* Content */}
              <div className="relative z-10">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{team.icon}</div>
                <h3 className="font-bold text-xl sm:text-2xl mb-3 text-[var(--color-text)] group-hover:text-[var(--color-primary-light)] transition-colors">{team.name}</h3>
                <p className="text-[var(--color-text-secondary)] text-sm sm:text-base leading-relaxed">{team.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
