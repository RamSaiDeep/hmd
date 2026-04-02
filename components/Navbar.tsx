import Link from "next/link";

// Top navigation bar with logo, links and login button
export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-8 py-4 border-b border-white/10">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="bg-blue-600 rounded-lg w-8 h-8 flex items-center justify-center font-bold text-sm">
          H
        </div>
        <span className="font-semibold text-lg">MD</span>
      </div>

      {/* Nav links */}
      <div className="flex items-center gap-6">
        <Link href="/" className="text-gray-300 hover:text-white transition">Home</Link>
        <Link href="/admin" className="text-gray-300 hover:text-white transition">Admin</Link>
        <Link href="/login" className="bg-blue-600 hover:bg-blue-500 transition px-4 py-2 rounded-lg text-sm font-medium">
          Login / Sign Up
        </Link>
      </div>
    </nav>
  );
}