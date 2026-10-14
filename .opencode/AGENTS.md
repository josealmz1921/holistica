# Guía de trabajo — Flor de luna

## Alcance y fuentes de verdad

- Lee primero el [README](../README.md) y la [arquitectura](docs/architecture.md).
- El código, `package.json`, `package-lock.json` y `firestore.rules` determinan el comportamiento real. No presentes una propuesta como funcionalidad existente.
- Documentación de operación: `docs/`. Comportamiento funcional: `specs/`. Pendientes y verificaciones externas: [tasks.md](tasks.md).
- Conserva el aviso de Next.js en el `AGENTS.md` raíz. Antes de escribir código Next.js, lee la guía relevante de la versión instalada en `node_modules/next/dist/docs/`; no supongas APIs de otras versiones.
- Mantén el `AGENTS.md` raíz como entrada explícita a esta guía. No dependas de que los Markdown de `.opencode/` se carguen automáticamente ni de un campo de configuración `instructions`.

## Convenciones

- Documentación e interfaz en español. Conserva las convenciones de nombres y estructura del código vecino.
- Usa TypeScript, componentes de React y CSS Modules/Tailwind ya presentes. No añadas otra biblioteca si la existente resuelve el problema.
- Conserva la separación entre componentes públicos, dashboard, SDK cliente de Firebase y módulos `server-only`.
- Comprueba `git status` antes de editar. No sobrescribas, reviertas ni incluyas en commits trabajo ajeno sin revisar su alcance.
- No crees commits ni hagas push si el usuario no lo pide. Los despliegues y cambios remotos requieren autorización explícita.

## Seguridad obligatoria

- Una sesión no equivale a autorización: el dashboard y las APIs administrativas requieren el claim booleano `admin: true`.
- No habilites permisos automáticamente para usuarios nuevos. La decisión actual es autorizar individualmente tres cuentas; no hay gestión de roles desde la interfaz.
- Nunca copies `.env.local`, JSON de cuentas de servicio, claves privadas, tokens o credenciales reales a documentación, ejemplos, pruebas o commits.
- No ejecutes `scripts/set-admin.mjs`, despliegues de reglas ni operaciones sobre Cloudinary real como parte de pruebas locales.
- El SDK Admin evita las reglas de Firestore. Verifica identidad y permisos antes de usarlo en una API accesible desde el navegador.
- No sustituyas firmas de Cloudinary por presets unsigned ni trates validaciones de Dropzone como seguridad del servidor.
- Conserva la sanitización del HTML del blog/descripciones y el escape de JSON-LD. No renderices contenido administrable como HTML sin sanearlo.
- No habilites lectura pública de borradores o servicios inactivos para resolver un error de consulta: ajusta filtros, índices o permisos.

## Verificación según el cambio

- TypeScript: `npx tsc --noEmit`.
- Lint: `npm run lint` o ESLint focalizado en los archivos modificados; distingue errores nuevos de problemas preexistentes.
- Seguridad de APIs: `npm run test:security` (servicios externos simulados).
- Reglas: ejecuta `npm run test:rules` dentro de un emulador con el proyecto `demo-holistica-security`; consulta [desarrollo](docs/development.md#pruebas-de-firestore).
- Next.js, dependencias o configuración de despliegue: `npm run build`.
- Dependencias: `npm audit --omit=dev`; revisa también la auditoría completa. No uses `npm audit fix --force` sin evaluar cambios incompatibles.
- Documentación: valida enlaces relativos, comandos contra los scripts existentes y que los ejemplos no contengan secretos.
- Comunica qué verificaste y qué quedó pendiente. Una prueba local no confirma la configuración de Firebase, Cloudinary ni Vercel.

## Mantenimiento de documentación

- Si cambian permisos, modelos, variables, límites, rutas o procedimientos de despliegue, actualiza su guía y especificación.
- Enlaza una explicación central en vez de mantener varias copias contradictorias. El README es el índice, no un manual duplicado.
- En `tasks.md`, separa implementación en el repositorio de activación externa confirmada. No marques usuarios, reglas o presets como configurados sin evidencia.
- No incluyas correos, UID reales ni identificadores de proyectos privados en ejemplos; utiliza marcadores ficticios.
