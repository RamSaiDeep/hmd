import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function OthersPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Other Support Options</h1>
        <p className="text-muted-foreground mb-12">Other support options available from HMD.</p>

        {/* Planning an event section */}
        <div className="mb-12 rounded-xl border border-border bg-card p-8">
          <h2 className="text-2xl font-bold text-foreground mb-3">📅 Planning an Event?</h2>
          <p className="text-muted-foreground mb-4">
            Need technical support for a hostel event, fest, or cultural program?
            Fill out the event support form and our team will review what they can provide.
          </p>
          <p className="text-muted-foreground font-semibold mb-3">We cover:</p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
            <li>🔊 Dhwani — Sound and audio (microphones, instruments, PA systems)</li>
            <li>💡 Prakash — Lighting (stage lights, DMX systems, electrical setup)</li>
            <li>🔨 Kriti — Stage and fabrication (setup, props, backdrops, woodwork)</li>
          </ul>
          <Link href="/category/events" className={cn(buttonVariants())}>
            Request Event Support →
          </Link>
        </div>

        <hr className="border-border my-8" />

        {/* General complaint section */}
        <div className="mb-12 rounded-xl border border-border bg-card p-8">
          <h2 className="text-2xl font-bold text-foreground mb-3">🔧 Other Maintenance Complaints</h2>
          <p className="text-muted-foreground mb-6">
            Have a maintenance issue that does not fit Hostel Programs, Music, or SRDRS?
            Register it here and our team will look into it.
          </p>
          <Link href="/register-complaint" className={cn(buttonVariants())}>
            Register a Complaint →
          </Link>
        </div>

        <hr className="border-border my-8" />

        {/* Other categories */}
        <div className="rounded-xl border border-border bg-card p-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Looking for something else?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Link href="/category/music-programs" className={cn(buttonVariants({ variant: "outline" }), "w-full justify-start")}>
              🎵 Music Programs
            </Link>
            <Link href="/category/srdrs" className={cn(buttonVariants({ variant: "outline" }), "w-full justify-start")}>
              🎙️ SRDRS Recording Studio
            </Link>
            <Link href="/services" className={cn(buttonVariants({ variant: "outline" }), "w-full justify-start")}>
              📋 All Services
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}