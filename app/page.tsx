// This is your main page - it imports all the sections and stacks them together
import Hero from "@/components/Hero";
import TeamSection from "@/components/TeamSection";
import StatsSection from "@/components/StatsSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="bg-background text-foreground transition-colors">
      <Hero />
      <TeamSection />
      <StatsSection />
      <Footer />
    </main>
  );
}