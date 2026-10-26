# Page builder reutilizable

> Importado en Flor de luna desde `josealmz1921/ingenix`, commit `a522753`. Este documento conserva el contrato de extracción original; la integración implementada y sus pendientes se describen en [Constructor de páginas](../../.opencode/specs/page-builder.md). La portada pública todavía no usa el constructor.

Este directorio es la unidad que se traslada a `holistica`: copiar **todo `src/page-builder/`**. No copiar el contenido de Ingenix, Header/Footer, configuración de Firebase, variables privadas ni imágenes de clientes.

## Estructura

```text
page-builder/
  components/
    ui/             Button, Card y TextBlock
    layout/         Grid y Section
    blocks/         Hero y Banner
  renderer/         PageRenderer y BlockRenderer
  registry/         Catálogo, campos editables y creación de bloques
  schemas/          Validación de documentos y URLs
  types/            Contrato JSON versionado
  styles/           Tokens, estilos limitados al módulo y temas
  examples/         Página neutral, sin imágenes ni servicios externos
  editor.ts         Exportaciones de datos para el admin y las APIs
  index.ts          API pública, incluido el renderizador
```

Requiere React 19 y Next.js 16 (se utiliza `next/image`). No requiere Tailwind, otra biblioteca de formularios ni un proveedor React. Importaciones internas relativas: no depende del alias de este proyecto. Los estilos no modifican `body`, `:root` ni el dashboard.

## Uso público y vista previa

```tsx
import { PageRenderer, florDeLunaTheme } from '@/src/page-builder';
import { examplePage } from '@/src/page-builder/examples/page';

export default function Page() {
  return (
    <main id="contenido">
      <PageRenderer document={examplePage} theme={florDeLunaTheme} />
    </main>
  );
}
```

El host conserva su Header, Footer y los márgenes exteriores. `PageRenderer` no añade otro `<main>`. En la vista previa del administrador utilizar el mismo componente con `mode="draft"`.

Para edición directa, el host puede proporcionar `renderText(sectionId, path, value)`, que devuelve un nodo de React para cada texto visible. Las rutas son relativas al bloque (`content.title`, `content.actions.0.label`, `content.items.0.title`, etc.). El módulo no implementa `contentEditable`: el host controla edición, pegado, accesibilidad y actualizaciones del documento. Sin este callback, el render público mantiene texto escapado y no incorpora controles de edición. El callback no forma parte del JSON ni evita su validación.

`florDeLunaTheme` utiliza los colores y las variables de fuente encontrados en `holistica/app/globals.css`: fondo crema, verdes, EB Garamond y Manrope. Las fuentes las carga el host; el módulo no descarga tipografías. El tema puede sobrescribirse con propiedades CSS `--pb-*` mediante `theme`, sin cambiar los componentes. El tema predeterminado mantiene la presentación oscura de este sitio.

## Documento de página

```ts
interface PageDocument {
  schemaVersion: 1;
  id: string;
  title: string;
  seo?: { title: string; description: string };
  sections: PageSection[];
}
```

El orden del array determina el orden visual. Cada bloque tiene un `id` estable, `type`, `variant`, `visible` y `content`; puede añadir `navigationLabel` y `tone`. Las cuadrículas tienen `columns`. Los bloques de portada/banner permiten opciones de presentación mediante `settings`.

Los datos no contienen JSX, funciones, clases CSS arbitrarias ni HTML enriquecido. React escapa los textos. El validador rechaza campos desconocidos y devuelve una copia sin propiedades `undefined`, apta para serialización. Los IDs de bloques y elementos deben ser únicos en su ámbito; `contenido` está reservado al enlace de accesibilidad del host.

## Conectar el administrador existente

```ts
import {
  blockRegistry,
  getBlockFields,
  createBlock,
  validatePageDocument,
} from '@/src/page-builder/editor';

const availableBlocks = Object.entries(blockRegistry);
const fields = getBlockFields('cards');
const block = createBlock('cards', 'servicios');

// Antes de guardar un borrador:
const draftResult = validatePageDocument(document, { mode: 'draft' });
// Antes de publicar:
const publishResult = validatePageDocument(document, { mode: 'publish' });
```

