// tools.ts
// import Embed from "@editorjs/embed";
import Table from "@editorjs/table";
import List from "@editorjs/list";
import Paragraph from "@editorjs/paragraph";
// import Warning from "@editorjs/warning";
// import Code from "@editorjs/code";
// import LinkTool from "@editorjs/link";
// import Image from "@editorjs/image";
// import Raw from "@editorjs/raw";
import Header from "@editorjs/header";
// import Quote from "@editorjs/quote";
// import Marker from "@editorjs/marker";
// import CheckList from "@editorjs/checklist";
import Delimiter from "@editorjs/delimiter";
// import InlineCode from "@editorjs/inline-code";
// import SimpleImage from "@editorjs/simple-image";
import AccordionTool from "./components/AccordionTool";
import type { EditorConfig } from "@editorjs/editorjs";
import type { ToolConstructable } from "@editorjs/editorjs";

export const EDITOR_JS_TOOLS:  EditorConfig["tools"] = {
  paragraph: {
    class: Paragraph,
    inlineToolbar: true
  },

  header: {
    class: Header,
    inlineToolbar: true,
    config: {
      levels: [1, 2, 3, 4, 5],
      defaultLevel: 1
    }
  },

  list: {
    class: List,
    inlineToolbar: true
  },

  // checklist: {
  //   class: CheckList,
  //   inlineToolbar: true
  // },

  // quote: {
  //   class: Quote,
  //   inlineToolbar: true,
  //   config: {
  //     quotePlaceholder: "Escribe una cita",
  //     captionPlaceholder: "Autor"
  //   }
  // },

  // warning: {
  //   class: Warning,
  //   inlineToolbar: true,
  //   config: {
  //     titlePlaceholder: "Advertencia",
  //     messagePlaceholder: "Mensaje"
  //   }
  // },

  // code: Code,

  // inlineCode: InlineCode,

  // marker: Marker,

  delimiter: Delimiter,

  table: {
    class: Table as unknown as ToolConstructable,
    inlineToolbar: true
  },

  // embed: {
  //   class: Embed,
  //   inlineToolbar: false
  // },

  // raw: Raw,

  // linkTool: {
  //   class: LinkTool,
  //   config: {
  //     endpoint: "/api/link-preview" // necesario para que funcione
  //   }
  // },

  // image: {
  //   class: Image,
  //   config: {
  //     endpoints: {
  //       byFile: "/api/upload-image",
  //       byUrl: "/api/fetch-image"
  //     }
  //   }
  // },

  // simpleImage: {
  //   class: SimpleImage
  // }
  accordion: {
    class: AccordionTool
  }
};
