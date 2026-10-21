# Seguridad y activación de protecciones

[Índice del proyecto](../../README.md) · [Firebase](firebase.md) · [Despliegue](deployment.md)

Los cambios fallan de forma segura: sin permiso `admin: true`, el dashboard y las APIs de archivos rechazan el acceso. Las reglas locales **no protegen Firestore hasta que se despliegan**. No se han cambiado usuarios, reglas remotas ni presets automáticamente.

## 1. Servidor (Node.js 22 o posterior)

Configura en `.env.local` y en el despliegue las [variables públicas y privadas](development.md#variables-de-entorno). La guía distingue configuración web de Firebase de las credenciales del SDK Admin, y contiene únicamente ejemplos ficticios.

La cuenta de servicio debe pertenecer al mismo proyecto que Firebase del navegador. También se admite Application Default Credentials en entornos Google. Nunca uses prefijos `NEXT_PUBLIC_` para secretos ni subas claves al repositorio. La firma necesita verificar usuarios, no escribir contadores en Firestore. La eliminación de imágenes antiguas fuera de la carpeta del sitio sí consulta referencias en Firestore; aplica privilegio mínimo según las operaciones necesarias.

## 2. Asignar tu administrador

Sigue el procedimiento de [asignación de las tres cuentas](firebase.md#asignar-las-tres-cuentas). El script conserva otros claims e invalida las sesiones anteriores: cierra sesión y vuelve a entrar. No existe un endpoint público para asignar administradores. No habilites registro público si no lo necesitas; una cuenta registrada por sí sola no obtiene permisos de administración.

## 3. Reglas de Firestore

Revisa las colecciones y límites de [`firestore.rules`](../../firestore.rules), pruébalos en un emulador y [despliega explícitamente al proyecto correcto](deployment.md#desplegar-reglas-de-firestore). Consulta la [explicación de las reglas](firebase.md#qué-es-firestorerules).

Las escrituras requieren el claim de administrador. Servicios inactivos y entradas no publicadas solo se leen como administrador. Categorías y el perfil público de terapeuta son públicos por diseño. El resto de colecciones se deniega a clientes. El SDK Admin del servidor evita estas reglas; las APIs verifican sesión, revocación y rol antes de usarlo.

El sitio consulta servicios activos y entradas publicadas. Si Firebase solicita índices compuestos para consultas por slug/estado, crea los índices indicados. Revisa documentos antiguos que no cumplan los límites antes de editar; no se migran ni se publican automáticamente.

## 4. Cloudinary (imprescindible)

En la consola crea **dos presets de subida firmada**, nunca unsigned, siguiendo la [guía de Cloudinary](cloudinary.md#configurar-presets-firmados). Configura formatos, evita sobrescritura y utiliza una carpeta exclusiva del sitio. Los límites de bytes/dimensiones del cliente no son una garantía del preset.

**Desactiva o elimina el preset unsigned anterior** en Cloudinary. Quitar una variable del código no invalida un preset ya publicado. Verifica con archivos reales antes de habilitarlo en producción: los límites del navegador no son controles de seguridad.

Los archivos nuevos usan IDs aleatorios en la carpeta controlada. Las eliminaciones requieren administrador y admiten solo esa carpeta o imágenes antiguas referenciadas por servicios/blog/perfil. Las firmas y eliminaciones tienen límites en memoria de 20 solicitudes/minuto por administrador y acción, por proceso, no compartidos entre instancias. Una firma puede reutilizarse durante su ventana de validez; el ID fijo y `overwrite: false` evitan sobrescribir contenido.

## 5. Dependencias y comprobación

Next y sus herramientas se actualizaron a una versión corregida. Firebase se actualizó dentro de la rama 12, y gRPC se fija a una versión 1.x corregida mediante `overrides`; el SDK Admin requiere Node 22. Ejecuta `npm audit --omit=dev` tras futuras actualizaciones. No uses `npm audit fix --force` sin revisar cambios incompatibles.

Verificación local realizada: build, TypeScript, ESLint focalizado en las APIs y módulos de seguridad, 9 pruebas de APIs y 6 pruebas de reglas en el emulador. También se comprobó un servidor de producción local: las APIs anónimas responden 401/no-store, se aplican las cabeceras de seguridad y login/dashboard incluyen noindex. `npm audit --omit=dev` no reporta vulnerabilidades. La auditoría completa conserva 5 avisos de desarrollo en la cadena `eslint-config-next → fast-glob → micromatch → braces`; npm propone retroceder a Next ESLint 14, por lo que no se aplica esa solución incompatible. Mantén estas herramientas fuera del servidor público y revisa futuras correcciones.

Estos resultados corresponden a la verificación local al introducir las protecciones, no certifican una instalación remota ni garantizan que la auditoría futura tenga el mismo resultado. Consulta los [comandos de desarrollo y pruebas](development.md#comandos) para repetirlos.

Antes de desplegar, comprueba:

1. Sin sesión: APIs de archivos devuelven 401 y no contactan Cloudinary.
2. Usuario normal: dashboard denegado, APIs 403 y escrituras Firestore denegadas.
3. Administrador: CRUD y archivos funcionan; archivos ajenos se rechazan.
4. Visitante: sitio público funciona, borradores y servicios inactivos no son accesibles.
5. Token caducado/revocado: API lo rechaza; cuenta sin claim no puede subir ni borrar.
6. Presets antiguos desactivados tras revisar sus consumidores, formatos restringidos y límites reales de la cuenta comprobados; no asumir límites de bytes por preset.

Los metadatos `noindex` y `robots.txt` no sustituyen a la autorización. Nunca expongas `next dev` como servidor de producción.

## Controles de las APIs

`src/server/adminApi.ts` comprueba el token Bearer mediante `verifyIdToken(token, true)`, incluida la revocación, y exige el claim booleano de administrador. El servidor valida JSON antes de operar y limita su cuerpo a 16 KiB. Las respuestas incluyen `Cache-Control: no-store` y no devuelven secretos ni trazas internas.

| Estado HTTP | Significado |
| --- | --- |
| 400 | JSON, identificador o tipo de recurso inválido |
| 401 | Falta sesión o el token no supera la verificación |
| 403 | Falta permiso de administrador o el archivo no pertenece al sitio |
| 413 | Cuerpo JSON demasiado grande |
| 415 | Tipo de contenido distinto de `application/json` |
| 429 | Límite de solicitudes excedido |
| 503 | Error interno, servicio externo no disponible o configuración incompleta |

No añadas un endpoint público para otorgar claims ni aceptes parámetros arbitrarios para firmar subidas. Los contadores locales protegen por UID/acción solo dentro de cada proceso y se reinician con él; no proporcionan una defensa global por IP ni distribuida. Para errores inesperados de firma se registra una etapa controlada y, si existe, un código reconocido de Firebase/gRPC; no se registran mensajes originales ni credenciales. Consulta el [diagnóstico de 503](development.md#diagnosticar-un-503-al-autorizar-subidas).

## HTML y cabeceras

- Las descripciones enriquecidas y el blog sanitizan HTML con listas explícitas de etiquetas/atributos.
- El JSON-LD escapa `<` para no permitir cerrar el elemento `script` con texto administrable.
- `next.config.ts` configura `nosniff`, rechazo de iframes, política de referencias y restricciones de cámara/micrófono/geolocalización.
- La CSP actual limita `frame-ancestors`, `base-uri` y `object-src`; **no es una política completa de scripts**.
- Las imágenes externas se restringen a la cuenta configurada de Cloudinary.

Los cambios de contraseña, MFA, políticas de registro, dominios autorizados de Firebase y restricciones del proveedor se gestionan fuera del repositorio. Revisa su configuración; no se presumen activados.
