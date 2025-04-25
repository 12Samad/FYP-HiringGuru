import Hero from "@/components/hero";
import Testimonials from "@/components/testimonials";
import TrustedSection from "@/components/trusted-section";
import ChooseUs from "@/components/choose-us";
import Team from "@/components/team";
import PostureDetection from "@/components/PostureDetection"; 
// import Interview from "@/components/Interview"; // Import the Interview component

export default function Home() {
  return (
    <main>
      <Hero />
      <Testimonials />
      <TrustedSection />
      <ChooseUs />
      <Team />


      {/* Posture Detection Section */}
      {/* <section>
        <h1>Posture Detection</h1>
        <PostureDetection />
      </section> */}

      {/* Interview Section */}
      {/* <section className="py-12 bg-gray-100">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center mb-8">AI Interview Practice</h1>
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
            <p className="text-gray-600 mb-6 text-center">
              Practice your interview skills with our AI interviewer. 
              The system will ask you questions and record your responses.
            </p>
            <div className="interview-container">
              {/* <Interview /> */}
            {/* </div> */}
          {/* </div>
        </div>
      // </section> */} 
    </main>
  );
}