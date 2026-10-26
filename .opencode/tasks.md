# Tareas y estado del proyecto

[Índice del proyecto](../README.md) · [Despliegue](docs/deployment.md) · [Guía de trabajo](AGENTS.md)

Este archivo distingue **implementación en el repositorio** de **configuración externa confirmada**. Una casilla pendiente de confirmación no significa que el propietario no la haya realizado: significa que no se ha verificado desde este trabajo. No guardar UID, correos o credenciales como evidencia aquí.

## Implementado

- [x] Constructor del inicio en `/dashboard/pages`, importación aislada del módulo Ingenix `a522753`, tema Flor de luna, bloques editables, ordenación y subidas firmadas reutilizadas.
- [x] API administrativa de borrador/publicación con revisión, validación de servidor y almacenamiento separado; reglas locales sin escritura directa.
- [x] Vista previa local sin reemplazar el inicio, sin Analytics ni indexación. La instantánea publicada todavía no tiene lector conectado al sitio.
- [ ] Aprobar presentación y conexiones del inicio antes de activar el constructor en la portada pública.
- [ ] Con autorización: desplegar reglas, verificar permisos IAM y probar edición/publicación/subidas en un entorno no productivo. No se modificó producción.

- [x] Sitio público, servicios, categorías, perfil de terapeuta y reservas por WhatsApp.
- [x] Dashboard de contenido y login con Firebase.
- [x] Descripciones de servicios con texto enriquecido básico y compatibilidad con texto anterior.
- [x] Blog con editor, borradores/publicación, archivos y slugs anteriores.
- [x] SEO de blog opcional, imagen social, alt, JSON-LD, sitemap y robots.
- [x] SEO local de inicio/servicios: Pachuca como ubicación, visitantes de CDMX/Edomex, canónicas corregidas y metadatos personalizados respetados.
- [x] Tarjetas del blog sin portada ficticia cuando no hay imagen.
- [x] Collage responsive en el detalle del blog, sin carrusel, con visor modal y zoom de 100 % a 300 %; videos separados con controles nativos.
- [x] Integración de GTM pública con consentimiento previo y eventos `page_view`, `whatsapp_click`, `blog_read`; configuración de GA4/etiquetas/publicación del contenedor aún requiere verificación externa.
- [x] Límite de videos de 150 MiB en Dropzone/helper; restricciones externas dependen del preset y plan.
- [x] Claim `admin: true` exigido en login, protección visual y APIs de archivos.
- [x] Subidas firmadas, borrado acotado, límites de solicitudes y validación de JSON.
- [x] Reglas de Firestore con escritura administrativa y lectura pública limitada.
- [x] Script de asignación/revocación de administradores con invalidación de sesiones.
- [x] Dependencias de runtime actualizadas y gRPC corregido mediante override.
- [x] Pruebas persistentes de APIs, diagnósticos seguros y reglas en emulador; ejecutarlas antes de publicar.
- [x] README, instrucciones, guías operativas y especificaciones centralizadas en `.opencode/`.

## Prioridad: activación externa pendiente de confirmar

- [ ] Configurar/publicar las etiquetas GTM y GA4 sin duplicar vistas automáticas; verificar consentimiento, navegación, lectura y eventos reales siguiendo [Métricas](docs/analytics.md).
- [ ] Revisar política de privacidad, textos de consentimiento, retención/configuración GA4 y obligaciones aplicables; la interfaz local no acredita cumplimiento legal completo.

