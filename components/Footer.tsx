// Bottom footer with logo and copyright
export default function Footer() {
  return (
    <footer className="px-8 py-10 border-t border-white/10 mt-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 rounded-lg w-8 h-8 flex items-center justify-center font-bold text-sm">
            H
          </div>
          <span className="font-semibold">Hostel Maintenance Department</span>
        </div>
        <span className="text-gray-400 text-sm">Imagine • Innovate • Inspire</span>
      </div>

      <div className="border-t border-white/10 pt-4 flex flex-col md:flex-row justify-between gap-2 text-sm text-gray-500">
        <span>© 2025-26 Hostel Maintenance Department. All rights reserved.</span>
        <span>Designed with ❤️ by HMD Team and SUMANTH KONDURI</span>
      </div>
    </footer>
  );
}