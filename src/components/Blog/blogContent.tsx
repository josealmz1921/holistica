import type { OutputData } from "@editorjs/editorjs";
import { blogText } from "./blogText";
import styles from "./blog.module.css";

function Items({ items, ordered, depth = 0 }: { items: unknown; ordered: boolean; depth?: number }) {
    if (!Array.isArray(items) || depth > 10) return null;
    const Tag = ordered ? "ol" : "ul";
    return <Tag>{items.map((item, index) => {
        const data = typeof item === "object" && item !== null ? item as Record<string, unknown> : null;
        return <li key={index}><span dangerouslySetInnerHTML={{ __html: blogText(data ? data.content : item) }} />
            {data && <Items items={data.items} ordered={ordered} depth={depth + 1} />}
        </li>;
    })}</Tag>;
}
export default function BlogContent({ content }: { content: OutputData }) {
    return <div className={styles.prose}>{content?.blocks?.map((block, index) => {
        if (block.type === "paragraph") return <p key={index} dangerouslySetInnerHTML={{ __html: blogText(block.data.text) }} />;
        if (block.type === "header") {
            const Heading = block.data.level === 3 ? "h3" : "h2";
            return <Heading key={index} dangerouslySetInnerHTML={{ __html: blogText(block.data.text) }} />;
        }
        if (block.type === "list") return <Items key={index} items={block.data.items} ordered={block.data.style === "ordered"} />;
        return null;
    })}</div>;
}
