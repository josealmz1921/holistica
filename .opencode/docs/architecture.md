# Arquitectura

[Índice del proyecto](../../README.md) · [Desarrollo](development.md)

## Qué hace el sistema

Flor de luna tiene dos áreas: el sitio público de bienestar y un dashboard de contenido. Las reservas se solicitan mediante enlaces a WhatsApp; no hay en este repositorio un sistema de pagos ni un calendario de reservas persistido.

| Área | Responsabilidad |
| --- | --- |
| Next.js App Router | Páginas públicas, metadatos, layouts y APIs de archivos |
| React / CSS Modules / Tailwind | Interfaz pública y de administración |
| Firebase Authentication | Inicio/cierre de sesión y tokens de identidad |
| Firestore | Servicios, categorías, blog y perfil de terapeuta |
| Firebase Admin | Verificación de tokens/revocación y operaciones internas de las APIs |
| Cloudinary | Almacenamiento y entrega de imágenes/videos |
| Editor.js | Contenido estructurado de blog y descripción enriquecida de servicios |
| Google Tag Manager / GA4 | Medición pública tras consentimiento; eventos de páginas, WhatsApp y lectura estimada. Configuración remota en [Métricas](analytics.md) |

## Mapa de directorios

```text
app/
  (site)/                 Sitio público y blog
  (admin)/dashboard/      Administración de contenido
  login/                  Acceso por correo y contraseña
  api/cloudinary/         Firma de subidas y eliminación de imágenes
  sitemap.ts              URLs públicas para buscadores
  robots.ts               Directivas para rastreadores
src/
  components/             Componentes de interfaz y editores
  firebase/               SDK cliente y acceso a colecciones
  server/                 Firebase Admin, autorización y límites de API
  cloudinary/             Configuración privada y cliente de eliminación
  hooks/                  Protección visual del dashboard
  utilities/              Subidas, slugs, SEO y validaciones
scripts/set-admin.mjs     Asignación/revocación de permisos con credenciales privadas
tests/                    Pruebas de APIs y reglas
firestore.rules           Política de acceso y validación de Firestore
firebase.json             Ubicación de reglas y configuración del emulador
.opencode/                Documentación, instrucciones, specs y tareas
```

Los grupos `(site)` y `(admin)` organizan layouts; sus nombres no aparecen en las URLs. Existen layouts raíz separados para sitio, administración y login.

## Rutas

| Ruta | Uso |
| --- | --- |
| `/` | Presentación, servicios y contenido destacado |
| `/{slug}` | Detalle de un servicio activo; no es `/services/{slug}` |
| `/blog` | Entradas publicadas |
| `/blog/{slug}` | Artículo publicado y redirección de slugs anteriores |
| `/login` | Inicio de sesión |
| `/dashboard` | Accesos a secciones administrativas |
| `/dashboard/services` | Listado de servicios |
| `/dashboard/services/{slug}?id={id}` | Formulario de servicio; al editar, el hook carga el documento por el parámetro `id` |
| `/dashboard/categories?edit={id}` | Gestión de categorías y diálogo de edición |
| `/dashboard/therapist` | Perfil público de terapeuta |
| `/dashboard/blog` | Entradas administrativas, incluidos borradores |
| `/dashboard/blog/new`, `/dashboard/blog/{id}` | Creación y edición por ID de Firestore |
| `/dashboard/pages` | Listado de páginas; esta versión administra únicamente el inicio |
| `/dashboard/pages/home` | Constructor de los bloques iniciales y SEO del inicio; solo lo publicado se muestra en `/` |
| `/builder-preview` | Vista previa local para administradores, sin Analytics ni indexación |
| `/api/admin/pages/home` | Lectura/guardado/publicación de bloques, con verificación de administrador |
| `/api/cloudinary/sign` | POST autenticado para autorizar una subida |
| `/api/cloudinary/delete` | DELETE autenticado para eliminar una imagen permitida |

## Flujos de datos

### Leer el sitio

Las páginas y componentes públicos consultan Firestore con el SDK cliente, también cuando se ejecutan en el servidor de Next.js. No tienen por ello privilegios de administrador. Las consultas públicas usan `active == true` o `published == true`; las reglas deben autorizar esa lectura. Categorías y `content/therapist` son públicos por diseño.

Excepción acotada: el inicio lee exclusivamente `pagePublished/home` con un módulo `server-only` y Firebase Admin. Valida esa instantánea antes de mostrarla; nunca consulta borradores. Conserva las secciones públicas actuales debajo del contenido editable y vuelve al Hero/SEO originales si no hay publicación válida. Operación y reversión mediante `PAGE_BUILDER_HOME_DISABLED` en [Constructor de páginas](../specs/page-builder.md#integración-con-el-inicio).

### Editar contenido

El navegador inicia sesión en Firebase y comprueba `admin: true`. Los formularios escriben directamente en Firestore usando esa identidad. Las reglas desplegadas son la barrera efectiva: ocultar botones o bloquear rutas en React no protege por sí solo la base.

### Subir y eliminar archivos

El navegador solicita una firma a Next.js enviando un token de Firebase. El servidor verifica sesión, revocación y claim; aplica un límite de peticiones y firma parámetros controlados. El archivo viaja directamente del navegador a Cloudinary, no a través del cuerpo de la API de Next.js. El formulario guarda después la referencia del archivo en Firestore.

La eliminación usa otra API autenticada y valida el alcance del identificador. Consulta [Cloudinary](cloudinary.md).

## Límites arquitectónicos

- Firestore y Cloudinary no comparten una transacción. Una subida puede completarse aunque falle el guardado del documento.
- El SDK Admin evita las reglas de Firestore; solo debe usarse tras autorización de servidor.
- La carga de categorías del dashboard ocurre actualmente en un Server Component y utiliza una colección de lectura pública. Si se hace privada esa colección, habrá que cambiar ese flujo.
- El sitemap depende del dominio configurado y de consultas válidas a Firebase.
- Las specs describen el comportamiento actual; los pendientes se registran en [tasks.md](../tasks.md).
