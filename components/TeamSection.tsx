
// The 3 departments - Dhwani, Prakash, Kriti
const teams = [
  {
    name: "Dhwani",
    desc: "Complete audio engineering for events, from PA systems to live mixing and professional recording.",
    icon: "🔊",
    accentColor: "from-[var(--color-accent-red)]/20",
    image: "/images/audio.png",
  },
  {
    name: "Prakash",
    desc: "Stage lighting design, DMX-controlled systems, and electrical maintenance for every event.",
    icon: "💡",
    accentColor: "from-[var(--color-accent-amber)]/20",
    image: "/images/lights.png",
  },
  {
    name: "Kriti",
    desc: "Custom fabrication, stage set design, welding, and woodwork for memorable productions.",
    icon: "🔨",
    accentColor: "from-[var(--color-accent-emerald)]/20",
    image: "/images/fabrication.png",
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
            Crafting experiences through sound, light, and skilled hands. Operated by a passionate student crew.
          </p>
        </div>

        {/* Team cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {teams.map((team) => (
            <div
              key={team.name}
              className="group relative flex flex-col rounded-2xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-[var(--color-primary-light)]/50 transition-all duration-300 hover:shadow-xl hover:shadow-[var(--color-primary-light)]/10 hover:-translate-y-2"
            >
              {/* Image Header Placeholder */}
              <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-[var(--color-bg-secondary)]">
                {/* Accent overlay on image */}
                <div className={`absolute inset-0 bg-gradient-to-t ${team.accentColor} to-transparent mix-blend-multiply opacity-60 group-hover:opacity-40 transition-opacity`}></div>
              </div>

              {/* Content */}
              <div className="relative p-6 sm:p-8 flex-1 flex flex-col bg-gradient-to-b from-transparent to-[var(--color-bg)]">
                <div className="absolute -top-10 left-6 sm:left-8 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-3 text-3xl shadow-lg z-10 group-hover:-translate-y-1 transition-transform duration-300">
                  {team.icon}
                </div>
                
                <h3 className="font-bold text-xl sm:text-2xl mt-4 mb-3 text-[var(--color-text)] group-hover:text-[var(--color-primary-light)] transition-colors">{team.name}</h3>
                <p className="text-[var(--color-text-secondary)] text-sm sm:text-base leading-relaxed flex-1">{team.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