- El selector usa el catálogo y sus variantes; no acepta variantes libres.
- `getBlockFields` describe campos de texto, selección, booleanos, números, objetos y listas. El admin interpreta esos descriptores con sus formularios actuales.
- Los campos `image-url` pueden conectarse a la subida firmada de Cloudinary. Guardar la URL resultante en `image.src` o `logo.src` y pedir el texto alternativo.
- `createBlock` genera una estructura inicial de borrador. El host genera el ID único; después debe completar el contenido.
- Duplicar requiere cambiar el ID del bloque. Reordenar modifica el array; ocultar cambia `visible`.
- Las opciones numéricas de columnas y opacidades deben conservarse como números, no como strings del formulario.

La interfaz de arrastrar/soltar, los formularios, la persistencia y las subidas **no están implementadas en este módulo**. Es el contrato y renderizador para construir ese editor sin duplicar el admin.

## Seguridad y publicación en holistica

1. Separar almacenamiento de borradores y documentos publicados. No guardar ambos en un documento de lectura pública: Firestore entrega el documento completo.
2. Mantener `admin: true` tanto en reglas como en APIs administrativas. La validación de este módulo no sustituye autorización ni reglas desplegadas.
3. Validar de nuevo en el servidor al publicar. Si el navegador escribe directamente en Firestore, las reglas deben imponer las restricciones equivalentes; una validación de interfaz no es una barrera de seguridad.
4. El lector público solo consulta la versión publicada. Nunca usar Admin SDK para exponer borradores accidentalmente.
5. Publicar requiere una única portada visible (H1), al principio. Un borrador puede no tenerla todavía. Reutilizar Hero como sección intermedia requeriría un bloque de H2, no otra portada.
6. El host impone límites de tamaño de petición y de documento (Firestore tiene un límite de tamaño); el módulo limita a 100 bloques, 100 elementos por lista y 8 botones.

Se rechazan protocolos ejecutables, URLs de datos, rutas con barras invertidas y credenciales embebidas. Imágenes remotas requieren `images.remotePatterns` de Next.js configurado para los dominios reales autorizados. No abrir todos los dominios como atajo.

## SEO y compatibilidad

La página pública sigue renderizándose en servidor. El host debe conectar `document.seo` a `metadata`/`generateMetadata`, conservar canonical, sitemap, datos estructurados, consentimiento/analítica y enlaces de WhatsApp existentes. El módulo no escribe `<head>` ni sustituye la política SEO de Flor de luna.

No crear una nueva ruta genérica `/{slug}` sin revisar la existente de servicios en holistica. Empezar por conectar la portada y mantener las rutas de blog/servicios.

`schemaVersion` permite futuras migraciones explícitas. Una versión desconocida se rechaza: no se descartan datos silenciosamente.

## Alcance de la extracción

Se incluyen los cinco tipos registrados: `hero`, `text`, `banner`, `cards` y `projects`. Las variantes de tarjetas son `default`, `image-top`, `image-left`, `image-right`, `featured` y `compact`; las de proyectos son las tres variantes con imagen superior/lateral. Hero/text admiten izquierda, centro y derecha; Banner admite izquierda, derecha, arriba, abajo y fondo.

Carousel, Progress, GridCard y SectionHeader siguen como componentes legacy del sitio y no son bloques registrados del editor. No se necesitan para trasladar este módulo. Las antiguas rutas de los componentes extraídos y de `src/features/page-builder/` son reexportaciones de compatibilidad, no implementaciones duplicadas.

## Verificación

En este repositorio:

```sh
npm run test:page-builder
npx tsc --noEmit
npm run lint
npm run build
```

Las pruebas verifican variantes, JSON, controles del editor, URLs, IDs, H1, renderizado y ausencia de dependencias específicas del sitio. Esta copia está integrada con el dashboard y el inicio de Flor de luna; su alcance, reglas locales, APIs, lectura publicada y reversión se documentan en [la especificación de integración](../../.opencode/specs/page-builder.md).
