// Bottom footer with logo and copyright
export default function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 sm:gap-8 mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary to-primary/80 rounded-lg w-10 h-10 flex items-center justify-center font-bold text-lg text-primary-foreground shadow-lg">
              H
            </div>
            <div className="text-center sm:text-left">
              <div className="font-bold text-foreground">HMD</div>
              <div className="text-xs text-muted-foreground">Hostel Maintenance Department</div>
            </div>
          </div>
          <span className="text-sm font-medium text-muted-foreground">✨ Imagine • Innovate • Inspire</span>
        </div>

        <div className="flex flex-col justify-between gap-4 border-t border-border pt-8 text-xs text-muted-foreground sm:flex-row sm:text-sm">
          <span>2025-26 Sri Sathya Sai Senior Boys Hostel (SSSSBH) Maintenance Department. All rights reserved.</span>
          <span>Designed with <span className="text-destructive">❤</span> by HMD Team - an offering at his Lotus Feet</span>
        </div>
      </div>
    </footer>
  );
}
