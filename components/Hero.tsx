import Link from "next/link";
import Image from "next/image";

// Big center section at the top of the page
export default function Hero() {
  return (
    <section className="relative flex min-h-[calc(100vh-64px)] flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-slate-100 via-slate-50 to-white px-4 py-20 text-center dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 sm:py-32">
      
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
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-white/85 from-0% via-slate-100/75 via-30% to-transparent to-100% dark:from-slate-950 dark:via-slate-900/95 dark:to-slate-950/60"></div>

      {/* Decorative glow elements */}
      <div className="absolute right-20 top-20 z-0 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl"></div>
      <div className="absolute bottom-20 left-20 z-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl"></div>
      
      <div className="relative z-10 flex flex-col items-center w-full">
        {/* Pill badge */}
        <div className="mb-8 rounded-full border border-blue-500/25 bg-white/80 px-4 py-2 text-xs font-semibold text-blue-700 shadow-lg backdrop-blur-md dark:border-blue-400/40 dark:bg-slate-900/50 dark:text-blue-100 sm:text-sm">
          ✨ Imagine • Innovate • Inspire
        </div>

        {/* Main heading */}
        <h1 className="mb-6 max-w-4xl px-2 text-4xl font-bold leading-tight text-slate-900 drop-shadow-lg dark:text-white sm:text-6xl lg:text-7xl">
          Hostel Maintenance <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-400 bg-clip-text text-transparent">Department</span>
        </h1>

        <p className="mb-10 max-w-2xl text-base font-medium leading-relaxed text-slate-700 dark:text-slate-300 sm:text-lg">
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
            className="inline-block w-full transform rounded-lg border border-slate-300/70 bg-white px-8 py-3 text-center text-base font-bold text-slate-800 shadow-lg transition-all duration-200 hover:scale-105 hover:bg-slate-100 sm:w-auto sm:px-10 sm:py-4 sm:text-lg dark:border-slate-700/50 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          >
            Explore Services
          </Link>
        </div>
      </div>

      {/* Decorative element */}
      <div className="relative z-10 mt-16 animate-pulse text-6xl opacity-30 drop-shadow-xl sm:mt-24">
        ⚡
      </div>
    </section>
  );
}
