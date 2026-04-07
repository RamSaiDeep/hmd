import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow Next.js dev resources (HMR) from LAN host(s)
  allowedDevOrigins: ["192.168.43.231"],
};

export default nextConfig;
