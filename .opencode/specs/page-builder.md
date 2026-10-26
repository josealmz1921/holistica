# Constructor de páginas

[Índice](../../README.md) · [Dashboard](dashboard.md) · [Seguridad](../docs/security.md)

## Origen y alcance

Se importó **únicamente** el directorio completo `src/page-builder/` y su suite `tests/page-builder.test.mjs` desde `josealmz1921/ingenix`, rama `feat/enterprise-homepage-blocks`, commit `a522753`. No se aplicó cherry-pick ni se importaron cuentas, contenido de clientes, imágenes, Header/Footer o configuración del origen. El README del módulo explica su contrato portable; esta especificación describe su integración en Flor de luna.

Primera versión: una página con ID fijo `home`, listada en `/dashboard/pages` y editable en `/dashboard/pages/home`. No crea nuevas rutas `/{slug}`, no modifica servicios/blog ni sustituye `app/(site)/page.tsx`. **Publicar almacena una instantánea, pero no la conecta al sitio.** La activación pública requiere aprobación explícita del propietario y una integración posterior de SEO/lectura publicada.

## Editor

- Reutiliza el dashboard y su autenticación, formularios Informed/Input para datos de página/SEO y formularios controlados recursivos basados en `getBlockFields` para bloques.
- Listado con búsqueda y filtro de estado; no ofrece crear páginas que la API todavía no admite. Editor inspirado en Stitch: catálogo/estructura, lienzo seleccionable e inspector de contenido, variantes y apariencia; conserva colores y fuentes del sitio. En anchos reducidos, los paneles laterales se abren sobre el lienzo.
- Arrastre desde el catálogo a puntos de inserción, reordenamiento de bloques desde lienzo/estructura y de elementos dentro de listas (tarjetas, proyectos y botones). Incluye asas, indicador de inserción y alternativas de agregar/subir/bajar sin arrastre.
- Las tarjetas completas del catálogo son arrastrables; el botón `+` sigue siendo independiente. Una miniatura acompaña al puntero y el punto de inserción se expande al pasar sobre él. En pantallas estrechas el catálogo superpuesto se cierra al iniciar el arrastre para dejar visible el lienzo.
- Títulos, descripciones, antetítulos, notas, textos de botones/enlaces y textos de tarjetas/proyectos se editan directamente en el lienzo. Son cadenas de texto plano (también al pegar), sin HTML enriquecido; borrar un título no desmonta el campo. El lateral conserva variantes, imágenes/textos alternativos, destinos, altas/orden de elementos y ajustes avanzados. Los bloques ocultos siguen editables, con aviso, pero no aparecen en la vista previa externa ni en el render público.
- Catálogo: Hero, texto, banner, tarjetas y proyectos, con todas las variantes del módulo. No incluye aún bloques dinámicos de servicios, terapeuta o blog.
- Agregar, editar, duplicar, eliminar con confirmación, ordenar por arrastre y con botones/teclado, ocultar/mostrar. Duplicar Hero lo deja oculto para no crear accidentalmente otro H1 visible.
- El orden del array define el orden visual. Hasta 100 bloques; límites de listas/botones establecidos por el esquema.
- Interpreta objetos/listas opcionales y números, sin guardar números de columnas como cadenas.
- Aplica `florDeLunaTheme` tanto a los controles como a `PageRenderer`. Los estilos del módulo no necesitan Tailwind y no modifican estilos globales.
- Campos SEO propios del documento, todavía sin cambiar los metadatos del inicio real.
- Aviso al cerrar/recargar con cambios locales. No hay guardado automático ni garantía de recuperación; las transiciones internas de Next no están bloqueadas.
- Control de revisión optimista: una sesión desactualizada recibe 409 y debe recargar. No hay combinación automática de cambios entre administradores.

## Imágenes

Reutiliza Dropzone y `uploadImage`, que solicitan firma a `/api/cloudinary/sign`. JPG/PNG hasta 5 MiB y los límites de dimensiones existentes de Dropzone. Solo admite imágenes locales de `/img/` o del Cloudinary ya configurado, sin ampliar `next.config.ts` a dominios arbitrarios.

La selección sube inmediatamente y bloquea guardado mientras está en curso. El documento conserva la URL y texto alternativo según el contrato del módulo, no un inventario de activos. Quitar bloques/referencias **no elimina archivos remotos**, pues una imagen puede seguir utilizada en otra versión. Subidas abandonadas pueden dejar archivos sin uso; la limpieza y su seguimiento son una mejora pendiente. No se hicieron subidas reales durante la verificación.

## Borradores y publicación

| Documento | Datos | Acceso SDK cliente con las reglas locales |
| --- | --- | --- |
| `pageDrafts/home` | `document`, `revision`, `updatedAt` | Lectura solo `admin: true`; ninguna escritura directa |
| `pagePublished/home` | `document`, `revision`, `publishedAt` | Lectura pública; ninguna escritura directa |

Las escrituras pasan **siempre por el servidor**:

- `GET /api/admin/pages/home`: lectura administrativa del borrador y números de revisión; no devuelve el contenido publicado.
- `PUT`: `{ document, revision }`, valida en modo borrador y guarda una nueva revisión.
- `POST`: `{ revision }`, vuelve a leer el borrador dentro de una transacción, comprueba revisión y valida en modo publicación. No acepta un documento publicado proporcionado por el cliente.

