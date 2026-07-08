
const categories = [
  { label: "Music Programs", icon: "🎵", href: "/category/music-programs", color: "from-primary/20" },
  { label: "SRDRS Recording Studio", icon: "🎙️", href: "/category/srdrs", color: "from-secondary/20" },
  { label: "Events - Support", icon: "🏠", href: "/category/events", color: "from-accent/20" },
];

export default function CategoryCards() {
  return (
    <section id="services" className="bg-background px-4 py-16 sm:px-6 sm:py-24 lg:px-8 border-t border-border">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">Explore Services</h2>
          <p className="text-lg text-muted-foreground">Pick a service area to continue: Music Programs, Events Program, and Studio Bookings.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((cat) => (
            <a
              key={cat.label}
              href={cat.href}
              className="group relative block h-72 overflow-hidden rounded-3xl border border-border bg-card transition-all duration-300 hover:-translate-y-2 hover:border-primary/50 hover:shadow-lg"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} to-background opacity-90`}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-card from-0% via-card/40 via-50% to-transparent"></div>

              <div className="absolute inset-0 p-8 flex flex-col justify-end gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-background/80 text-4xl shadow-md backdrop-blur-sm border border-border">
                  {cat.icon}
                </div>
                <h3 className="text-2xl font-semibold text-foreground transition-colors group-hover:text-primary sm:text-3xl">
                  {cat.label}
                </h3>
                <span className="inline-flex items-center justify-center rounded-full bg-background/80 px-3 py-1 text-sm font-medium text-foreground border border-border">
                  Visit
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
