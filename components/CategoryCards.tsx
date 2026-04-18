
const categories = [
  { label: "Music Programs", icon: "🎵", href: "/category/music-programs", image: "/images/music.png", color: "from-blue-600/40" },
  { label: "Others", icon: "⚙️", href: "/category/others", image: "/images/others.png", color: "from-cyan-600/40" },
];

export default function CategoryCards() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-slate-950">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">Service Categories</h2>
          <p className="text-slate-400 text-lg">Browse and request services across different categories</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
          {categories.map((cat) => (
            <a
              key={cat.label}
              href={cat.href}
              className="group relative h-72 overflow-hidden rounded-xl border border-slate-700 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/20 hover:-translate-y-2 block"
            >
              {/* Gradient Background with color variation */}
              <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} to-slate-900`}></div>
              
              {/* Enhanced Overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 from-0% via-slate-900/50 via-50% to-transparent"></div>
              
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col gap-3">
                <div className="bg-blue-500/20 backdrop-blur-md rounded-lg p-3 w-fit text-4xl border border-blue-400/30 text-white shadow-lg group-hover:bg-blue-500/30 transition-all">
                  {cat.icon}
                </div>
                <span className="font-bold text-white text-2xl sm:text-3xl group-hover:text-blue-300 transition-colors">{cat.label}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
