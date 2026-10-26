import Swal from 'sweetalert2';
import styles from './builder.module.css';

const confirmations = {
    load: {
        title: '¿Cargar el contenido actual?',
        text: 'Se reemplazará toda la edición local por los textos, imágenes, enlaces y SEO del inicio original. El borrador guardado y la publicación no cambiarán. Las copias de secciones existentes estarán ocultas para evitar duplicados.',
        confirmButtonText: 'Cargar contenido',
    },
    remove: {
        title: '¿Eliminar este bloque?',
        text: 'Se quitará de la edición local del borrador. Las imágenes no se borrarán de Cloudinary. Guarda el borrador para conservar la eliminación.',
        confirmButtonText: 'Eliminar bloque',
    },
    publish: {
        title: '¿Publicar los cambios?',
        text: 'Los bloques y el SEO de la versión guardada serán públicos en el inicio del sitio. Las secciones de servicios, terapeuta y blog se conservarán.',
        confirmButtonText: 'Sí, publicar',
    },
} as const;

export type BuilderConfirmation = keyof typeof confirmations;

export async function confirmBuilderAction(action: BuilderConfirmation): Promise<boolean> {
    const result = await Swal.fire({
        ...confirmations[action],
        icon: 'warning',
        iconColor: '#7b8d85',
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        focusCancel: true,
        buttonsStyling: false,
        scrollbarPadding: false,
        heightAuto: false,
        customClass: {
            popup: styles.confirmPopup,
            title: styles.confirmTitle,
            htmlContainer: styles.confirmText,
            actions: styles.confirmActions,
            confirmButton: styles.confirmAccept,
            cancelButton: styles.confirmCancel,
        },
    });
    return result.isConfirmed === true;
}
