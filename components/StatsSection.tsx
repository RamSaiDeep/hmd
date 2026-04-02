// The 4 stat boxes - 3 Departments, 100+ Events, etc.
const stats = [
  { value: "3", label: "Departments", icon: "⚙️" },
  { value: "100+", label: "Events Covered", icon: "🎉" },
  { value: "24/7", label: "Support Available", icon: "🛠️" },
  { value: "25+", label: "Years of Seva", icon: "⭐" },
];

export default function StatsSection() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 bg-[var(--color-bg-secondary)]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((s) => (
            <div
              key={s.label}
              className="group relative rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6 sm:p-8 text-center hover:border-[var(--color-primary-light)]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[var(--color-primary-light)]/10"
            >
              {/* Hover accent */}
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-light)]/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Content */}
              <div className="relative z-10">
                <div className="text-4xl sm:text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">{s.icon}</div>
                <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-accent-cyan)] bg-clip-text text-transparent mb-2">{s.value}</p>
                <p className="text-[var(--color-text-secondary)] text-xs sm:text-sm font-medium">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