- [ ] Confirmar que las tres cuentas indicadas tienen el claim booleano de administrador y pueden iniciar sesión de nuevo.
- [ ] Confirmar credenciales privadas de Firebase Admin en el entorno de destino y coincidencia de proyecto.
- [ ] Confirmar permisos de la cuenta de servicio para verificar usuarios y, si se usa el borrado de imágenes antiguas fuera de la carpeta, consultar sus referencias en Firestore. El contador ya no necesita Firestore.
- [ ] Desplegar o confirmar las reglas remotas correctas, después de revisar datos antiguos e índices necesarios.
- [ ] Confirmar ambos presets signed, sin sobrescritura, formatos restringidos y carpeta exclusiva; no asumir límite de bytes por preset.
- [ ] Desactivar o confirmar desactivación del preset unsigned anterior.
- [ ] Verificar con Cloudinary que el plan admite 150 MiB y rechaza archivos fuera de política.
- [ ] Confirmar variables de Vercel, Node 22+, dominio SEO, cloud name y número de WhatsApp.
- [ ] Completar las comprobaciones públicas, administrativas y de archivos de la [guía de despliegue](docs/deployment.md#verificación-posterior).

## Mejoras y revisión técnica

- [ ] Revisar próximas correcciones para los avisos de desarrollo de la cadena ESLint/fast-glob/micromatch/braces; no resolverlos con un downgrade incompatible automático.
- [ ] Ampliar pruebas de SEO al blog, slugs y renderizado de descripciones; ya existe `test:seo` para metadatos de inicio/servicios.
- [x] Corregir canónicas de servicios a `/{slug}`, consistentes con su ruta pública y sitemap.
- [ ] Tras desplegar el SEO local, inspeccionar HTML público, dominio final y sitemap en Search Console; revisar contenido personalizado del servicio tántrico con el propietario.
- [ ] Definir si hace falta limpieza explícita de archivos huérfanos y reservas de slug al eliminar contenido; no borrar recursos reales automáticamente sin una política acordada.
- [ ] Evaluar si hacen falta pruebas de interfaz y una verificación de límites reales de proveedor en un entorno de pruebas autorizado.

Estas mejoras están documentadas, no autorizadas automáticamente para implementación. No se ha solicitado gestión dinámica de usuarios: la decisión vigente es habilitar solo las tres cuentas indicadas.

## Registro de verificaciones

### Constructor de páginas — 26 de octubre de 2026

Rama de trabajo `feat/flor-de-luna-page-builder`; sin despliegue ni activación en la portada pública. Pasaron TypeScript, ESLint focalizado, build, 18 pruebas de módulo/API y 26 de seguridad/Analytics/SEO. En la verificación inicial también pasaron 7 pruebas de reglas en el emulador `demo-holistica-security`. El lint global reportó 69 errores y 12 avisos en archivos preexistentes no modificados por esta integración. Se revisaron el editor y la vista previa en navegador a 1280/500 px, con identidad ficticia y persistencia simulada. La revisión posterior de edición directa cubrió título guardado, foco al vaciarlo, pegado como texto plano y arrastre desde el catálogo mediante puntero y teclado, incluido el catálogo superpuesto a 500 px. No se usaron credenciales de usuarios para pruebas ni se hicieron subidas reales. Falta la integración interactiva con proveedores en un entorno no productivo; ver [especificación](specs/page-builder.md).

### SEO local de inicio y servicios — 21 de octubre de 2026

Se corrigieron canónicas y `og:url` de servicios a `/{slug}`, se añadieron metadatos propios del inicio y títulos de respaldo con Pachuca/Flor de luna, y se actualizó el contenido visible con ubicación real y público visitante de CDMX/Edomex. Los campos personalizados tienen prioridad; no se escribieron documentos Firebase ni configuraciones externas. Se verificaron build con TypeScript, ESLint focalizado, 7 pruebas SEO más 19 de Analytics/seguridad, y enlaces/comandos de documentación. Falta revisión visual móvil/escritorio y comprobación del HTML y Search Console tras desplegar. Detalles en [SEO local](docs/local-seo.md).

### GTM y eventos públicos — 21 de octubre de 2026

Se integró el contenedor indicado por el propietario mediante `next/script`, bloqueado hasta consentimiento. Se agregaron `page_view`, `whatsapp_click` y `blog_read`, sin enviar destino/mensaje de WhatsApp. Se documentaron etiquetas, parámetros y prevención de visitas duplicadas en [Métricas](docs/analytics.md). Verificados build con TypeScript, ESLint focalizado, 6 pruebas de Analytics sin red, 13 pruebas de seguridad y enlaces de documentación. No se modificó el contenedor remoto ni se comprobó Tag Assistant/DebugView en navegador; falta verificar publicación y eventos reales tras configurar GTM/GA4.

### Collage y zoom del blog — 21 de octubre de 2026

Se añadió `BlogGallery` al detalle público, sin modificar tarjetas, administración ni datos guardados. Headless UI existente gestiona el diálogo; no se añadieron dependencias. Build con TypeScript y ESLint focalizado correctos. Se comprobó el renderizado sin red con 0/1/2/3/5/10 imágenes, alt guardado y contenido de solo video. Falta comprobación visual e interacción real de zoom, foco, cierre y tamaños móviles en navegador (no disponible en esta sesión). Ver [especificación](specs/blog.md#galería-pública-del-artículo).

### Compatibilidad de Firebase Admin en Vercel

Se reportó un 500 por `ERR_REQUIRE_ESM` al cargar `firebase-admin/auth`, no por autorización. Se reprodujo localmente deshabilitando `require(ESM)` y se añadió un override limitado a `jwks-rsa → jose` 5.10.0, más una prueba real de carga/conversión de claves sin red. Falta confirmar el nuevo despliegue de Vercel y una subida real. La auditoría actual detectó además un aviso moderado independiente en `sanitize-html` <2.18.0; no forma parte de esta incompatibilidad y requiere revisión separada.

Verificación local: 13 pruebas de seguridad correctas, ESLint focalizado y build con TypeScript correctos. Auditoría: ningún aviso para el `jose` fijado; queda 1 aviso moderado de producción en `sanitize-html` y 5 altos de herramientas de desarrollo. No se aplicó `npm audit fix --force` ni se modificaron esas dependencias fuera del alcance de este arreglo.

### Cambio a contador local — 20 de octubre de 2026

Se sustituyó el contador persistente de Firestore por memoria: 20 solicitudes/minuto/UID/acción por proceso. Se mantienen token, revocación, claim y firmas. La incidencia reportada fue un 503 en `rate-limit` con código 7; se elimina esa dependencia de escritura, no los permisos del resto de Firestore. No se modifican IAM, reglas remotas, presets ni documentos antiguos. Falta confirmar una subida real autorizada con el cambio. Consulta [la guía de configuración](docs/secure-uploads-setup.md).

Verificación de este cambio: 12 pruebas de seguridad con proveedores simulados, ESLint focalizado, build con TypeScript y enlaces/anclas de documentación correctos. No se repitieron las pruebas de reglas (no se modificaron) ni una subida contra proveedores reales.

Al introducir las protecciones se completaron build, TypeScript, ESLint focalizado, las 15 pruebas de seguridad y una comprobación de servidor local (401 anónimo, cabeceras y noindex). La auditoría de producción reportó 0 vulnerabilidades y la completa 5 avisos en desarrollo. Son resultados históricos de esa revisión; repetir antes de una publicación y registrar cambios de estado sin asumir que siguen vigentes.

Para cada tarea externa que se confirme, anota fecha, entorno y tipo de comprobación, sin secretos. Una prueba local no debe marcar por sí sola una tarea de producción como completada.
