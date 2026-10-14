# Desarrollo local

[Índice del proyecto](../../README.md) · [Despliegue](deployment.md)

## Requisitos e instalación

Usa Node.js **22 o posterior** y npm. `package-lock.json` fija las versiones instaladas; no mezcles gestores de paquetes para este proyecto.

```sh
npm ci
```

Crea `.env.local` en la raíz. Next.js lo carga automáticamente; un script de Node necesita `--env-file-if-exists=.env.local` si quieres cargar ese archivo. Reinicia el servidor tras modificar variables.

**El desarrollo normal usa el Firebase configurado en esas variables.** No hay un entorno de pruebas de datos conectado automáticamente a `npm run dev`. Para editar contenido durante desarrollo, usa preferentemente un proyecto de pruebas; las pruebas de reglas sí utilizan un emulador aislado.

## Variables de entorno

Los nombres siguientes coinciden con el código. Los valores se obtienen de las consolas de los servicios, nunca de esta documentación.

### Públicas: incluidas en el navegador

| Variable | Uso |
| --- | --- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Configuración de la aplicación web de Firebase; no es una clave privada de servicio |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Dominio de Firebase Authentication |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Proyecto de Firestore/Authentication |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Configuración web de Firebase; los archivos de esta app se suben a Cloudinary |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Configuración web de Firebase |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | ID de la aplicación web |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID_` | Campo opcional `measurementId`; el código actual incluye un guion bajo final en el nombre de la variable |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cuenta de Cloudinary y dominio permitido para imágenes |
| `NEXT_PUBLIC_SITE_URL` | Dominio público absoluto para canónicas, metadatos y sitemap |
| `NEXT_PUBLIC_PHONE_NUMBER` | Número internacional de WhatsApp, con código de país y solo dígitos |

Obtén la configuración web en Firebase → Configuración del proyecto → General → Tus apps → aplicación web. No confundas estos valores con las credenciales del SDK Admin.

### Privadas: solo servidor o scripts de confianza

| Variable | Uso |
| --- | --- |
| `FIREBASE_ADMIN_PROJECT_ID` | Proyecto del SDK Admin; si falta, usa el ID público. Ambos deben coincidir si se definen |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | `client_email` del JSON de cuenta de servicio |
| `FIREBASE_ADMIN_PRIVATE_KEY` | `private_key` del JSON, con comillas y saltos `\n` |
| `CLOUDINARY_API_KEY` | Identificador del API de la cuenta; se configura privadamente, aunque se devuelve al cliente para una subida firmada |
| `CLOUDINARY_API_SECRET` | Secreto de firma y eliminación; nunca debe llegar al navegador |
| `CLOUDINARY_IMAGE_UPLOAD_PRESET` | Preset firmado de imágenes |
| `CLOUDINARY_VIDEO_UPLOAD_PRESET` | Preset firmado de videos |
| `CLOUDINARY_ASSET_FOLDER` | Carpeta exclusiva del sitio; por defecto `holistica` |

Email y clave privada de Firebase Admin se definen juntos. Si no se definen, el servidor intenta usar Application Default Credentials; en Vercel normalmente deberás configurar las credenciales privadas explícitamente.

Ejemplo **ficticio**, para mostrar el formato. Sustituye todos los valores por los de tu entorno:

```dotenv
NEXT_PUBLIC_FIREBASE_API_KEY=valor-web-ficticio
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=proyecto-de-ejemplo.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=proyecto-de-ejemplo
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=proyecto-de-ejemplo.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=000000000000
NEXT_PUBLIC_FIREBASE_APP_ID=app-id-ficticio
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID_=G-EJEMPLO
NEXT_PUBLIC_SITE_URL=https://example.com
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=cuenta-de-ejemplo
NEXT_PUBLIC_PHONE_NUMBER=520000000000
FIREBASE_ADMIN_PROJECT_ID=proyecto-de-ejemplo
FIREBASE_ADMIN_CLIENT_EMAIL=cuenta@proyecto-de-ejemplo.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nCLAVE_FICTICIA_NO_UTILIZABLE\n-----END PRIVATE KEY-----\n"
CLOUDINARY_API_KEY=valor-ficticio
CLOUDINARY_API_SECRET=valor-ficticio
CLOUDINARY_IMAGE_UPLOAD_PRESET=imagenes-firmadas
CLOUDINARY_VIDEO_UPLOAD_PRESET=videos-firmados
CLOUDINARY_ASSET_FOLDER=holistica
```

La variable de medición es opcional. `.env*` está ignorado por Git. Guarda cualquier JSON descargado fuera del repositorio: el `.gitignore` no protege automáticamente todos los archivos `.json`.

`NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` pertenecía al flujo unsigned anterior y ya no se utiliza. No vuelvas a introducirlo; consulta [Cloudinary](cloudinary.md).

## Comandos

| Comando | Propósito |
| --- | --- |
| `npm run dev` | Servidor local con recarga |
| `npm run build` | Compilación de producción y revisión de TypeScript |
| `npm start` | Servir la compilación de producción existente |
| `npm run lint` | ESLint sobre el proyecto |
| `npx tsc --noEmit` | Comprobar tipos sin generar código |
| `npm run test:security` | Pruebas de autorización y APIs con servicios simulados |
| `npm run test:rules` | Pruebas de Firestore; requiere emulador activo |
| `npm audit --omit=dev` | Auditoría de dependencias de producción |

Todos se ejecutan desde la raíz. No existe actualmente un script genérico `npm test` ni un comando específico de tests de SEO.

## Pruebas de Firestore

Nunca uses el proyecto real para estas pruebas. La suite exige `FIRESTORE_EMULATOR_HOST` y emplea `demo-holistica-security`; el emulador proporciona esa variable al ejecutar:

```sh
npx firebase-tools emulators:exec --only firestore --project demo-holistica-security "npm run test:rules"
```

La configuración está en `firebase.json`, con Firestore en el puerto 8080. La CLI actual puede requerir Java más reciente; la verificación de seguridad inicial se hizo con CLI 13.35.1, emulador 1.19.8 y Java 17. Para reproducir esa combinación local:

```sh
npx --yes firebase-tools@13.35.1 emulators:exec --only firestore --project demo-holistica-security "npm run test:rules"
```

Ese pin es una referencia de reproducción, no una recomendación para usar una CLI antigua en despliegues. La CLI se descarga mediante `npx`; no es dependencia de producción del proyecto. Comprueba antes que no haya otro proceso usando el puerto 8080. Las pruebas borran solo los datos del proyecto de emulador.

## Diagnóstico frecuente

| Síntoma | Qué revisar |
| --- | --- |
| “Esta cuenta no tiene permisos” | Claim `admin: true`, proyecto correcto y nuevo inicio de sesión |
| Firestore `permission-denied` | Reglas desplegadas, token, filtros de publicación y datos que exceden límites |
| API de archivos 401/403 | Sesión/token o permiso de administrador |
| API de archivos 503 | Credenciales Admin, permisos de la cuenta de servicio y configuración de Cloudinary |
| Subida rechazada por Cloudinary | Preset firmado, formatos, tamaño y restricciones del plan |
| Imágenes externas bloqueadas | `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` y patrón de `next.config.ts` |
| Dominio incorrecto en SEO | `NEXT_PUBLIC_SITE_URL`, variables de Vercel y nuevo despliegue |
| Sitemap vacío | Dominio ausente o inválido; `app/sitemap.ts` devuelve una lista vacía en ese caso |

No resuelvas errores de permisos abriendo toda la base. Para cambios de acceso consulta [Firebase](firebase.md), y para cambios remotos utiliza la [lista de despliegue](deployment.md).
