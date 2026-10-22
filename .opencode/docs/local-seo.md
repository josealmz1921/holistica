# SEO local — Flor de luna en Pachuca

[Índice](../../README.md) · [Despliegue](deployment.md)

## Ubicación y público

El propietario confirmó que el servicio se presta en **un espacio en Pachuca, Hidalgo**. Se recibe público de Pachuca y alrededores, CDMX y Estado de México. Esto no implica sucursales ni servicio a domicilio en otras ciudades.

La prioridad editorial es describir los masajes tántricos y nuru realmente ofrecidos, con ubicación clara y contenido natural. No se promete posicionamiento ni un alcance geográfico determinado. Google no utiliza `meta keywords` para posicionar; no se añade una lista de ciudades o variantes repetidas de palabras clave.

## Implementación en el repositorio

### Inicio

`src/utilities/siteSeo.ts` centraliza los metadatos de inicio y servicios. `app/(site)/page.tsx` publica:

- Título: **Masajes tántricos en Pachuca | Flor de luna**.
- Descripción de los servicios en Pachuca con mención a visitantes de CDMX, Edomex y alrededores.
- Canónica `/`, Open Graph y tarjeta de X con el mismo título/descripción y una imagen local existente.

La canónica del inicio vive en su página, **no en el layout compartido**, para no heredar `/` en servicios o artículos. El layout conserva `metadataBase` a partir del dominio configurado.

El Hero incluye un único H1 «Masajes tántricos en Pachuca» y mantiene «Baja el ritmo. Vuelve a ti.» como frase de apoyo visible. No se ocultan palabras clave para buscadores.

La sección para visitantes explica la ubicación real y sugiere reservar antes de viajar, con enlace a WhatsApp para orientación. No inventa dirección, mapa, tiempos de traslado, horarios ni promesas de disponibilidad.

### Servicios

- Ruta pública real: `/{slug}`. Canónica y `og:url` ahora usan esa ruta, mediante el mismo constructor de URLs que usa el sitemap.
- Se corrige la generación anterior de `/services/{slug}`; no se cambian slugs ni se crean nuevas rutas o redirecciones.
- Título por defecto: **Nombre del servicio en Pachuca | Flor de luna**. Si el nombre ya incluye Pachuca, no se vuelve a añadir la ciudad.
- Marca Open Graph: **Flor de luna**, en vez de «Masajes Profesionales».
- `seoTitle`, `seoDescription`, `ogTitle`, `ogDescription`, `twitterTitle`, `twitterDescription` e imágenes personalizados conservan prioridad. Solo se recortan espacios externos en los campos de texto usados como metadatos; no se escribe en Firebase.
- Descripción de respaldo: resumen breve, descripción (hasta 160 caracteres) o frase sobre el servicio en Pachuca, según disponibilidad. Las descripciones personalizadas no se truncan desde esta utilidad.
- Imágenes: se conserva la prioridad de la imagen social, imagen principal y primera imagen de galería. Como respaldo se usa `/img/bed.jpg`, sin inventar dimensiones de archivos.
- La lectura pública del servicio se comparte dentro de la solicitud mediante `React.cache` entre metadatos y contenido. No introduce una caché global de contenido privado ni cambia filtros de publicación.

## Dominio

`NEXT_PUBLIC_SITE_URL` debe contener el origen público definitivo con HTTPS. El constructor normaliza el origen, evitando barras duplicadas o URLs `undefined/...`. Si falta o es inválido, las utilidades producen rutas relativas: **esto no es una configuración de producción válida**. El sitemap seguirá vacío sin un origen válido, como antes.

El cambio de dominio se configura en Vercel y requiere nuevo despliegue. No se modifica `.env.local` ni la configuración remota automáticamente.

## Qué no se modificó

- Documentos de servicios, categorías, blog o perfil en Firebase.
- Títulos SEO personalizados ya guardados: si necesitan mencionar Pachuca, el propietario puede revisarlos desde el dashboard.
- Perfil de Negocio de Google, Search Console, índices o resultados de Google.
- No se generaron páginas duplicadas por ciudad ni datos estructurados de sucursales o direcciones no confirmadas.
- No se cambiaron la política de consentimiento ni los eventos de Analytics; el título de página del evento del inicio se actualiza para coincidir con su nuevo título SEO.

## Verificación y siguientes pasos

1. Ejecutar `npm run test:seo`, ESLint focalizado y `npm run build`.
2. Tras publicar, inspeccionar el HTML del inicio y de servicios con y sin metadatos personalizados: título, descripción, canónica, `og:url`, marca e imágenes.
3. Confirmar que las URLs de servicios coinciden con `/sitemap.xml` y no utilizan el prefijo `/services/`.
4. Verificar el diseño del Hero y la sección de visitantes en móvil y escritorio.
5. En Search Console, verificar la propiedad real, enviar/comprobar el sitemap e inspeccionar URLs importantes para solicitar indexación cuando corresponda. Estos pasos externos no se han realizado desde el repositorio.
6. Revisar el contenido del servicio tántrico: descripción real de la sesión, duración, preparación, límites y preguntas frecuentes, sin garantías médicas ni datos inventados. Requiere revisión editorial del propietario, no una migración automática de Firebase.

`tests/site-seo.test.cjs` cubre metadatos del inicio, rutas canónicas de servicios, normalización del dominio, valores de respaldo y respeto de campos personalizados. No sustituye una inspección de indexación ni mide posiciones en Google. Las pruebas de slugs/SEO de blog y renderizado de descripciones siguen siendo mejoras separadas.
