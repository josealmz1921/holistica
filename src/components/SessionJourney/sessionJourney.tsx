import styles from "./sessionJourney.module.css";

const steps = [
  {
    number: "01",
    title: "CONSULTA INICIAL",
    description:
      "Identificamos tus puntos de tensión y preferencias de presión.",
  },
  {
    number: "02",
    title: "PREPARACIÓN",
    description:
      "Aromaterapia personalizada y ajuste de temperatura ambiental.",
  },
  {
    number: "03",
    title: "MASAJE PROFUNDO",
    description:
      "60 minutos de técnicas manuales rítmicas y envolventes.",
  },
  {
    number: "04",
    title: "MOMENTO DE CALMA",
    description:
      "Despertar suave acompañado de una infusión herbaria orgánica.",
  },
];

export default function SessionJourney() {
  return (
    <section className={styles.container}>
      <h2 className={styles.title}>El Viaje de La Sesión</h2>

      <div className={styles.timeline}>
        {steps.map((step, index) => (
          <div key={step.number} className={styles.item}>
            <div
              className={`${styles.circle} ${
                index === 0 ? styles.active : ""
              }`}
            >
              {step.number}
            </div>

            {index !== steps.length - 1 && (
              <div className={styles.line} />
            )}

            <div className={styles.content}>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}