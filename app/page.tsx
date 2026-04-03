// This is your main page - it imports all the sections and stacks them together
import Hero from "@/components/Hero";
import CategoryCards from "@/components/CategoryCards";
import TeamSection from "@/components/TeamSection";
import StatsSection from "@/components/StatsSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <CategoryCards />
      <TeamSection />
      <StatsSection />
      <Footer />
    </main>
  );
}