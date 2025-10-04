import Hero from "@/components/hero";
import Testimonials from "@/components/testimonials";
import TrustedSection from "@/components/trusted-section";
import ChooseUs from "@/components/choose-us";
import Team from "@/components/team";
import PostureDetection from "@/components/PostureDetection"; 
// import Interview from "@/components/Interview"; // Import the Interview component

// New components for the updated landing page
import ProblemSection from "@/components/ProblemSection";
import SolutionSection from "@/components/SolutionSection";
import SocialProof from "@/components/SocialProof";
import HowItWorks from "@/components/HowItWorks";
import WaitlistForm from "@/components/WaitlistForm";
import FAQ from "@/components/FAQ";
import CTASection from "@/components/CTASection";

export default function Home() {
  return (
    <main>
      {/* Original Hero - Keep as project identity */}
      <Hero />
      
      {/* Original Testimonials */}
      <Testimonials />
      
      {/* New Problem Section - Explains what's broken with current hiring */}
      <ProblemSection />
      
      {/* New Solution Section - How HiringGuru fixes the problems */}
      <SolutionSection />
      
      {/* Original Trusted Section */}
      <TrustedSection />
      
      {/* New Social Proof - Credibility with HR leaders */}
      <SocialProof />
      
      {/* New How It Works - 4 step process */}
      <HowItWorks />
      
      {/* Original Choose Us section */}
      <ChooseUs />
      
      {/* New Waitlist Form - Main conversion point */}
      <WaitlistForm />
      
      {/* New FAQ Section */}
      <FAQ />
      
      {/* Original Team section */}
      <Team />
      
      {/* Final Call to Action */}
      <CTASection />
    </main>
  );
}