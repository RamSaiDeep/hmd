import type { Metadata } from "next";
import type { Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "./providers";
import NavbarWrapper from "@/components/NavbarWrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "HMD - Sri Sathya Sai Senior Boys Hostel (SSSSBH) Maintenance & Media Services",
  description: "Official Hostel Maintenance Department (HMD) portal for Sri Sathya Sai Senior Boys Hostel (SSSSBH). Request maintenance, book the SRDRS studio, or request sound/light support.",
  keywords: [
    "Sri Sathya Sai Senior Boys Hostel",
    "SSSSBH",
    "SSSSBH Maintenance",
    "Hostel Maintenance",
    "SRDRS Booking",
    "Studio Recording",
    "Sound System",
    "Lighting Support",
    "HMD"
  ],
  metadataBase: new URL("https://psn-hmd.vercel.app"),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", inter.variable, outfit.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors">
        <Providers>
          <NavbarWrapper />
          <main className="flex-1 bg-background text-foreground transition-colors">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
