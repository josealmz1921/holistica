# Especificación del blog y SEO

[Índice del proyecto](../../README.md) · [Dashboard](dashboard.md) · [Firebase](../docs/firebase.md)

## Administración y contenido

- Listado en `/dashboard/blog`; creación en `/dashboard/blog/new`; edición por ID en `/dashboard/blog/{id}`.
- Campos: título, slug, resumen, contenido, publicación, imágenes/videos y SEO opcional.
- Título obligatorio, hasta 160 caracteres. Resumen opcional, hasta 400.
- Slug de hasta 120 caracteres con minúsculas, números y guiones. Vacío al crear: se genera desde el título.
- Editor.js admite párrafos, encabezados de niveles 2/3 y listas; herramientas inline de negrita, cursiva y enlaces.
- El editor del cuerpo no incluye herramientas de subida multimedia. Los archivos se gestionan por separado en la galería del formulario.
- El guardado de la interfaz exige contenido y espera el procesamiento de archivos.

## Publicación y URLs

- `published == false`: borrador, accesible únicamente a admin bajo las reglas desplegadas.
- `published == true`: aparece en el sitio público.
- La URL pública es `/blog/{slug}`; el ID interno del documento no cambia cuando cambia el slug.
- `blogSlugs/{slug}` reserva la relación con el documento dentro de una transacción.
- `previousSlugs` conserva slugs anteriores. La página pública redirige permanentemente a la URL vigente cuando se accede a un alias o ID reconocido.
- La detección de conflictos considera entradas y slugs anteriores. Borrar una entrada no limpia automáticamente todas sus reservas de slug; una limpieza futura debe preservar la integridad de las URLs.

## Fechas reales

| Campo | Comportamiento |
| --- | --- |
| `createdAt` | Timestamp del servidor al crear un documento nuevo |
| `updatedAt` | Timestamp del servidor al guardar |
| `publishedAt` | Se registra cuando pasa a publicada si aún no tenía una fecha y antes no estaba publicada |

Si una entrada antigua ya estaba publicada y no tiene `publishedAt`, guardarla no inventa una fecha histórica. Si se despublica y después se publica sin fecha previa, se registra la publicación observada en esa transición, no una supuesta fecha original. Las fechas existentes se conservan; las reglas impiden sobrescribir la primera fecha guardada.

## Archivos y textos alternativos

- Hasta 10 archivos por entrada, ordenables.
- Imágenes JPG/PNG de hasta 5 MiB y 1200 × 1200 px; videos MP4/WebM de hasta 150 MiB, sujetos al plan/preset.
- Texto alternativo opcional por imagen; la interfaz limita a 300 caracteres. No existe un campo equivalente para el contenido hablado del video.
- La primera imagen se utiliza como portada de la tarjeta, aunque haya videos antes en la lista.
- Sin imagen, la tarjeta muestra solo título, resumen y enlace: no se repite una portada ficticia de “Flor de luna”.
- Las referencias de archivos se guardan con la entrada. Reordenar o quitar elementos no implica que todos los recursos remotos se eliminen automáticamente.

Consulta [Cloudinary](../docs/cloudinary.md) para controles externos, firmas y diferencias entre quitar una referencia y borrar un archivo.

### Galería pública del artículo

- Las imágenes del detalle se muestran como un collage de columnas con proporciones variadas, sin carrusel; una sola imagen utiliza todo el ancho. Con cinco o más imágenes se usan tres columnas en escritorio, dos en móvil.
- Las miniaturas recortan para componer el collage. Al pulsarlas se abre un visor modal con la imagen completa sin recortar, texto alternativo y zoom de 100 % a 300 % en pasos de 50 %.
- Los controles permiten acercar, alejar y restablecer el zoom. Con zoom se puede desplazar el área de imagen con scroll/táctil o teclado al enfocar esa área.
- Se cierra con el botón, `Esc` o clic fuera del panel. Headless UI gestiona foco modal, bloqueo de scroll del fondo y devolución del foco al disparador.
- No hay reproducción automática ni navegación de carrusel. Los videos se muestran debajo con controles nativos, conservando su orden relativo. Las imágenes conservan el orden relativo de administración en el flujo de columnas.
- El listado, formulario, archivos guardados y SEO no cambian. No se introduce una dependencia nueva.

## SEO y redes sociales

La sección plegable “SEO y redes sociales” es opcional. No cambia el título editorial visible de la entrada.

| Configuración | Valor por defecto |
| --- | --- |
| `seoTitle`, hasta 70 caracteres | Título de la entrada y «Flor de luna», separados por una barra vertical |
| `seoDescription`, hasta 160 caracteres | Resumen; si está vacío, una frase basada en el título |
| `seoImagePublicId` | Primera imagen disponible |
| Alt de imagen social | Texto alternativo guardado; si está vacío, título de la entrada |

La selección de imagen social utiliza identificadores, no su posición final: reordenar archivos no cambia por sí solo la imagen elegida. Si desaparece, se usa la primera imagen disponible. La imagen social puede ser distinta de la portada de la tarjeta.

Se generan:

- Título y descripción del documento.
- URL canónica con el slug actual.
- Open Graph de tipo `article`, con nombre de sitio y locale `es_MX`.
- Tarjeta de X `summary_large_image` si hay imagen; `summary` si no la hay.
- Fechas de publicación/modificación cuando existen.
- JSON-LD `BlogPosting` con idioma, titular, descripción, publisher, URL/imagen y fechas disponibles. No se inventa un autor personal.

`src/utilities/blogSeo.ts` centraliza las reglas de fallback y escapa `<` al serializar JSON-LD. `BlogContent` sanitiza el HTML antes de mostrarlo.

La vista previa de Google del formulario es orientativa: no garantiza el texto que mostrará el buscador ni un resultado enriquecido. Los límites de 70/160 se aplican a los campos personalizados; un título o resumen usado como fallback puede ser más largo.

## Sitemap, dominio y rastreo

- `NEXT_PUBLIC_SITE_URL` proporciona el dominio; no se fija un dominio real dentro de la documentación.
- `/sitemap.xml` incluye inicio, blog, entradas publicadas y servicios activos, con `lastModified` cuando hay un timestamp válido.
- Sin dominio válido configurado, el sitemap devuelve una lista vacía. Las utilidades del blog no inventan una URL absoluta.
- Login/dashboard llevan `noindex`; `robots.txt` desaconseja rastrearlos. Esto no es una barrera de seguridad.

## Criterios para comprobar cambios

La medición opcional de visitas y lecturas estimadas (`page_view`, `blog_read`) requiere consentimiento; definición de umbrales y configuración de GTM en [Métricas](../docs/analytics.md). No se considera que abrir una entrada demuestre lectura.

1. Los borradores no aparecen ni son accesibles por consultas públicas.
2. Los campos SEO vacíos mantienen útiles las entradas antiguas.
3. El HTML renderizado contiene título, canónica, metadatos sociales y JSON-LD correctos.
4. Una imagen social elegida se conserva tras reordenar y tiene un fallback si se elimina.
5. Los textos no permiten insertar scripts en HTML ni cerrar el `script` de JSON-LD.
6. Cambiar el slug conserva el ID y redirige los alias reconocidos.
7. Guardar una entrada antigua no crea una fecha histórica ficticia.
8. El sitemap no incluye borradores, dashboard ni servicios inactivos.

Las suites persistentes actuales se centran en APIs/reglas de seguridad. No hay una suite específica de SEO en `package.json`; añadirla figura como posible mejora en [Tareas](../tasks.md).
