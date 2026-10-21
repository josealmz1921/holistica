# Flor de luna — Configuración de subidas seguras

## Estado y propósito

Guía de Firebase Admin y presets firmados de Cloudinary para este proyecto. El usuario reportó haber creado los presets. Una comprobación local anterior confirmó variables presentes, coincidencia de proyectos y formato válido de clave privada; eso no verifica permisos remotos ni una subida completa.

La incidencia reportada fue `503`, `stage: 'rate-limit'`, `code: 7`: el contador anterior no podía acceder a Firestore. Se cambió por un contador en memoria, como se acordó. **Todavía falta verificar una subida real con este cambio.** No se modificaron servicios remotos.

Para arquitectura, pruebas y despliegue: [arquitectura](architecture.md), [seguridad](security.md), [desarrollo](development.md) y [despliegue](deployment.md).

## 1. Credenciales Firebase Admin

Firebase Console → tu proyecto → Configuración del proyecto → Cuentas de servicio → SDK de Firebase Admin → Generar nueva clave privada.

Del JSON descargado:

- `project_id` → `FIREBASE_ADMIN_PROJECT_ID`, igual al proyecto de Firebase del navegador.
- `client_email` → `FIREBASE_ADMIN_CLIENT_EMAIL`.
- `private_key` → `FIREBASE_ADMIN_PRIVATE_KEY`, completa, entre comillas, conservando los saltos `\n`.

El servidor admite Application Default Credentials en entornos preparados para ello, incluido `GOOGLE_APPLICATION_CREDENTIALS` apuntando a un JSON privado fuera del repositorio.

**Nunca compartir el JSON, claves privadas ni tokens en chat, Git o `public/`. No usar `NEXT_PUBLIC_` para secretos.**

