# Activar las protecciones de administración

Los cambios fallan de forma segura: sin permiso `admin: true`, el dashboard y las APIs de archivos rechazan el acceso. Las reglas locales **no protegen Firestore hasta que se despliegan**. No se han cambiado usuarios, reglas remotas ni presets automáticamente.

## 1. Servidor (Node.js 22 o posterior)

Configura en `.env.local` y en las variables privadas del despliegue:

```dotenv
FIREBASE_ADMIN_PROJECT_ID=tu-proyecto-firebase
FIREBASE_ADMIN_CLIENT_EMAIL=cuenta-de-servicio
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret
CLOUDINARY_IMAGE_UPLOAD_PRESET=imagenes-firmadas
CLOUDINARY_VIDEO_UPLOAD_PRESET=videos-firmados
CLOUDINARY_ASSET_FOLDER=holistica
```

La cuenta de servicio debe pertenecer al mismo proyecto que Firebase del navegador. También se admite Application Default Credentials en entornos Google. Nunca uses prefijos `NEXT_PUBLIC_` para secretos ni subas claves al repositorio. La cuenta de servicio necesita verificar usuarios y operar en Firestore (incluido `_adminRateLimits`); aplica privilegio mínimo.

## 2. Asignar tu administrador

Obtén tu UID en Firebase Authentication. Ejecuta localmente con credenciales de confianza:

```sh
node --env-file-if-exists=.env.local scripts/set-admin.mjs --uid TU_UID --grant
```

Para revocar: reemplaza `--grant` por `--revoke`. El comando conserva otros claims e invalida las sesiones anteriores. Cierra sesión y vuelve a entrar. No existe un endpoint público para asignar administradores. No habilites registro público si no lo necesitas; una cuenta registrada por sí sola no obtiene permisos de administración.

## 3. Reglas de Firestore

Revisa las colecciones y límites de `firestore.rules`, pruébalos en un emulador y despliega explícitamente al proyecto correcto:

```sh
npx firebase-tools deploy --only firestore:rules --project TU_PROYECTO
```

Las escrituras requieren el claim de administrador. Servicios inactivos y entradas no publicadas solo se leen como administrador. Categorías y el perfil público de terapeuta son públicos por diseño. El resto de colecciones se deniega a clientes. El SDK Admin del servidor evita estas reglas; las APIs verifican sesión, revocación y rol antes de usarlo.

El sitio consulta servicios activos y entradas publicadas. Si Firebase solicita índices compuestos para consultas por slug/estado, crea los índices indicados. Revisa documentos antiguos que no cumplan los límites antes de editar; no se migran ni se publican automáticamente.

## 4. Cloudinary (imprescindible)

En la consola crea **dos presets de subida firmada**, nunca unsigned:

- Imágenes: JPG/PNG; tamaño máximo 5 MiB y dimensiones máximas 1200 × 1200.
- Videos: MP4/WebM; tamaño máximo 150 MiB (157286400 bytes), siempre sujeto al límite de tu plan.
- Desactiva sobrescritura. Usa una carpeta exclusiva de este sitio y configura los nombres en las variables privadas de arriba.
- **Desactiva o elimina el preset unsigned anterior** (`NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`) en Cloudinary. Quitar la variable del código no invalida un preset ya publicado.
- Verifica con subidas reales pequeñas y archivos rechazados antes de habilitarlo en producción. Los límites del navegador no son controles de seguridad: los presets deben imponerlos en Cloudinary.

Los archivos nuevos usan IDs aleatorios en la carpeta controlada. Las eliminaciones requieren administrador y admiten solo esa carpeta o imágenes antiguas referenciadas por servicios/blog/perfil. Las firmas y eliminaciones tienen límites persistentes por administrador/minuto. Una firma puede reutilizarse durante su ventana de validez; el ID fijo y `overwrite: false` evitan sobrescribir contenido.

## 5. Dependencias y comprobación

Next y sus herramientas se actualizaron a una versión corregida. Firebase se actualizó dentro de la rama 12, y gRPC se fija a una versión 1.x corregida mediante `overrides`; el SDK Admin requiere Node 22. Ejecuta `npm audit --omit=dev` tras futuras actualizaciones. No uses `npm audit fix --force` sin revisar cambios incompatibles.

Verificación local realizada: build, TypeScript, ESLint focalizado en las APIs y módulos de seguridad, 9 pruebas de APIs y 6 pruebas de reglas en el emulador. También se comprobó un servidor de producción local: las APIs anónimas responden 401/no-store, se aplican las cabeceras de seguridad y login/dashboard incluyen noindex. `npm audit --omit=dev` no reporta vulnerabilidades. La auditoría completa conserva 5 avisos de desarrollo en la cadena `eslint-config-next → fast-glob → micromatch → braces`; npm propone retroceder a Next ESLint 14, por lo que no se aplica esa solución incompatible. Mantén estas herramientas fuera del servidor público y revisa futuras correcciones.

Para repetir las pruebas (el emulador nunca utiliza datos de producción):

```sh
npm run test:security
npx firebase-tools emulators:exec --only firestore --project demo-holistica-security "npm run test:rules"
```

La CLI actual puede requerir una versión reciente de Java. Las pruebas locales se ejecutaron con Firebase CLI 13.35.1 y el emulador Firestore 1.19.8, compatibles con el Java 17 disponible; la CLI no se añade como dependencia de producción.

Antes de desplegar, comprueba:

1. Sin sesión: APIs de archivos devuelven 401 y no contactan Cloudinary.
2. Usuario normal: dashboard denegado, APIs 403 y escrituras Firestore denegadas.
3. Administrador: CRUD y archivos funcionan; archivos ajenos se rechazan.
4. Visitante: sitio público funciona, borradores y servicios inactivos no son accesibles.
5. Token caducado/revocado: API lo rechaza; cuenta sin claim no puede subir ni borrar.
6. Presets antiguos desactivados, límites de tamaño/tipo aplicados en Cloudinary.

Los metadatos `noindex` y `robots.txt` no sustituyen a la autorización. Nunca expongas `next dev` como servidor de producción.
