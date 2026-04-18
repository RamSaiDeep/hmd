// The 4 stat boxes - 3 Departments, 100+ Events, etc.
const stats = [
  { value: "100+", label: "Events Covered", icon: "🎉" },
  { value: "24/7", label: "Support Available", icon: "🛠️" },
  { value: "25+", label: "Years of Seva", icon: "⭐" },
];

export default function StatsSection() {
  return (
    <section className="bg-slate-100 px-4 py-16 dark:bg-slate-950 sm:px-6 sm:py-24 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          {stats.map((s) => (
            <div
              key={s.label}
              className="group relative rounded-lg border border-slate-300 bg-gradient-to-br from-white to-slate-100 p-6 text-center transition-all duration-300 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/20 dark:border-slate-700 dark:from-slate-800 dark:to-slate-900 sm:p-8"
            >
              {/* Hover accent */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              {/* Content */}
              <div className="relative z-10">
                <div className="text-4xl sm:text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{s.icon}</div>
                <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">{s.value}</p>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 sm:text-base">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
