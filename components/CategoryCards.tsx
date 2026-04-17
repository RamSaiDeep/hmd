
const categories = [
  { label: "Music Programs", icon: "🎵", href: "/category/music-programs", image: "/images/music.png" },
  { label: "Others", icon: "⚙️", href: "/category/others", image: "/images/others.png" },
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
              className="group relative h-64 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] hover:border-[var(--color-primary-light)] transition-all duration-300 hover:shadow-lg hover:shadow-[var(--color-primary-light)]/20 hover:-translate-y-1 block"
            >
              {/* Background Image Placeholder */}
              
              {/* Gradient Overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent"></div>
              
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col gap-2">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 w-fit text-3xl mb-2 border border-white/20 text-white shadow-xl">
                  {cat.icon}
                </div>
                <span className="font-bold text-white text-xl sm:text-2xl group-hover:text-[var(--color-primary-light)] transition-colors">{cat.label}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
