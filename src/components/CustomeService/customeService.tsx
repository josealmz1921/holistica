import classes from './customeService.module.css';
import Link from 'next/link';

const CustomeService = () => {

    const whatsappUrl =
        `https://wa.me/${process.env.NEXT_PUBLIC_PHONE_NUMBER}?text=` +
        encodeURIComponent(
            "Hola, tengo una idea para un servicio personalizado y me gustaría recibir una cotización. ¿Podrían ayudarme?"
        );

    return (
        <div className={classes.root}>
            <div className={classes.content}>
                <h2 className={classes.title}>¿Tienes una idea en mente?</h2>
                <p className={classes.text}>
                    Si buscas una experiencia diferente o un servicio que no aparece en nuestro catálogo, envíanos tu propuesta. Cuéntanos qué necesitas y prepararemos una cotización personalizada para ti.
                </p>
                <Link
                    href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                    className={classes.button}
                >
                    Cotizar
                </Link>
            </div>
        </div>
    )
}

export default CustomeService;