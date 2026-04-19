
const categories = [
  { label: "Music Programs", icon: "🎵", href: "/category/music-programs", color: "from-blue-600/30" },
  { label: "SRDRS Recording Studio", icon: "🎙️", href: null, color: "from-purple-600/30" },
  { label: "Events Program", icon: "🏠", href: "/category/events", color: "from-emerald-600/30" },
];

export default function CategoryCards() {
  return (
    <section id="services" className="bg-slate-100 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold text-slate-900 sm:text-4xl lg:text-5xl">Explore Services</h2>
          <p className="text-lg text-slate-600">Pick a service area to continue: Music Programs, Events Program.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((cat) => (
            cat.href ? (
              <a
                key={cat.label}
                href={cat.href}
                className="group relative block h-72 overflow-hidden rounded-3xl border border-slate-300 bg-white transition-all duration-300 hover:-translate-y-2 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/20"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} to-slate-100 opacity-90`}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-100 from-0% via-slate-100/40 via-50% to-transparent"></div>

                <div className="absolute inset-0 p-8 flex flex-col justify-end gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/80 text-4xl shadow-md backdrop-blur-sm">
                    {cat.icon}
                  </div>
                  <h3 className="text-2xl font-semibold text-slate-900 transition-colors group-hover:text-blue-700 sm:text-3xl">
                    {cat.label}
                  </h3>
                  <span className="inline-flex items-center justify-center rounded-full bg-white/80 px-3 py-1 text-sm font-medium text-slate-700">
                    Visit
                  </span>
                </div>
              </a>
            ) : (
              <div
                key={cat.label}
                className="relative block h-72 overflow-hidden rounded-3xl border border-slate-300 bg-white"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} to-slate-100 opacity-90`}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-100 from-0% via-slate-100/40 via-50% to-transparent"></div>

                <div className="absolute inset-0 p-8 flex flex-col justify-end gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/80 text-4xl shadow-md backdrop-blur-sm">
                    {cat.icon}
                  </div>
                  <h3 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
                    {cat.label}
                  </h3>
                  <span className="inline-flex items-center justify-center rounded-full bg-white/80 px-3 py-1 text-sm font-medium text-slate-700">
                    In Progress
                  </span>
                </div>
              </div>
            )
          ))}
        </div>
      </div>
    </section>
  );
}
