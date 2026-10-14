# Firebase: usuarios, permisos y reglas

[Índice del proyecto](../../README.md) · [Seguridad](security.md) · [Variables](development.md#variables-de-entorno)

## Tres piezas distintas

1. **Firebase Authentication** identifica al usuario: correo, contraseña, UID y sesión.
2. **Cloud Firestore** almacena documentos de contenido, no los archivos de imágenes/videos.
3. **Firestore Security Rules** deciden qué operaciones del SDK cliente se permiten y qué datos aceptan.

**Firebase Admin** es otro SDK, reservado para el servidor y scripts de confianza. Puede verificar tokens, cambiar permisos y acceder a Firestore con credenciales de servicio. Su acceso no está sujeto a las reglas del SDK cliente: por eso las APIs deben comprobar la identidad antes de usarlo.

## Usuarios y administradores

Un **UID** es el identificador de una cuenta en Authentication; no es su correo ni el ID de un documento de servicios. Un **custom claim** es un dato de autorización que Firebase incluye en el token de identidad del usuario.

Este proyecto utiliza:

```json
{ "admin": true }
```

Debe ser el booleano `true`, no el texto `"true"`. No es un campo editable en un formulario del dashboard ni un documento `users/{uid}`. Crear una cuenta no le asigna ese permiso.

La decisión actual es autorizar **solo las tres cuentas existentes que indique el propietario**. El código permite más administradores si se asignan expresamente en el futuro; no existe una lista fija de tres UID ni una pantalla de gestión de permisos. La asignación real de esas tres cuentas debe confirmarse en Firebase, no deducirse de los archivos locales.

### Dónde encontrar cada dato

- **UID:** Firebase Console → Authentication → Users → cuenta correspondiente.
- **Configuración web:** Configuración del proyecto → General → Tus apps → aplicación web.
- **Credenciales privadas:** engranaje junto a Descripción general del proyecto → Configuración del proyecto → Cuentas de servicio → SDK de Firebase Admin → Generar nueva clave privada.

El último paso descarga un JSON. Usa sus campos `project_id`, `client_email` y `private_key` en las variables privadas descritas en [Desarrollo](development.md#privadas-solo-servidor-o-scripts-de-confianza). No subas el JSON a Git ni lo compartas en chats. Si la creación de claves está bloqueada, revisa los permisos de tu cuenta y la política de la organización; no abras permisos de la base para solucionarlo.

### Asignar las tres cuentas

Con Node 22+, credenciales configuradas y el proyecto correcto, ejecuta desde la raíz:

```sh
node --env-file-if-exists=.env.local scripts/set-admin.mjs --uid UID_USUARIO_1 --grant
node --env-file-if-exists=.env.local scripts/set-admin.mjs --uid UID_USUARIO_2 --grant
node --env-file-if-exists=.env.local scripts/set-admin.mjs --uid UID_USUARIO_3 --grant
```

Estos UID son marcadores ficticios. **El comando modifica directamente las cuentas de Authentication del proyecto configurado.** No lo ejecutes como una prueba ni cambies el proyecto por ensayo/error.

El script conserva otros claims, asigna `admin: true` e invalida las sesiones anteriores. Cada usuario debe cerrar sesión y volver a entrar para obtener un token nuevo. No modifica documentos del sitio ni despliega reglas.

Para quitar el permiso de una cuenta:

```sh
node --env-file-if-exists=.env.local scripts/set-admin.mjs --uid UID_A_REVOCAR --revoke
```

No hay protección automática del “último administrador” en este script. Revisa el UID antes de ejecutarlo y conserva una cuenta autorizada para operar. Los cambios deben hacerse únicamente con autorización del propietario.

## Modelo de datos

| Colección/documento | Datos principales | Lectura con las reglas actuales |
| --- | --- | --- |
| `services/{id}` | Nombre, slug, categoría, duración, descripción, galería, beneficios, recorrido, estado y SEO | Público si `active == true`; cualquier servicio para admin |
| `categories/{id}` | Nombre, slug, estado y fechas | Pública, incluidas categorías inactivas; es taxonomía del sitio |
| `blog/{id}` | Título, slug, resumen, bloques, media, estado, SEO y fechas | Público si `published == true`; borradores para admin |
| `blogSlugs/{slug}` | `postId`, para reservar slugs | Solo admin |
| `content/therapist` | Nombre, especialidad, presentación y foto | Pública |
| `_adminRateLimits/{hash}` | Contadores de solicitudes de archivos | Denegada a clientes, incluso admin; la usa el SDK Admin del servidor |
| Otras rutas | No forman parte del modelo permitido | Denegada por defecto |

Las operaciones de escritura de contenido requieren administrador y validación de datos. No guardes datos privados en las categorías o el perfil, porque sus documentos son públicos.

Los modelos de referencia están en `src/firebase/getServices.ts`, `categories.ts`, `blog.ts` y `therapist.ts`. Las imágenes y videos se guardan en Cloudinary; Firestore guarda sus URLs, identificadores y metadatos.

## Qué es `firestore.rules`

[`firestore.rules`](../../firestore.rules) es la política de seguridad de la base, no un componente de React. Firebase la evalúa en cada petición del SDK cliente cuando la política está desplegada.

```js
match /services/{id} {
  allow read: if admin() || resource.data.active == true;
  allow delete: if admin();
}
```

Este fragmento simplificado de las reglas significa:

- `match`: aplica la política a esa ruta de documentos; `{id}` representa cualquier ID.
- `allow read`: permite consultar servicios públicos o cualquier servicio si eres admin.
- `allow delete`: solo un admin puede borrar.
- `resource.data`: datos ya guardados en el documento.
- `request.resource.data`: documento completo tal como quedaría después de crear o actualizar, no solo los campos modificados.
- `request.auth`: identidad autenticada que Firebase verificó; es `null` si no hay sesión.
- `request.time`: hora de la solicitud que se usa para comprobar `serverTimestamp()`.

La función `admin()` comprueba que hay sesión y que `request.auth.token.admin` es exactamente `true`. Ese valor es el claim asignado con el script; modificar el JavaScript del navegador no permite falsificar un token firmado de Firebase.

### Matriz de permisos

| Operación | Visitante / usuario normal | Administrador |
| --- | --- | --- |
| Leer servicio activo o blog publicado | Sí | Sí |
| Leer servicio inactivo o borrador | No | Sí |
| Leer categorías y perfil público | Sí | Sí |
| Crear, modificar o borrar contenido | No | Sí, si cumple validaciones |
| Leer/escribir rutas desconocidas | No | No desde el SDK cliente |
| Modificar permisos de Authentication | No | No desde el dashboard; requiere credenciales de confianza |

### Validación de contenido

Además del permiso, las reglas comprueban tipos, tamaños y fechas. Algunos límites importantes:

- Servicios: nombre/slug hasta 160 caracteres; descripción hasta 30000; duración mayor que 0 y hasta 1440 minutos; galería hasta 30; beneficios y recorrido hasta 50 cada uno.
- Blog: título hasta 160; slug hasta 120 con letras minúsculas, números y guiones; resumen hasta 400; bloques hasta 500; media hasta 10; SEO de 70/160 caracteres.
- Categorías: nombre/slug no vacíos, hasta 160 caracteres, y estado booleano.
- Terapeuta: nombre hasta 160, especialidad hasta 300 y descripción hasta 3000.
- `updatedAt` debe ser un timestamp de servidor. Al crear servicios, categorías y blog, `createdAt` debe ser el momento de la solicitud; si ya existe, no se puede cambiar. La primera fecha de publicación existente tampoco se puede reescribir.

No son una validación exhaustiva de cada objeto anidado o del contenido binario de archivos. El frontend y los presets de Cloudinary tienen controles complementarios. Ante un rechazo, revisa [`firestore.rules`](../../firestore.rules), que es la fuente exacta de las condiciones.

### Las reglas no filtran consultas

Una consulta pública de **todos** los servicios no devuelve solo los permitidos: Firebase puede rechazar toda la consulta porque podría incluir privados. Por eso el sitio utiliza `where("active", "==", true)` y el blog `where("published", "==", true)`.

Si Firebase solicita un índice, revisa y crea el que corresponda a la consulta. No sustituyas la regla por `allow read, write: if true`.

## Activación y pruebas

Editar `firestore.rules` solo cambia el archivo local. Debes probarlo en el [emulador](development.md#pruebas-de-firestore) y después desplegarlo explícitamente al proyecto correcto siguiendo [Despliegue](deployment.md#desplegar-reglas-de-firestore).

`set-admin.mjs`, el despliegue de reglas y el despliegue de Next.js son **tres operaciones distintas**. Las reglas de Firestore no protegen Cloudinary ni reemplazan la autorización de las APIs.
