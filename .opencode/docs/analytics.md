# Métricas — Google Tag Manager y GA4

[Índice](../../README.md) · [Despliegue](deployment.md)

## Qué está implementado

El contenedor público **`GTM-P2828KQC`** se carga mediante `next/script` (`afterInteractive`) solo en el layout público y después de aceptar medición. No se instala una segunda integración de Firebase Analytics ni otra etiqueta directa de GA4. El campo `measurementId` de la configuración Firebase no inicializa Analytics y no se utiliza para esta integración.

El código encola eventos en `window.dataLayer`. **No crea ni publica etiquetas en GTM ni configura una propiedad GA4.** El propietario debe completar los pasos siguientes y verificar los datos reales.

## Eventos: nombres exactos

| Evento | Disparador en el sitio | Parámetros específicos |
| --- | --- | --- |
| `page_view` | Montaje de una página pública, también al navegar con Next.js, después del consentimiento | `page_type`, `service_id`, `service_name`, `article_id`, `article_title`, `page_referrer` |
| `whatsapp_click` | Activación de un enlace HTTPS con destino `wa.me` | Contexto de la página y, si es detalle de servicio, `service_id`, `service_name` |
| `blog_read` | Al menos 45 segundos con la pestaña visible y recorrido del 90 % del cuerpo del artículo | `article_id`, `article_title`, `visible_seconds`, `scroll_percent` |

Los tres incluyen `page_location`, `page_path` y `page_title`. `page_type` vale `home`, `blog_list`, `service` o `blog_article`. Los campos de servicio/artículo no aplicables se envían vacíos para no arrastrar contexto anterior en GTM.

Una visita a un servicio o artículo se identifica por `page_view`: no hay eventos adicionales `service_view` ni `blog_view`. El clic de WhatsApp mide intención de contacto, no confirma envío del mensaje ni reserva.

La lectura es una **estimación**, no una comprobación humana: usa la altura del texto (no galería/pie), excluye tiempo en pestaña oculta y se registra una vez por visita al artículo. Saltar hasta el final también puede satisfacer el recorrido; una pestaña visible no garantiza atención. El tiempo comienza después del consentimiento, no antes. No se mide reproducción de videos ni apertura/zoom de imágenes en esta versión.

## 1. Etiqueta de Google en GTM

1. Abre el contenedor `GTM-P2828KQC`.
2. Revisa si ya existe una etiqueta de Google. Edítala en lugar de duplicarla.
3. Configura tu ID de medición **`G-…`**, obtenido de GA4 → Administrar → Flujos de datos → Web. No uses el ID `GTM-…` como ID de medición.
4. En los parámetros de configuración de esa etiqueta, establece **`send_page_view` a `false`**.
5. Actívala con **Initialization / Inicialización — All Pages**. El contenedor completo ya está bloqueado por consentimiento desde el sitio.
6. En GA4, revisa Medición mejorada → Vistas de página → opciones avanzadas y desactiva la medición basada en cambios del historial del navegador. No añadas otro activador History Change para páginas.

El sitio ya emite las visitas. Si dejas el envío automático inicial o por historial, puedes duplicarlas. No uses a la vez otro script de GA4/Firebase Analytics que también envíe visitas. Revisa además etiquetas y eventos creados manualmente que pudieran replicar los mismos nombres.

## 2. Variables de capa de datos

En GTM → Variables → Nueva → Variable de capa de datos, crea variables de versión 2 para:

```text
page_location
page_path
page_title
page_referrer
page_type
service_id
service_name
article_id
article_title
visible_seconds
scroll_percent
```

Puedes nombrarlas en GTM como `DLV - service_id`, etc.; **el nombre de la variable de capa de datos debe coincidir exactamente** con la lista. No uses variables que capturen la URL completa del enlace de WhatsApp: contiene teléfono/mensaje y no se necesita para estas métricas.

## 3. Activadores y etiquetas GA4

Crea tres activadores de tipo **Evento personalizado**, uno para cada nombre exacto:

```text
page_view
whatsapp_click
blog_read
```

Para cada activador crea una etiqueta **Google Analytics: evento de GA4**, asociada a tu ID de medición y con ese mismo nombre de evento. Evita un activador genérico que también envíe `gtm.js` u otros eventos internos.

En cada etiqueta configura parámetros desde las variables creadas:

- Todas: `page_location`, `page_path`, `page_title`, `page_type`, `service_id`, `service_name`, `article_id`, `article_title`.
- `page_view`: también `page_referrer`.
- `blog_read`: también `visible_seconds`, `scroll_percent`.

