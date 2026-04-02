// The 3 departments - Dhwani, Prakash, Kriti
const teams = [
  {
    name: "Dhwani",
    desc: "Complete audio engineering for events, from PA systems to live mixing and professional recording.",
    icon: "🔊",
    borderColor: "border-red-500/40",
  },
  {
    name: "Prakash",
    desc: "Stage lighting design, DMX-controlled systems, and electrical maintenance for every event.",
    icon: "💡",
    borderColor: "border-yellow-500/40",
  },
  {
    name: "Kriti",
    desc: "Custom fabrication, stage set design, welding, and woodwork for memorable productions.",
    icon: "🔨",
    borderColor: "border-green-500/40",
  },
];

export default function TeamSection() {
  return (
    <section className="px-8 py-16 text-center">
      {/* Section label */}
      <p className="text-blue-400 text-sm font-semibold tracking-widest mb-2">
        OUR TEAMS
      </p>
      <h2 className="text-4xl font-bold mb-2">Three Departments, One Mission</h2>
      <p className="text-gray-400 mb-12">
        Crafting experiences through sound, light, and skilled hands.
      </p>

      {/* Team cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {teams.map((team) => (
          <div
            key={team.name}
            className={`bg-[#111827] border-t-2 ${team.borderColor} border-x border-b border-white/10 rounded-xl p-6 text-left`}
          >
            <div className="text-3xl mb-4">{team.icon}</div>
            <h3 className="font-bold text-lg mb-2">{team.name}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{team.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}