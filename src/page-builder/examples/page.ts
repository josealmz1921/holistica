import type { PageDocument } from '../types/page';

/** Neutral example: no brand, assets, environment variables or database required. */
export const examplePage: PageDocument = {
  schemaVersion: 1,
  id: 'inicio',
  title: 'Inicio',
  sections: [
    {
      id: 'presentacion', type: 'hero', variant: 'left', visible: true,
      content: { title: 'Un espacio para ti', description: 'Presenta aquí tu propuesta.', actions: [] },
    },
    {
      id: 'servicios', type: 'cards', variant: 'default', visible: true, columns: 3,
      content: { title: 'Nuestros servicios', description: 'Descubre nuestras opciones.', items: [
        { id: 'servicio-ejemplo', title: 'Servicio de ejemplo', description: 'Explica en qué consiste.' },
      ] },
    },
  ],
};