En GA4 → Definiciones personalizadas, registra dimensiones con alcance **Evento** para `page_type`, `service_id`, `service_name`, `article_id`, `article_title` si quieres desglosarlos en exploraciones. Los parámetros estándar de página ya tienen dimensiones estándar. Para analizar `visible_seconds` como métrica personalizada, usa unidad de tiempo/segundos.

Marca **`whatsapp_click` como evento clave** si deseas medir intención de reservar. Los reportes y dimensiones nuevas no completan datos históricos y pueden tardar 24–48 horas. Para confirmar la implementación usa Tiempo real y DebugView, no esperes a los reportes agregados.

## Consentimiento y privacidad

- Antes de aceptar, no se carga GTM ni se encolan eventos de medición. Rechazar permite seguir usando el sitio.
- La preferencia se guarda localmente con la clave `flor-de-luna:analytics-consent:v1`; no es un identificador de visitante. Si el navegador bloquea almacenamiento, no se autoriza Analytics automáticamente.
- «Preferencias de medición», al pie del sitio, permite cambiar la elección. Rechazar después de aceptar actualiza Consent Mode y recarga la página para detener las etiquetas ya cargadas. El cambio se detecta también en otras pestañas del mismo origen.
- La integración concede únicamente `analytics_storage`; `ad_storage`, `ad_user_data` y `ad_personalization` permanecen denegados. No uses este consentimiento para habilitar publicidad u otros proveedores sin un flujo apropiado.
- No se añade iframe `noscript`: cargarlo sin JavaScript eludiría la elección de consentimiento.
- La revocación no borra automáticamente cookies ya creadas, datos históricos enviados a Google ni otras cookies del sitio. Esta interfaz no sustituye una política de privacidad, revisión legal, CMP certificada ni mecanismos de derechos del usuario.
- No se incluyen correo, teléfono, texto del mensaje ni URL destino de WhatsApp en nuestros eventos. Los nombres/títulos son del contenido público. Google puede procesar datos técnicos según su servicio/configuración; no prometer anonimato total.
- `page_location` conserva origen/ruta y solo parámetros `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`; descarta hashes, credenciales URL y otras consultas. Nunca pongas datos personales en rutas, títulos o etiquetas UTM. El referrer se limita a origen/ruta.
- La etiqueta de Google y las opciones de medición mejorada también pueden recopilar información automáticamente. Revisa que utilicen el `page_location` saneado y deshabilita medición de formularios/otros campos que no necesites; no envíes datos personales desde GTM.
- No se carga en login/dashboard; esos layouts raíz separados no incluyen `SiteAnalytics`. Hay además un bloqueo explícito de eventos en rutas administrativas/API.

## Procedencia y campañas

Para enlaces de Instagram, por ejemplo:

```text
https://example.com/?utm_source=instagram&utm_medium=social&utm_campaign=bienestar
```

Usa siempre valores de campaña no personales. La procedencia depende de consentimiento, configuración GA4, referrer disponible y bloqueadores; no se garantiza atribución de todas las visitas. No se guardan visitas previas a aceptar para reproducirlas después.

## Verificación y publicación

1. Publica el código en un entorno de pruebas autorizado y abre Vista previa de GTM / Tag Assistant.
2. Sin aceptar o tras rechazar: no debe haber petición del contenedor `gtm.js` ni eventos nuestros.
3. Acepta: confirma una única visita inicial y una por navegación a inicio, blog, un artículo y un servicio. La ventana de consentimiento no debe generar otra visita si ya estaba concedido.
4. Pulsa reservar desde un servicio y confirma `whatsapp_click` con su ID/nombre, sin teléfono ni mensaje.
5. En un artículo, llega al 90 % del texto y espera 45 segundos visibles. Confirma un solo `blog_read`; ocultar la pestaña debe pausar el tiempo.
6. Abre otro artículo y confirma que el ID cambia. Ir de un servicio al blog no debe dejar el servicio anterior en sus eventos.
7. Rechaza desde preferencias y confirma que se detiene la medición tras recargar; revisa también otra pestaña abierta.
8. Confirma DebugView/Realtime de GA4, usando depuración en la vista previa y sin activar `debug_mode` permanentemente para producción.
9. **Publica el contenedor en GTM**: un despliegue de Vercel no publica las etiquetas. Comprueba que el despliegue activo también contiene el nuevo código.

Pruebas locales: `npm run test:analytics`, TypeScript, ESLint focalizado y build. Las pruebas simulan almacenamiento y `dataLayer`; no contactan Google ni acreditan la configuración/publicación remota del contenedor.
