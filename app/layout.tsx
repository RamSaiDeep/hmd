import type { Metadata } from "next";
import type { Viewport } from "next";
import { Inter, Outfit, Geist_Mono } from "next/font/google";
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

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HMD - Hostel Maintenance Department",
  description: "Professional technical support for all hostel events and maintenance needs. Sound, light, and expert craftsmanship at your service.",
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
      className={cn("h-full", "antialiased", inter.variable, outfit.variable, geistMono.variable)}
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
