
// The 3 departments - Dhwani, Prakash, Kriti
const teams = [
  {
    name: "Dhwani",
    desc: "Complete audio engineering for events, from PA systems to live mixing and professional recording.",
    icon: "🔊",
    gradientFrom: "from-red-600/30",
    gradientTo: "to-red-900/20",
    image: "/images/audio.png",
  },
  {
    name: "Prakash",
    desc: "Stage lighting design, DMX-controlled systems, and electrical maintenance for every event.",
    icon: "💡",
    gradientFrom: "from-amber-600/30",
    gradientTo: "to-amber-900/20",
    image: "/images/lights.png",
  },
  {
    name: "Kriti",
    desc: "Custom fabrication, stage set design, welding, and woodwork for memorable productions.",
    icon: "🔨",
    gradientFrom: "from-emerald-600/30",
    gradientTo: "to-emerald-900/20",
    image: "/images/fabrication.png",
  },
];

export default function TeamSection() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 bg-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-blue-400 text-xs sm:text-sm font-semibold tracking-widest uppercase mb-4">
            ⚙️ Our Teams
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-white">Three Departments, One Mission</h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-base sm:text-lg">
            Crafting experiences through sound, light, and skilled hands. Operated by a passionate student crew.
          </p>
        </div>

        {/* Team cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {teams.map((team) => (
            <div
              key={team.name}
              className="group relative flex flex-col rounded-xl overflow-hidden border border-slate-700 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/20 hover:-translate-y-2 bg-slate-800/50"
            >
              {/* Image Header Placeholder */}
              <div className={`relative h-48 sm:h-56 w-full overflow-hidden bg-gradient-to-br ${team.gradientFrom} ${team.gradientTo}`}>
                {/* Accent overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>
              </div>

              {/* Content */}
              <div className="relative p-6 sm:p-8 flex-1 flex flex-col">
                <div className="absolute -top-10 left-6 sm:left-8 bg-blue-500/20 backdrop-blur-md border border-blue-400/30 rounded-lg p-3 text-3xl shadow-lg z-10 group-hover:-translate-y-1 transition-transform duration-300 hover:bg-blue-500/30">
                  {team.icon}
                </div>
                
                <h3 className="font-bold text-xl sm:text-2xl mt-4 mb-2 text-white group-hover:text-blue-300 transition-colors">{team.name}</h3>
                <p className="text-slate-400 text-sm sm:text-base leading-relaxed flex-1">{team.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
