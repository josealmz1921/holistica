# Especificación del dashboard

[Índice del proyecto](../../README.md) · [Arquitectura](../docs/architecture.md) · [Blog](blog.md)

Esta especificación describe el comportamiento implementado, no un plan para añadir módulos. La configuración remota y sus verificaciones se registran en [Tareas](../tasks.md).

## Acceso

- Entrada por correo/contraseña en `/login`, usando Firebase Authentication.
- La cuenta debe contener el claim booleano `admin: true`.
- El login tiene mostrar/ocultar contraseña, bloqueo durante el envío y errores legibles.
- El layout del dashboard verifica el token antes de mostrar sus hijos; deniega cuentas sin permiso. Es un control de interfaz, no una sesión de servidor que reemplace las reglas.
- La navegación incluye servicios, categorías, terapeuta, blog y páginas. Cerrar sesión usa Firebase.
- Los tres administradores autorizados tienen el mismo nivel de permisos; no hay roles editor/lector ni interfaz para invitar usuarios.

## Servicios

El listado del inicio se encuentra en `/dashboard/pages` y el editor en `/dashboard/pages/home`. Guardar conserva un borrador privado; publicar actualiza los bloques iniciales y el SEO de `/`, conservando las secciones existentes debajo. Véase [Constructor de páginas](page-builder.md) para permisos, vistas previas, reversión y límites.

### Listado

- Ruta `/dashboard/services`.
- Busca por nombre o categoría, sin distinguir mayúsculas.
- Permite crear, editar, eliminar y alternar la visibilidad.
- La miniatura utiliza la primera imagen o un recurso local de respaldo.
- Crear abre `/dashboard/services/new`. Editar usa el slug en la ruta y el ID real en `?id=...`.

### Formulario

Incluye nombre, categoría, duración en minutos, descripción, visibilidad, galería, mensaje de reserva de WhatsApp, beneficios, recorrido y metadatos SEO/redes opcionales.

La descripción usa un editor de texto básico:

- Negrita, cursiva, listas ordenadas/no ordenadas y párrafos.
- Enter crea un párrafo; Shift + Enter crea un salto de línea.
- Sin enlaces, encabezados ni herramientas multimedia en este editor.
- Se guarda texto plano en `description` y contenido estructurado en `descriptionContent`.
- Las descripciones antiguas siguen siendo texto plano y conservan saltos de línea al mostrarse.
- El detalle público renderiza únicamente las etiquetas permitidas, sanitizadas.

El slug se genera a partir del nombre. Los beneficios y el recorrido son listas de título/descripción; el recorrido guarda un número de paso. La galería admite ordenación y usa la primera imagen como portada. Sus límites están en [Cloudinary](../docs/cloudinary.md#límites-actuales), y las reglas tienen límites adicionales de validación.

El estado `active` controla publicación: el catálogo consulta solo activos y el detalle público requiere `active == true`. Ocultar el servicio no elimina el documento ni sus imágenes.

Los metadatos públicos respetan los campos SEO/redes personalizados. En su ausencia, el título añade Pachuca y la marca Flor de luna; canónica y Open Graph usan la ruta pública `/{slug}`. No se modifica el documento para generar estos valores de respaldo. Detalles en [SEO local](../docs/local-seo.md).

### Reservas

El botón público abre WhatsApp con `NEXT_PUBLIC_PHONE_NUMBER` y el mensaje del servicio codificado para la URL. No crea una reserva en Firestore ni procesa pagos.

## Categorías

- Ruta `/dashboard/categories`; el parámetro `edit` selecciona la edición.
- El diálogo permite nombre y estado; el slug se genera desde el nombre.
- Se pueden crear, actualizar y eliminar categorías.
- La taxonomía es pública bajo las reglas actuales; marcarla inactiva no convierte su documento en privado.
- El selector de categoría del servicio utiliza las categorías activas.
- No hay una migración/cascada automática de los servicios asociados al eliminar una categoría; revisar dependencias antes de borrarla.

## Terapeuta

- Ruta `/dashboard/therapist` y documento único `content/therapist`.
- Permite nombre, especialidad, presentación y una foto opcional.
- La foto se sube con el flujo firmado de Cloudinary y se guarda su referencia.
- El contenido se muestra públicamente en el sitio.
- Las reglas limitan nombre a 160 caracteres, especialidad a 300 y presentación a 3000. El formulario exige completar los campos de texto.

## Criterios para comprobar cambios

1. Cuenta sin permiso: no gestiona contenido, aunque conozca las rutas o IDs.
2. Administrador: puede crear y editar sin duplicar envíos mientras se procesa el formulario.
3. Descripción: el formato básico y los saltos se conservan después de guardar y volver a editar.
4. Compatibilidad: los servicios con descripciones anteriores se siguen mostrando sin HTML sin sanear.
5. Visibilidad: los inactivos no se consultan públicamente y sí son gestionables por admin.
6. Galería: el orden guardado coincide con la portada y no se admite contenido fuera de los formatos previstos.
7. Perfil y categorías: los cambios se reflejan en las consultas públicas correspondientes.

Estos criterios guían pruebas manuales; no todos tienen una prueba de interfaz automatizada. Para seguridad hay suites de APIs y reglas descritas en [Desarrollo](../docs/development.md).
