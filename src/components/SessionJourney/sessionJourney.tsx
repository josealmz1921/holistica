import styles from "./sessionJourney.module.css";

export default function SessionJourney(props: any) {

  const { route } = props;

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>El Viaje de La Sesión</h2>

      <div className={styles.timeline}>
        {route.map((step: any, index: any) => (
          <div key={index} className={styles.item}>
            <div
              className={`${styles.circle} ${index === 0 ? styles.active : ""
                }`}
            >
              {index + 1}
            </div>

            {index !== route.length - 1 && (
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