export const dynamic = "force-dynamic";

import Hero from "@/src/components/Hero";
import Services from "@/src/components/Services";
import WhyUs from "@/src/components/WhyUs";
import CustomeService from "@/src/components/CustomeService";

export default function Home() {
  return (
    <div>
      <Hero />
      <Services />
      <WhyUs />
      <CustomeService />
    </div>
  );
}