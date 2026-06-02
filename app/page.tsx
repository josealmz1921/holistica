import Footer from "@/src/components/Footer/footer";
import Header from "@/src/components/Header";
import Hero from "@/src/components/Hero";
import Services from "@/src/components/Services";
import WhyUs from "@/src/components/WhyUs";

export default function Home() {
  return (
    <div>
      <Header />
      <Hero />
      <Services />
      <WhyUs />
      <Footer />
    </div>
  );
}