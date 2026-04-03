const categories = [
  { label: "Music Programs", icon: "🎵", href: "/category/music-programs" },
  { label: "Others", icon: "⚙️", href: "/category/others" },
];

export default function CategoryCards() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[var(--color-bg-secondary)]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-text)] mb-2">Service Categories</h2>
          <p className="text-[var(--color-text-secondary)]">Browse and request services across different categories</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {categories.map((cat) => (
            <a
              key={cat.label}
              href={cat.href}
              className="group relative p-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] hover:border-[var(--color-primary-light)] transition-all duration-300 hover:shadow-lg hover:shadow-[var(--color-primary-light)]/10 hover:-translate-y-1"
            >
              {/* Background accent on hover */}
              <div className="absolute inset-0 bg-[var(--color-primary-light)]/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Content */}
              <div className="relative flex flex-col items-center gap-4">
                <div className="bg-gradient-to-br from-[var(--color-primary-light)]/20 to-[var(--color-accent-cyan)]/10 rounded-xl p-4 text-4xl group-hover:scale-110 transition-transform duration-300">
                  {cat.icon}
                </div>
                <span className="text-center font-semibold text-[var(--color-text)] text-sm sm:text-base group-hover:text-[var(--color-primary-light)] transition-colors">{cat.label}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