Las tres operaciones requieren un ID token verificado con revocación y claim booleano `admin: true`, antes de acceder a Firestore. El SDK Admin evita las reglas; por eso la comprobación de servidor es obligatoria. Las reglas deniegan escrituras incluso a administradores para impedir saltarse la validación del esquema.

La publicación exige una única portada H1, como primer bloque visible. Se rechazan campos desconocidos, versiones desconocidas, identificadores duplicados/reservados y URLs ejecutables. No hay HTML enriquecido ni carga de JavaScript arbitrario. React escapa el contenido.

Documento serializado: máximo 256 KiB UTF-8; petición: 256 KiB + 4 KiB para el envoltorio, con lectura limitada del stream. Las APIs Cloudinary mantienen su límite anterior de 16 KiB. Guardar/publicar: 20 solicitudes por minuto/UID/acción/proceso; no es un contador distribuido. Respuestas administrativas `Cache-Control: no-store`.

Las colecciones están separadas: guardar un borrador no cambia la instantánea publicada. No se guardan datos de usuarios ni se duplican las colecciones de servicios y blog. No hay historial completo, despublicación ni eliminación de páginas en esta primera versión.

## Vista previa

- Lienzo seleccionable dentro del editor, sin enlaces interactivos, con anchos lógicos de 390, 768 y 1280 px escalados al espacio disponible. El renderizador usa consultas de contenedor para adaptar bloques al ancho del lienzo, no al navegador del administrador.
- Botón para abrir `/builder-preview` en una ventana del ancho seleccionado. El navegador puede ajustar el tamaño o bloquear ventanas emergentes; comprobar el viewport real en herramientas de desarrollo.
- La vista completa reutiliza Header/Footer **del destino**, las mismas fuentes y `PageRenderer` con tema Flor de luna y `mode="draft"`.
- Solo muestra el documento local de `sessionStorage` de una sesión administradora. No hay endpoint público que devuelva borradores, ni enlaces compartibles de previsualización. El control cliente no sustituye seguridad: aquí solo protege presentación de datos ya locales; las lecturas persistidas están protegidas por servidor/reglas.
- La ventana nueva recibe la copia local al abrir; para ver cambios posteriores hay que abrir otra vista previa. No contiene datos en query strings.
- No carga GTM ni emite eventos, está excluida en la utilidad de Analytics, tiene `noindex` y está excluida de robots/sitemap. El sitio público conserva su consentimiento y medición actuales.

## Verificación y pendientes externos

Comandos: `npm run test:page-builder`, `npm run test:security`, `npm run test:analytics`, `npm run test:seo`, `npx tsc --noEmit`, ESLint focalizado, `npm run build` y pruebas de reglas en el emulador `demo-holistica-security` según [Desarrollo](../docs/development.md#pruebas-de-firestore).

Las pruebas del módulo cubren JSON, variantes, campos del editor, URLs, IDs, H1, renderizado, textos escapados y aislamiento. La suite adicional comprueba autorización antes de DB, separación de instantáneas, validación de publicación, revisión obsoleta, dominios de imágenes y tamaños. Las reglas se prueban exclusivamente en el emulador.

Además se revisó la interfaz en navegador a 1280 px y 500 px (ancho mínimo admitido por la ventana de prueba), con identidad ficticia y respuestas de persistencia simuladas: edición, agregar, duplicar, reordenar, ocultar, guardado y bloqueo de publicación incompleta. Vista previa con un solo H1, sin desbordamiento horizontal y sin GTM. No es una prueba de integración con Firebase/Cloudinary reales ni una comprobación exacta a 390 px. El estado inicial del formulario Informed se mantiene estable para evitar ciclos de actualización al editar.

Esa revisión visual corresponde a la interfaz anterior. El rediseño de catálogo/lienzo/inspector tiene comprobaciones de tipos, build y pruebas de operaciones de inserción/orden/copia; queda pendiente su revisión interactiva autenticada y del arrastre real en escritorio/móvil.

La edición directa y el arrastre de tarjetas completas se comprobaron después en navegador con un montaje aislado del editor, datos ficticios y persistencia simulada (sin autenticación ni escrituras remotas): título editado/guardado, foco conservado al vaciarlo, pegado de etiquetas como texto literal y arrastre con eventos de puntero progresivos hasta una posición intermedia. También se probó un ancho de navegador de 500 px con lienzo lógico de 390 px, sin desbordamiento horizontal, y arrastre desde el catálogo superpuesto al lienzo. El montaje aislado no sustituye la revisión autenticada del dashboard ni comprueba gestos táctiles reales.

**Pendiente, no ejecutado:** desplegar las reglas locales cuando se autorice; comprobar permisos IAM de escritura de la cuenta de servicio en las nuevas colecciones; prueba interactiva con un administrador en un entorno no productivo y subidas firmadas de prueba autorizadas. No se crearon documentos ni se cambiaron Firebase/Cloudinary de producción.

Antes de conectar el inicio: el propietario debe aprobar la presentación, decidir cómo mantener las secciones actuales y conexiones al catálogo/blog, y revisar metadatos/canónica, WhatsApp y Analytics sobre la versión publicada. No conectar únicamente el renderizador eliminando esas funcionalidades del inicio actual.