Aquí los administradores se autorizan con el claim booleano `admin: true`, no mediante una lista de UID copiada de otro proyecto. La decisión es habilitar las tres cuentas indicadas por el propietario; su asignación real debe confirmarse mediante el [procedimiento de Firebase](firebase.md#asignar-las-tres-cuentas).

## 2. Presets Cloudinary

Cloudinary Console → Settings → Upload → Upload presets. Nombres propuestos para esta instalación:

| Nombre | Signing mode | Overwrite | Allowed formats |
| --- | --- | --- | --- |
| `holistica_images_signed` | Signed | false | `jpg,png` |
| `holistica_videos_signed` | Signed | false | `mp4,webm` |

- El preset de imágenes se comparte entre servicios, terapeuta y blog; este proyecto no necesita tres presets como BienTasty.
- Copiar el **nombre**, no el ID/PID. Si elegiste otros nombres, utiliza esos en las variables.
- `Access mode: public` permite mostrar archivos; no habilita subidas unsigned.
- `Unique filename` no sustituye a `Overwrite=false`.
- La ubicación de controles varía según la consola. Verifica los formatos en la configuración del proveedor.
- El servidor fija preset, formatos permitidos, carpeta, ID aleatorio, timestamp y `overwrite: false` al firmar. **No consulta ni audita el preset remoto antes de cada firma**; esa validación adicional de BienTasty no se implementó aquí.
- Antes de desactivar el preset unsigned anterior, revisa sus consumidores. Mientras siga activo, existe riesgo de abuso directo fuera del sitio. No borres assets como parte de esa desactivación.

## 3. Variables y reinicio

Ejemplo sin credenciales reales para `.env.local`:

```dotenv
FIREBASE_ADMIN_PROJECT_ID=proyecto-de-ejemplo
FIREBASE_ADMIN_CLIENT_EMAIL=cuenta@proyecto-de-ejemplo.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nCLAVE_FICTICIA_NO_UTILIZABLE\n-----END PRIVATE KEY-----\n"
CLOUDINARY_IMAGE_UPLOAD_PRESET=holistica_images_signed
CLOUDINARY_VIDEO_UPLOAD_PRESET=holistica_videos_signed
CLOUDINARY_ASSET_FOLDER=holistica
```

También se requieren la configuración Firebase pública existente, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` y `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`: consulta la [lista completa](development.md#variables-de-entorno). No uses los nombres `CLOUDINARY_SIGNED_*` de BienTasty: este código no los lee.

Detén el servidor y vuelve a ejecutar `npm run dev` después de cambiar las variables. Usa Node 22+. En producción configura secretos en el hosting y redespliega; editar `.env.local` no configura Vercel.

## 4. Diagnóstico del error

El mensaje “La operación no está disponible. Revisa la configuración del servidor” es genérico. Revisa `/api/cloudinary/sign` en Network, sin compartir `Authorization`, y `Admin API failed:` en la terminal del servidor.

| Estado | Qué revisar |
| --- | --- |
| 401 | Token ausente, caducado, revocado o no verificable |
| 403 | Falta `admin: true`; en borrado, archivo fuera del alcance permitido |
| 429 | 20 solicitudes/minuto/UID/acción por proceso; esperar a vencer la ventana |
| 503 | Configuración incompleta, fallo inesperado de servidor/proveedor o capacidad del contador local agotada |

Etapas de diagnóstico: `authentication`, `rate-limit`, `request`, `configuration`, `signing`. El registro no contiene claves ni mensajes originales de proveedores.

El antiguo `rate-limit` con código 7 provenía de escribir en Firestore; el contador actual no usa Firestore. Si reaparece ese mismo registro, revisa que el servidor ejecute el código nuevo y reinícialo. No abras reglas ni otorgues roles amplios para ocultar el problema.

La firma se calcula localmente: una firma exitosa no acredita que el preset exista o que Cloudinary acepte el archivo. Si `/sign` funciona y la petición directa a Cloudinary falla, revisa la respuesta de Cloudinary y el preset, sin compartir secretos.

### 500 en Vercel: `ERR_REQUIRE_ESM` al cargar Firebase Admin

Se reportó un fallo de carga `firebase-admin/auth → jwks-rsa → jose` en Vercel. `jwks-rsa` 4.1.0 usa `require('jose')`, pero `jose` 6 es ESM. En runtimes sin soporte de `require(ESM)`, la función falla al cargar, antes del handler y de su respuesta JSON de diagnóstico. No es un error de credenciales, claims ni presets.

Se añadió un override de npm **solo para `jwks-rsa → jose`, fijando `jose` 5.10.0**, con entrada CommonJS. No se baja Firebase Admin ni se cambian permisos. Referencia del problema: [firebase-admin-node #3181](https://github.com/firebase/firebase-admin-node/issues/3181). Revisa el override cuando upstream publique una corrección compatible; no lo retires sin repetir la prueba de runtime.

`npm run test:security` incluye una prueba con las dependencias reales y Node `--no-experimental-require-module`: carga Firebase Admin y convierte una clave pública local mediante `jwks-rsa`, sin conexiones externas ni credenciales. Un build correcto por sí solo no detectaba este fallo de runtime.

Para publicar la corrección deben llegar **`package.json` y `package-lock.json` juntos** al nuevo despliegue. Si persiste en Vercel, comprueba el commit activo y redespliega sin reutilizar la caché de build. Falta confirmar esta corrección en el entorno remoto.

## 5. Límites y decisiones

- Se verifica token y revocación con Firebase Admin, y claim booleano de administrador.
- Subida directa firmada, no proxy de archivos por Next.js.
- Límite local: **20 solicitudes/minuto/UID/acción por proceso**, para firmas y eliminaciones en contadores separados. Ventana de 60 segundos desde la primera solicitud.
- El contador se reinicia con el proceso/recarga del módulo. Varias instancias no comparten estado; para un límite distribuido habría que añadir otra solución explícitamente.
- Se limpian contadores vencidos; hasta 10000 claves activas, con rechazo 503 al alcanzar capacidad para una clave nueva.
- No se crean ni actualizan documentos `_adminRateLimits`. Los documentos antiguos no se borraron automáticamente.
- Firestore sigue almacenando contenido. La eliminación de imágenes antiguas fuera de la carpeta del sitio consulta allí sus referencias y puede requerir permisos de lectura del servidor.
- Límites de UX: imágenes normales 250 KiB; blog 5 MiB; videos blog 150 MiB; imágenes hasta 1200 × 1200 px. No se redujo el límite de video a los 50 MB de BienTasty.
- **Cloudinary no ofrece un límite propio de bytes por preset.** No tratar `max_file_size` como garantía. Un administrador puede omitir los controles cliente con peticiones directas, sujeto a las restricciones de formatos firmados y límites generales de cuenta/proveedor. Las firmas no garantizan tamaño ni dimensiones reales.
- No se desactivan comprobaciones de sesión ni se introduce un fallback unsigned.

## Pendientes de activación

- [ ] Confirmar Signed, overwrite=false y formatos de ambos presets en Cloudinary.
- [ ] Probar subida y guardado de una imagen real autorizada con el nuevo contador.
- [ ] Revisar blog/video y las tres sesiones administrativas.
- [ ] Confirmar límites reales de cuenta para videos de 150 MiB.
- [ ] Configurar secretos y presets del hosting antes de desplegar.
- [ ] Confirmar reglas restrictivas publicadas y respaldo; el archivo local no acredita despliegue.
- [ ] Revisar consumidores y desactivar expresamente el preset unsigned anterior, sin borrar assets.

Las pruebas locales no contactan Cloudinary ni Firebase reales. Consultar [tareas](../tasks.md) para estado de verificaciones, sin copiar UID ni credenciales como evidencia.
