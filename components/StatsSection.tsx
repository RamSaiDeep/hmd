// The 4 stat boxes - 3 Departments, 100+ Events, etc.
const stats = [
  { value: "3", label: "Departments" },
  { value: "100+", label: "Events Covered" },
  { value: "24/7", label: "Support Available" },
  { value: "25+", label: "Years of Seva" },
];

export default function StatsSection() {
  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-4 px-8 py-8">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-[#111827] border border-white/10 rounded-xl p-6 text-center"
        >
          <p className="text-3xl font-bold text-blue-400">{s.value}</p>
          <p className="text-gray-400 text-sm mt-1">{s.label}</p>
        </div>
      ))}
    </section>
  );
}