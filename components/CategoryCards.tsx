const categories = [
  { label: "Music Programs", icon: "🎵", href: "/category/music-programs" },
  { label: "Others", icon: "···", href: "/category/others" },
];

export default function CategoryCards() {
  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-4 px-8 py-8">
      {categories.map((cat) => (
        <a
          key={cat.label}
          href={cat.href}
          className="bg-[#111827] border border-white/10 rounded-xl p-6 flex flex-col items-center gap-3 cursor-pointer hover:border-blue-500/50 transition"
        >
          <div className="bg-[#1e2a3a] rounded-xl p-3 text-2xl">{cat.icon}</div>
          <span className="text-sm font-medium">{cat.label}</span>
        </a>
      ))}
    </section>
  );
}