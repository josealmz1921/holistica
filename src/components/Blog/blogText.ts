import sanitizeHtml from "sanitize-html";

export function blogText(value: unknown): string {
    return sanitizeHtml(typeof value === "string" ? value : "", {
        allowedTags: ["b", "strong", "i", "em", "a", "br"],
        allowedAttributes: { a: ["href"] },
        allowedSchemes: ["https", "http", "mailto"],
        allowProtocolRelative: false,
    });
}
