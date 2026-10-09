import type { OutputData } from "@editorjs/editorjs";
import sanitizeHtml from "sanitize-html";
import styles from "./serviceDescription.module.css";

const safeText = (value: unknown) => sanitizeHtml(typeof value === "string" ? value : "", {
    allowedTags: ["b", "strong", "i", "em", "br"],
    allowedAttributes: {},
});

function Items({ items, ordered, depth = 0 }: { items: unknown; ordered: boolean; depth?: number }) {
    if (!Array.isArray(items) || !items.length || depth > 10) return null;
    const Tag = ordered ? "ol" : "ul";
    return <Tag>{items.map((item, index) => {
        const data = typeof item === "object" && item !== null ? item as Record<string, unknown> : null;
        return <li key={index}><span dangerouslySetInnerHTML={{ __html: safeText(data ? data.content : item) }} />
            {data && <Items items={data.items} ordered={ordered} depth={depth + 1} />}
        </li>;
    })}</Tag>;
}

export default function ServiceDescription({ text, content }: { text: string; content?: OutputData }) {
    if (!Array.isArray(content?.blocks)) return <p className={styles.legacy}>{text}</p>;
    return <div className={styles.prose}>{content.blocks.map((block, index) => {
        if (block.type === "paragraph") return <p key={index} dangerouslySetInnerHTML={{ __html: safeText(block.data?.text) || "<br>" }} />;
        if (block.type === "list") return <Items key={index} items={block.data?.items} ordered={block.data?.style === "ordered"} />;
        return null;
    })}</div>;
}
