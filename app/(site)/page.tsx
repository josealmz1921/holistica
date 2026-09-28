export const dynamic = "force-dynamic";

import styles from "./home.module.css";
import Blog from "@/src/components/Blog/blog";
import Hero from "@/src/components/Hero";
import Services from "@/src/components/Services";
import WhyUs from "@/src/components/WhyUs";
import CustomeService from "@/src/components/CustomeService";
import Therapist from "@/src/components/Therapist";

export default function Home() {
  return (
    <main>
      <Hero />
      <Services />
      <WhyUs />
      <section id="experiencia" className={styles.experience} aria-labelledby="experience-title">
        <div className={styles.inner}>
          <p className={styles.eyebrow}>Tu experiencia</p>
          <h2 id="experience-title" className={styles.title}>Solo tienes que darte el tiempo.</h2>
          <div className={styles.steps}>
            <div><span>01</span><h3>Elige tu sesión</h3><p>Explora los masajes y encuentra el que conecta con lo que necesitas.</p></div>
            <div><span>02</span><h3>Conversemos</h3><p>Escríbenos por WhatsApp para resolver tus dudas y coordinar tu visita.</p></div>
            <div><span>03</span><h3>Permítete una pausa</h3><p>Llega, respira y disfruta de un momento dedicado a ti.</p></div>
          </div>
        </div>
      </section>
      <Therapist />
      <Blog />
      <CustomeService />
    </main>
  );
}