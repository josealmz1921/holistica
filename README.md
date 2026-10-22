# Flor de luna

Sitio de bienestar con catálogo de servicios, reservas por WhatsApp, blog y un dashboard para administrar servicios, categorías, entradas y el perfil de terapeuta.

## Tecnologías

- Next.js 16.4.1, React 19 y TypeScript.
- Tailwind CSS 4 y CSS Modules; tipografías EB Garamond y Manrope.
- Firebase Authentication, Firestore y Firebase Admin.
- Cloudinary para imágenes y videos con subidas firmadas.
- Editor.js para contenido enriquecido; Informed para formularios.

Consulta las versiones exactas en [`package.json`](package.json) y `package-lock.json`.

## Empezar

Requiere **Node.js 22 o posterior**, npm y acceso a los proyectos de Firebase y Cloudinary.

```sh
npm ci
```

Crea `.env.local` siguiendo la [guía de desarrollo y variables](.opencode/docs/development.md). Después:

```sh
npm run dev
```

- Sitio: `http://localhost:3000`.
- Acceso: `http://localhost:3000/login`.
- Administración: `http://localhost:3000/dashboard`.

**Tener una cuenta de Firebase no basta para administrar.** Cada cuenta autorizada necesita el claim `admin: true`. Consulta [Firebase y permisos](.opencode/docs/firebase.md) antes de configurar tus tres administradores.

## Documentación

| Guía | Contenido |
| --- | --- |
| [Arquitectura](.opencode/docs/architecture.md) | Estructura, rutas y flujos de datos |
| [Desarrollo](.opencode/docs/development.md) | Instalación, variables, comandos y pruebas |
| [Firebase](.opencode/docs/firebase.md) | Colecciones, usuarios, claims y explicación de `firestore.rules` |
| [Seguridad](.opencode/docs/security.md) | Activación de protecciones, alcance y limitaciones |
| [Cloudinary](.opencode/docs/cloudinary.md) | Presets firmados, archivos y límites |
| [Configuración de subidas seguras](.opencode/docs/secure-uploads-setup.md) | Credenciales, presets y diagnóstico de esta instalación |
| [Métricas: GTM y GA4](.opencode/docs/analytics.md) | Consentimiento, eventos y configuración del contenedor |
| [SEO local](.opencode/docs/local-seo.md) | Pachuca, público de CDMX/Edomex, canónicas y metadatos |
| [Despliegue](.opencode/docs/deployment.md) | Firebase, Vercel y comprobaciones en producción |
| [Especificación del dashboard](.opencode/specs/dashboard.md) | Comportamiento de servicios, categorías y terapeuta |
| [Especificación del blog](.opencode/specs/blog.md) | Editor, publicación, archivos y SEO |
| [Tareas y estado](.opencode/tasks.md) | Implementado y configuración pendiente de confirmar |

## Verificación rápida

```sh
npx tsc --noEmit
npm run test:security
npm run build
```

Las pruebas de reglas requieren un emulador; **no las ejecutes contra producción**. Instrucciones en [Desarrollo](.opencode/docs/development.md#pruebas-de-firestore).

## Antes de publicar

Configura los permisos de administrador, despliega las reglas de Firestore y configura los presets firmados de Cloudinary. **Guardar un archivo local no activa reglas ni permisos en Firebase.** Sigue la [guía de despliegue](.opencode/docs/deployment.md).

Nunca subas `.env.local`, claves de servicio ni tokens a Git. No se incluyen credenciales reales en esta documentación.

## Trabajo con asistentes

La documentación y las especificaciones viven en `.opencode/`. El [`AGENTS.md`](AGENTS.md) de la raíz se conserva como punto de entrada para que OpenCode descubra las instrucciones y lea [la guía completa](.opencode/AGENTS.md). `CLAUDE.md` mantiene su referencia a ese punto de entrada para otras herramientas; no contiene una segunda copia de las instrucciones.
