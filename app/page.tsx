'use client';

import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import MaintenanceGraphicCarousel from "@/components/MaintenanceGraphicCarousel";
import { StatsCard } from "@/components/StatsCard";
import { QuickActionCard } from "@/components/QuickActionCard";
import { ActivityFeed } from "@/components/ActivityFeed";
import { MaintenanceIcon } from "@/components/MaintenanceIcons";

export default function Home() {
  // Mock data for demo purposes
  const stats = [
    {
      icon: '⚡',
      title: 'Total Complaints',
      value: '142',
      subtitle: 'All time',
      trend: 'neutral' as const
    },
    {
      icon: '✅',
      title: 'Resolved',
      value: '128',
      subtitle: '90% completion rate',
      trend: 'up' as const
    },
    {
      icon: '⏳',
      title: 'Pending',
      value: '14',
      subtitle: 'Average 2 days to resolve',
      trend: 'down' as const
    },
    {
      icon: '⚙️',
      title: 'In Progress',
      value: '8',
      subtitle: 'Being worked on now',
      trend: 'neutral' as const
    }
  ];

  const recentActivities = [
    {
      id: '1',
      type: 'resolved' as const,
      category: 'Electrical',
      location: 'Room A-204',
      timeAgo: '2 hours ago'
    },
    {
      id: '2',
      type: 'in_progress' as const,
      category: 'Fan',
      location: 'Common Room',
      timeAgo: '1 hour ago'
    },
    {
      id: '3',
      type: 'submitted' as const,
      category: 'Light',
      location: 'Corridor B',
      timeAgo: '30 min ago'
    },
    {
      id: '4',
      type: 'pending' as const,
      category: 'Switch',
      location: 'Kitchen',
      timeAgo: '15 min ago'
    }
  ];

  return (
    <main className="bg-background text-foreground transition-colors min-h-screen">
      {/* Hero Section with Carousel */}
      <section className="relative py-12 md:py-20 overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-neon-blue blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full bg-neon-gold blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-16">
            {/* Left side - Text content */}
            <div className="animate-slide-in-left">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                Hostel Maintenance &{' '}
                <span className="bg-gradient-to-r from-neon-blue via-neon-gold to-neon-green bg-clip-text text-transparent">
                  Media Services
                </span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Submit maintenance requests, track repairs, and access our state-of-the-art recording studio all in one place. 
                Your comfort and needs are our priority.
              </p>
              <div className="flex gap-4 flex-wrap">
                <Link href="/register-complaint">
                  <button className="px-8 py-3 rounded-lg bg-neon-blue text-black font-semibold hover:shadow-lg hover:shadow-neon-blue/50 transition-all animate-glow">
                    Submit a Complaint →
                  </button>
                </Link>
                <Link href="#stats">
                  <button className="px-8 py-3 rounded-lg border border-neon-gold text-neon-gold hover:bg-neon-gold/10 transition-all font-semibold">
                    View Statistics
                  </button>
                </Link>
              </div>
            </div>

            {/* Right side - Graphic carousel */}
            <div className="animate-slide-in-right h-96">
              <MaintenanceGraphicCarousel />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className="py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-8">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <QuickActionCard
              href="/register-complaint"
              icon="🔧"
              title="Report an Issue"
              description="Submit a new maintenance complaint or service request"
            />
            <QuickActionCard
              href="#"
              icon="📋"
              title="View My Complaints"
              description="Track the status of your submitted complaints"
            />
            <QuickActionCard
              href="#"
              icon="🎙️"
              title="Studio Booking"
              description="Reserve the SRDRS recording studio for your event"
            />
            <QuickActionCard
              href="#"
              icon="🔊"
              title="Sound & Lighting"
              description="Request sound system or lighting support for events"
            />
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section id="stats" className="py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Department Statistics</h2>
            <p className="text-muted-foreground">Track our performance and service quality metrics</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <StatsCard
                key={index}
                icon={stat.icon}
                title={stat.title}
                value={stat.value}
                subtitle={stat.subtitle}
                trend={stat.trend}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Recent Activity Section */}
      <section className="py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Activity feed - takes up 2 columns on larger screens */}
            <div className="lg:col-span-2">
              <ActivityFeed activities={recentActivities} />
            </div>

            {/* Services info card */}
            <div className="glass p-6 rounded-xl h-fit">
              <h3 className="text-lg font-semibold text-foreground mb-4">Our Services</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <p className="font-semibold text-sm text-foreground">Electrical</p>
                    <p className="text-xs text-muted-foreground">Repairs & maintenance</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🎚️</span>
                  <div>
                    <p className="font-semibold text-sm text-foreground">Audio Systems</p>
                    <p className="text-xs text-muted-foreground">Professional equipment</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🔨</span>
                  <div>
                    <p className="font-semibold text-sm text-foreground">General Repairs</p>
                    <p className="text-xs text-muted-foreground">Quick maintenance</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🎬</span>
                  <div>
                    <p className="font-semibold text-sm text-foreground">Studio Access</p>
                    <p className="text-xs text-muted-foreground">SRDRS booking</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Submit a Request?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Our team is ready to help. Submit your complaint or service request now.
          </p>
          <Link href="/register-complaint">
            <button className="px-8 py-4 rounded-lg bg-gradient-to-r from-neon-blue to-neon-gold text-black font-bold text-lg hover:shadow-lg hover:shadow-neon-blue/50 transition-all">
              Get Started →
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground text-sm">
          <p>© 2024 Sri Sathya Sai Senior Boys Hostel - Maintenance & Media Services. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
