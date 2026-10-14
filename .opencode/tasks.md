# Tareas y estado del proyecto

[Índice del proyecto](../README.md) · [Despliegue](docs/deployment.md) · [Guía de trabajo](AGENTS.md)

Este archivo distingue **implementación en el repositorio** de **configuración externa confirmada**. Una casilla pendiente de confirmación no significa que el propietario no la haya realizado: significa que no se ha verificado desde este trabajo. No guardar UID, correos o credenciales como evidencia aquí.

## Implementado

- [x] Sitio público, servicios, categorías, perfil de terapeuta y reservas por WhatsApp.
- [x] Dashboard de contenido y login con Firebase.
- [x] Descripciones de servicios con texto enriquecido básico y compatibilidad con texto anterior.
- [x] Blog con editor, borradores/publicación, archivos y slugs anteriores.
- [x] SEO de blog opcional, imagen social, alt, JSON-LD, sitemap y robots.
- [x] Tarjetas del blog sin portada ficticia cuando no hay imagen.
- [x] Límite de videos de 150 MiB en Dropzone/helper; restricciones externas dependen del preset y plan.
- [x] Claim `admin: true` exigido en login, protección visual y APIs de archivos.
- [x] Subidas firmadas, borrado acotado, límites de solicitudes y validación de JSON.
- [x] Reglas de Firestore con escritura administrativa y lectura pública limitada.
- [x] Script de asignación/revocación de administradores con invalidación de sesiones.
- [x] Dependencias de runtime actualizadas y gRPC corregido mediante override.
- [x] Pruebas persistentes: 9 casos de APIs y 6 casos de reglas en emulador.
- [x] README, instrucciones, guías operativas y especificaciones centralizadas en `.opencode/`.

## Prioridad: activación externa pendiente de confirmar

- [ ] Confirmar que las tres cuentas indicadas tienen el claim booleano de administrador y pueden iniciar sesión de nuevo.
- [ ] Confirmar credenciales privadas de Firebase Admin en el entorno de destino y coincidencia de proyecto.
- [ ] Confirmar permisos de la cuenta de servicio para verificar usuarios y operar Firestore/contadores.
- [ ] Desplegar o confirmar las reglas remotas correctas, después de revisar datos antiguos e índices necesarios.
- [ ] Confirmar ambos presets signed, sus límites de formato/tamaño y la carpeta exclusiva.
- [ ] Desactivar o confirmar desactivación del preset unsigned anterior.
- [ ] Verificar con Cloudinary que el plan admite 150 MiB y rechaza archivos fuera de política.
- [ ] Confirmar variables de Vercel, Node 22+, dominio SEO, cloud name y número de WhatsApp.
- [ ] Completar las comprobaciones públicas, administrativas y de archivos de la [guía de despliegue](docs/deployment.md#verificación-posterior).

## Mejoras y revisión técnica

- [ ] Revisar próximas correcciones para los avisos de desarrollo de la cadena ESLint/fast-glob/micromatch/braces; no resolverlos con un downgrade incompatible automático.
- [ ] Añadir pruebas persistentes específicas de SEO, slugs y renderizado de descripciones; las validaciones manuales previas no sustituyen una suite mantenida.
- [ ] Revisar canónicas de servicios: su ruta pública es `/{slug}`, pero la generación actual de metadatos del servicio construye `/services/{slug}`.
- [ ] Definir si hace falta limpieza explícita de archivos huérfanos y reservas de slug al eliminar contenido; no borrar recursos reales automáticamente sin una política acordada.
- [ ] Evaluar si hacen falta pruebas de interfaz y una verificación de límites reales de proveedor en un entorno de pruebas autorizado.

Estas mejoras están documentadas, no autorizadas automáticamente para implementación. No se ha solicitado gestión dinámica de usuarios: la decisión vigente es habilitar solo las tres cuentas indicadas.

## Registro de verificaciones

Al introducir las protecciones se completaron build, TypeScript, ESLint focalizado, las 15 pruebas de seguridad y una comprobación de servidor local (401 anónimo, cabeceras y noindex). La auditoría de producción reportó 0 vulnerabilidades y la completa 5 avisos en desarrollo. Son resultados históricos de esa revisión; repetir antes de una publicación y registrar cambios de estado sin asumir que siguen vigentes.

Para cada tarea externa que se confirme, anota fecha, entorno y tipo de comprobación, sin secretos. Una prueba local no debe marcar por sí sola una tarea de producción como completada.
