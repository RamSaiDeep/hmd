// Bottom footer with logo and copyright
export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-900 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 sm:gap-8 mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg w-10 h-10 flex items-center justify-center font-bold text-lg text-white shadow-lg">
              H
            </div>
            <div className="text-center sm:text-left">
              <div className="font-bold text-white">HMD</div>
              <div className="text-xs text-slate-400">Hostel Maintenance Department</div>
            </div>
          </div>
          <span className="text-slate-400 text-sm font-medium">✨ Imagine • Innovate • Inspire</span>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row justify-between gap-4 text-xs sm:text-sm text-slate-500">
          <span>© 2025-26 Hostel Maintenance Department. All rights reserved.</span>
          <span>Designed with 💜 by HMD Team - an offering at his Lotus Feet</span>
        </div>
      </div>
    </footer>
  );
}
