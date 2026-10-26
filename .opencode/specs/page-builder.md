# Constructor de páginas

[Índice](../../README.md) · [Dashboard](dashboard.md) · [Seguridad](../docs/security.md)

## Origen y alcance

Se importó **únicamente** el directorio completo `src/page-builder/` y su suite `tests/page-builder.test.mjs` desde `josealmz1921/ingenix`, rama `feat/enterprise-homepage-blocks`, commit `a522753`. No se aplicó cherry-pick ni se importaron cuentas, contenido de clientes, imágenes, Header/Footer o configuración del origen. El README del módulo explica su contrato portable; esta especificación describe su integración en Flor de luna.

Una página con ID fijo `home`, listada en `/dashboard/pages` y editable en `/dashboard/pages/home`. No crea nuevas rutas `/{slug}` ni cambia las colecciones de servicios/blog. **Publicar guarda la instantánea que lee `/` para sus bloques iniciales y su SEO.** Guardar borrador no cambia el sitio. La conexión pública fue autorizada; los cambios de código no equivalen a un despliegue confirmado.

## Integración con el inicio

- `getPublishedHome` es un lector `server-only` que consulta exclusivamente `pagePublished/home`, nunca borradores. No admite rutas/IDs del visitante ni devuelve información administrativa. El uso del SDK Admin para esta lectura pública está limitado a esa instantánea explícitamente publicable.
- Vuelve a validar revisión, esquema, ID `home`, publicación (un único H1), imágenes permitidas, anclas reservadas y límite de 256 KiB antes del render. Si falta la publicación, es incompatible, falla su lectura o supera cuatro segundos, devuelve `null` y conserva el Hero original. El timeout deja de esperar, pero no cancela la solicitud interna del SDK.
- La ruta sigue siendo dinámica; `cache` de React comparte la lectura entre metadatos y contenido de una misma petición, sin una caché persistente entre visitantes. Una publicación nueva se ve al solicitar de nuevo `/`, no actualiza pestañas abiertas automáticamente.
- Los bloques publicados sustituyen **solo el Hero inicial**. `HomeSections` conserva debajo servicios activos, Nosotros, información para visitantes, Experiencia, terapeuta, blog publicado y contacto personalizado, con sus fuentes de datos y anclas originales. No son todavía bloques movibles del constructor; pueden repetir temas de bloques editoriales y deben revisarse al diseñar el inicio.
- Header/Footer, consentimiento y eventos Analytics se mantienen. `generateMetadata` aplica título/descripción SEO publicados a metadatos, Open Graph y Twitter; conserva canónica `/` e imagen social actuales. Sin valores personalizados se mantienen los valores SEO anteriores.
- Reversión de emergencia: establecer `PAGE_BUILDER_HOME_DISABLED=true` en el servidor y reiniciar/re desplegar según el entorno. Omite por completo la lectura publicada y restaura Hero/SEO originales, sin borrar borrador ni instantánea. Quitar la variable o ponerla en `false` vuelve a habilitar la lectura.

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
- Campos SEO propios del documento, aplicados al inicio únicamente desde la versión publicada.
- Aviso al cerrar/recargar con cambios locales. No hay guardado automático ni garantía de recuperación; las transiciones internas de Next no están bloqueadas.
- Control de revisión optimista: una sesión desactualizada recibe 409 y debe recargar. No hay combinación automática de cambios entre administradores.
- Cargar contenido, eliminar bloques y publicar requieren confirmación con SweetAlert2 (dependencia existente), en español y con colores/tipografías de Flor de luna. Cancelar tiene el foco inicial; Escape o cerrar el diálogo no confirma. Mientras se decide, se bloquean edición y acciones concurrentes. Los avisos de éxito/error permanecen en el editor. Solo se conserva el aviso nativo `beforeunload`, controlado por el navegador al salir con cambios pendientes.

### Precarga del contenido existente

`initialPage()` prepara seis bloques a partir del contenido editorial estático del inicio original: portada con `/img/heroImage.jpg`, imagen de Nosotros `/img/bed.jpg`, detalles de atención, información para visitantes, pasos de la experiencia y contacto personalizado. Incluye los mismos metadatos SEO y enlaces WhatsApp (incluido el mensaje de cotización); no descarga imágenes ni copia documentos de servicios, terapeuta o blog.

Sin borrador guardado, esta plantilla se carga solo en memoria. Si existe un borrador, se respeta íntegramente. El botón **Cargar contenido actual** permite sustituir toda la edición local previa confirmación, manteniendo la revisión de servidor para el siguiente guardado; no guarda ni publica por sí mismo. Se refiere al contenido estático del repositorio, no a una captura del HTML publicado ni a un historial de versiones.

