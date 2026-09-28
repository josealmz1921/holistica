import classes from './customeService.module.css';
import Link from 'next/link';

const CustomeService = () => {

    const whatsappUrl =
        `https://wa.me/${process.env.NEXT_PUBLIC_PHONE_NUMBER}?text=` +
        encodeURIComponent(
            "Hola, tengo una idea para un servicio personalizado y me gustaría recibir una cotización. ¿Podrían ayudarme?"
        );

    return (
        <section className={classes.root} aria-labelledby="custom-title">
            <div className={classes.content}>
                <p className={classes.eyebrow}>Una experiencia a tu medida</p>
                <h2 id="custom-title" className={classes.title}>Tu momento de calma, a tu manera.</h2>
                <p className={classes.text}>
                    Si buscas una experiencia diferente o un servicio que no aparece en nuestro catálogo, envíanos tu propuesta. Cuéntanos qué necesitas y prepararemos una cotización personalizada para ti.
                </p>
                <Link
                    href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                    className={classes.button}
                >
                    Cuéntanos qué necesitas ↗
                </Link>
            </div>
        </section>
    )
}

export default CustomeService;