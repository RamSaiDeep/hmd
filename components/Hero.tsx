import Link from "next/link";
import Image from "next/image";

// Big center section at the top of the page
export default function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center text-center py-20 sm:py-32 px-4 min-h-[calc(100vh-64px)] overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
      
      {/* Immersive Full-Screen Background Image */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/images/hero-bg.JPG" 
          alt="Glowing Building Background" 
          fill
          style={{
            objectFit: 'cover',
            objectPosition: 'center'
          }}
          priority
          className="opacity-40 object-top"
        />
      </div>

      {/* Sophisticated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 from-0% via-slate-900/95 via-30% to-slate-950/60 to-100% z-0"></div>

      {/* Decorative glow elements */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl z-0"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl z-0"></div>
      
      <div className="relative z-10 flex flex-col items-center w-full">
        {/* Pill badge */}
        <div className="border border-blue-400/40 backdrop-blur-md bg-slate-900/50 rounded-full px-4 py-2 text-xs sm:text-sm text-blue-100 font-semibold shadow-lg mb-8">
          ✨ Imagine • Innovate • Inspire
        </div>

        {/* Main heading */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-white max-w-4xl drop-shadow-lg px-2">
          Hostel Maintenance <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-400 bg-clip-text text-transparent">Department</span>
        </h1>

        <p className="text-slate-300 max-w-2xl mb-10 text-base sm:text-lg leading-relaxed font-medium">
          Professional technical support for all hostel events and maintenance needs. Sound, light, and expert craftsmanship operated by students, for students.
        </p>

        {/* CTA buttons */}
        <div className="flex gap-4 flex-col sm:flex-row items-center justify-center">
          <Link
            href="/register-complaint"
            className="bg-blue-600 hover:bg-blue-700 text-white transition-all px-8 py-3 sm:px-10 sm:py-4 rounded-lg font-bold text-base sm:text-lg shadow-lg hover:shadow-blue-600/50 border border-blue-500/30 hover:scale-105 transform duration-200 inline-block w-full sm:w-auto text-center"
          >
            Register Complaint →
          </Link>
          <Link
            href="/category/music-programs"
            className="bg-slate-800 hover:bg-slate-700 text-slate-100 transition-all px-8 py-3 sm:px-10 sm:py-4 rounded-lg font-bold text-base sm:text-lg shadow-lg border border-slate-700/50 hover:scale-105 transform duration-200 inline-block w-full sm:w-auto text-center"
          >
            Explore Services
          </Link>
        </div>
      </div>

      {/* Decorative element */}
      <div className="relative z-10 mt-16 sm:mt-24 text-6xl opacity-30 animate-pulse drop-shadow-xl">
        ⚡
      </div>
    </section>
  );
}
