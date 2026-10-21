# Despliegue y comprobaciones

[Índice del proyecto](../../README.md) · [Seguridad](security.md) · [Tareas](../tasks.md)

## Tres despliegues/configuraciones independientes

1. **Next.js en Vercel:** publica páginas, APIs y variables de entorno.
2. **Firebase:** administra cuentas/claims, reglas e índices de Firestore.
3. **Cloudinary:** configura presets y límites, y mantiene los archivos.

Un despliegue de Vercel no publica `firestore.rules`, asigna administradores ni desactiva presets antiguos. Este repositorio no contiene automatización que realice todos esos pasos.

## Preparación

- Revisa el proyecto Firebase y la cuenta Cloudinary de destino. No uses credenciales de producción para pruebas de edición si dispones de un entorno de pruebas.
- Confirma acceso y respaldo del contenido relevante antes de cambiar reglas.
- Configura las variables descritas en [Desarrollo](development.md#variables-de-entorno).
- Autoriza individualmente las tres cuentas mediante el [procedimiento de Firebase](firebase.md#asignar-las-tres-cuentas). Confirma un nuevo inicio de sesión de cada una.
- Configura los [presets firmados](cloudinary.md#configurar-presets-firmados), formatos y desactivación del preset unsigned anterior tras revisar sus consumidores. Los límites de tamaño del cliente no son límites de bytes por preset.
- Comprueba datos antiguos frente a los límites de las reglas; no se migran automáticamente.

## Desplegar reglas de Firestore

Primero ejecuta las [pruebas del emulador](development.md#pruebas-de-firestore). Con autorización del propietario, inicia sesión en la CLI y elige explícitamente el proyecto real:

```sh
npx firebase-tools login
npx firebase-tools deploy --only firestore:rules --project TU_PROYECTO_FIREBASE
```

Los comandos se ejecutan desde la raíz, donde `firebase.json` referencia `firestore.rules`. Sustituye el marcador por el ID correcto. **El segundo comando modifica la política remota de la base.** No uses `demo-holistica-security` como destino de producción.

Revisa en Firebase Console → Firestore Database → Rules que la política publicada corresponde al archivo revisado. Si una consulta solicita índices, crea los necesarios después de verificar que corresponde a una consulta prevista. El repositorio no incluye actualmente un `firestore.indexes.json`.

## Vercel

1. Importa el repositorio como proyecto Next.js.
2. Selecciona Node.js 22 o una versión posterior compatible con el runtime y proveedores.
3. Configura variables públicas y privadas para el entorno elegido. No pegues secretos en archivos versionados ni logs.
4. Comprueba que `NEXT_PUBLIC_SITE_URL` es el dominio definitivo con `https://`; no copies el dominio de otro proyecto.
5. Configura `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` para permitir imágenes de la cuenta correcta.
6. Ejecuta la verificación local y despliega desde Vercel o mediante el flujo autorizado del repositorio.

Las variables `NEXT_PUBLIC_*` se incorporan al bundle durante el build. Cambiarlas en la consola requiere un nuevo despliegue para actualizar navegador y metadatos. `.env.local` no se sube a Vercel automáticamente por estar presente en tu máquina.

Si Firebase Authentication rechaza un dominio, revisa sus dominios autorizados para el entorno de destino. Evita conectar una vista previa de pruebas a la base de producción salvo que sea una decisión explícita.

## Verificación posterior

### Sitio y SEO

- La portada, servicios activos y entradas publicadas se muestran.
- Servicios inactivos y borradores no aparecen ni son accesibles públicamente.
- `/sitemap.xml` contiene URLs absolutas del dominio correcto, sin dashboard ni borradores.
- `/robots.txt` referencia el sitemap y desaconseja rastrear login/dashboard/APIs.
- Las entradas tienen canónica, Open Graph, metadatos de X y JSON-LD sin fechas inventadas.
- Las URLs antiguas de blog redirigen permanentemente al slug vigente.
- Reservas por WhatsApp apuntan al número correcto.

### Administración y archivos

- Cada una de las tres cuentas autorizadas entra y puede gestionar contenido.
- Una cuenta sin claim no obtiene acceso administrativo ni puede escribir en Firestore.
- Sin token, las APIs de archivos responden 401; una cuenta sin admin recibe 403.
- Un admin puede subir archivos válidos y Cloudinary rechaza formatos no permitidos. Comprueba los límites reales de cuenta; los tamaños del cliente pueden eludirse y no son garantía de un preset.
- La eliminación de archivos ajenos se deniega.
- Las credenciales de servicio permiten verificar usuarios; la firma no escribe contadores en Firestore. El borrado de imágenes antiguas fuera de la carpeta necesita consultar referencias. Las APIs no devuelven 503 por falta de configuración.
- El preset unsigned anterior está realmente desactivado.

Para verificar guardado o borrado real, usa documentos/archivos de prueba con autorización; no elimines contenido existente como experimento. Las pruebas automáticas locales no acreditan estos pasos externos.

## Si algo falla

Consulta [diagnóstico frecuente](development.md#diagnóstico-frecuente). No abras reglas ni restaures subidas unsigned como solución rápida. Si necesitas revertir un despliegue, revisa también la compatibilidad con las reglas y presets vigentes: código y políticas remotas tienen versiones independientes.