Solo la portada importada está visible inicialmente. Los otros cinco bloques quedan ocultos porque las secciones originales siguen apareciendo en `HomeSections`; activarlos añade copias, no reemplaza automáticamente esas secciones. Se pueden revisar y editar desde Estructura/lienzo antes de guardar. La conversión conserva texto plano y recursos existentes, no garantiza reproducir exactamente la composición visual del Hero original.

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
- La vista completa reutiliza Header/Footer **del destino**, las mismas fuentes y `PageRenderer` con tema Flor de luna y `mode="draft"`, seguido de `HomeSections` como en el inicio público. Estas secciones usan datos públicos actuales, no una instantánea del borrador.
- Solo muestra el documento local de `sessionStorage` de una sesión administradora. No hay endpoint público que devuelva borradores, ni enlaces compartibles de previsualización. El control cliente no sustituye seguridad: aquí solo protege presentación de datos ya locales; las lecturas persistidas están protegidas por servidor/reglas.
- La ventana nueva recibe la copia local al abrir; para ver cambios posteriores hay que abrir otra vista previa. No contiene datos en query strings.
- No carga GTM ni emite eventos, está excluida en la utilidad de Analytics, tiene `noindex` y está excluida de robots/sitemap. El sitio público conserva su consentimiento y medición actuales.

## Verificación y pendientes externos

Comandos: `npm run test:page-builder`, `npm run test:security`, `npm run test:analytics`, `npm run test:seo`, `npx tsc --noEmit`, ESLint focalizado, `npm run build` y pruebas de reglas en el emulador `demo-holistica-security` según [Desarrollo](../docs/development.md#pruebas-de-firestore).

Las pruebas del módulo cubren JSON, variantes, campos del editor, URLs, IDs, H1, renderizado, textos escapados y aislamiento. La suite adicional comprueba autorización antes de DB, separación de instantáneas, validación de publicación, revisión obsoleta, dominios de imágenes y tamaños. Las reglas se prueban exclusivamente en el emulador.

Además se revisó la interfaz en navegador a 1280 px y 500 px (ancho mínimo admitido por la ventana de prueba), con identidad ficticia y respuestas de persistencia simuladas: edición, agregar, duplicar, reordenar, ocultar, guardado y bloqueo de publicación incompleta. Vista previa con un solo H1, sin desbordamiento horizontal y sin GTM. No es una prueba de integración con Firebase/Cloudinary reales ni una comprobación exacta a 390 px. El estado inicial del formulario Informed se mantiene estable para evitar ciclos de actualización al editar.

Esa revisión visual corresponde a la interfaz anterior. El rediseño de catálogo/lienzo/inspector tiene comprobaciones de tipos, build y pruebas de operaciones de inserción/orden/copia; queda pendiente su revisión interactiva autenticada y del arrastre real en escritorio/móvil.

La edición directa y el arrastre de tarjetas completas se comprobaron después en navegador con un montaje aislado del editor, datos ficticios y persistencia simulada (sin autenticación ni escrituras remotas): título editado/guardado, foco conservado al vaciarlo, pegado de etiquetas como texto literal y arrastre con eventos de puntero progresivos hasta una posición intermedia. También se probó un ancho de navegador de 500 px con lienzo lógico de 390 px, sin desbordamiento horizontal, y arrastre desde el catálogo superpuesto al lienzo. El montaje aislado no sustituye la revisión autenticada del dashboard ni comprueba gestos táctiles reales.

La conexión pública tiene pruebas de lectura exclusiva de la instantánea, fallback por ausencia/error/timeout/datos inválidos, interruptor de reversión, bloqueo de anclas reservadas y render de inicio con un solo H1 tanto con publicación como sin ella. Las pruebas de composición sustituyen las secciones de datos externos por dobles; no confirman el estado remoto. Build, TypeScript, ESLint focalizado y 52 pruebas locales pasan; la revisión visual de esta composición pública y la integración autenticada quedan pendientes.

**Pendiente, no ejecutado:** desplegar las reglas locales cuando se autorice; comprobar permisos IAM de escritura de la cuenta de servicio en las nuevas colecciones; prueba interactiva con un administrador en un entorno no productivo y subidas firmadas de prueba autorizadas. No se crearon documentos ni se cambiaron Firebase/Cloudinary de producción.

Antes de desplegar: revisar presentación, metadatos/canónica, WhatsApp y Analytics sobre la versión publicada. Las secciones actuales y las conexiones al catálogo/blog se conservan; convertirlas en bloques dinámicos movibles queda fuera de esta integración.
