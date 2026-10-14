# Cloudinary: imágenes y videos

[Índice del proyecto](../../README.md) · [Seguridad](security.md)

## Flujo de subida

1. Dropzone valida el archivo en el navegador.
2. `src/utilities/cloudinary.ts` comprueba formato/tamaño y solicita una firma a `POST /api/cloudinary/sign`.
3. El cliente envía un token de Firebase como `Authorization: Bearer …`.
4. El servidor verifica el token, su revocación y `admin: true`; aplica el límite de solicitudes.
5. El servidor fija timestamp, carpeta, ID aleatorio, `overwrite: false`, formatos permitidos y preset. Firma esos parámetros con el secreto privado.
6. El navegador envía el archivo y la firma directamente a Cloudinary.
7. El formulario guarda la referencia devuelta en Firestore al guardar el contenido.

El secreto de Cloudinary nunca debe viajar al navegador. La API key y la firma sí forman parte de la petición de subida. Las APIs locales aceptan JSON pequeño: **no envíes un video al cuerpo de la API de Next.js**.

## Límites actuales

Los tamaños se calculan con base 1024; aunque la interfaz diga MB, los límites son técnicamente MiB.

| Contexto | Formatos | Tamaño | Dimensiones / cantidad |
| --- | --- | --- | --- |
| Imágenes de servicios y Dropzone por defecto | JPG/PNG | 250 KiB | Hasta 1200 × 1200 px; `maxFiles=0` no limita cantidad en Dropzone, pero las reglas admiten hasta 30 en la galería |
| Imágenes del blog | JPG/PNG | 5 MiB | Hasta 1200 × 1200 px; máximo 10 archivos totales por entrada |
| Videos del blog | MP4/WebM | 150 MiB (157286400 bytes) | Dentro de los 10 archivos totales; sin límite de duración explícito en Dropzone |
| Foto de terapeuta | JPG/PNG | Límite por defecto de Dropzone: 250 KiB | Hasta 1200 × 1200 px; una imagen |

Dropzone solo acepta videos con `allowVideo`. Limita el nombre del archivo a 100 caracteres y permite ordenar los archivos. El helper de subida admite como máximo 5 MiB en imágenes y 150 MiB en videos; la interfaz puede imponer límites más bajos.

**Estas validaciones del navegador se pueden eludir.** El preset y el plan de Cloudinary deben imponer los límites externos.

## Configurar presets firmados

En la consola de Cloudinary, crea dos presets con modo **signed**, no unsigned:

| Variable privada | Configuración requerida del preset |
| --- | --- |
| `CLOUDINARY_IMAGE_UPLOAD_PRESET` | JPG/PNG, hasta 5 MiB y dimensiones máximas 1200 × 1200 según las capacidades de la cuenta |
| `CLOUDINARY_VIDEO_UPLOAD_PRESET` | MP4/WebM, hasta 150 MiB, sujeto al límite real de tu plan |

Configura `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` y el cloud name público según [Desarrollo](development.md#variables-de-entorno). `CLOUDINARY_ASSET_FOLDER` debe identificar una carpeta exclusiva del sitio; por defecto es `holistica`. Se admiten segmentos de letras, números, `_` y `-`, separados por `/`.

Desactiva la sobrescritura y comprueba cómo se aplican las restricciones de tamaño/formato del preset en tu cuenta. La firma no convierte un preset mal configurado en una política correcta de tamaño.

### Migración del flujo unsigned

El código ya no utiliza `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`. **Debes desactivar o eliminar el preset unsigned anterior desde Cloudinary.** Quitar la variable o desplegar código nuevo no invalida ese preset: su nombre pudo haber quedado expuesto en versiones anteriores.

No se han desactivado presets ni probado subidas reales automáticamente desde este repositorio. Confirma esos pasos en [Tareas](../tasks.md).

## Eliminación de imágenes

`DELETE /api/cloudinary/delete` recibe `{ "publicId": "identificador-permitido" }`, con sesión y claim de administrador. Valida el identificador y permite:

- Imágenes bajo la carpeta exclusiva configurada para el sitio.
- Imágenes antiguas fuera de esa carpeta si todavía están referenciadas en la galería de servicios, media de imágenes del blog o foto de terapeuta.

No admite eliminación arbitraria de toda la cuenta. El endpoint actual elimina imágenes; no implementa una operación equivalente de borrado de videos.

Quitar un archivo de una lista de Dropzone solo invoca borrado remoto cuando el formulario suministra el callback correspondiente. El blog y el perfil no deben interpretarse como un servicio de limpieza automática de todos los archivos antiguos; borrar una referencia de Firestore no garantiza borrar el recurso en Cloudinary.

## Límites de solicitudes y fallos

Las firmas y las eliminaciones tienen contadores separados de **30 solicitudes por minuto, por UID y acción**, persistidos en `_adminRateLimits`. Un exceso devuelve 429. No es un límite global por cuenta ni por IP.

La firma puede reutilizarse dentro de la ventana que acepte Cloudinary; el ID fijo y `overwrite: false` reducen el riesgo de sobrescritura. No registres firmas o tokens en documentación.

No hay transacción entre la subida y el guardado en Firestore. Si falla el guardado después de subir, puede quedar un archivo huérfano. Los reintentos del formulario del blog reutilizan subidas completadas durante esa edición; no equivalen a un recolector general de archivos.
