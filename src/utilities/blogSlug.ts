export function createBlogSlug(title: string): string {
    return title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
        .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 120).replace(/-$/, "");
}
export function getBlogSlug(post: { slug?: string; title: string; id: string }): string {
    return post.slug || `${createBlogSlug(post.title).slice(0, 90) || "entrada"}-${post.id}`;
}
export const validateBlogTitle = (value: unknown) => {
    const text = typeof value === "string" ? value.trim() : "";
    return !text ? "Escribe el título de la entrada." : text.length > 160 ? "El título admite hasta 160 caracteres." : undefined;
};
export const validateBlogExcerpt = (value: unknown) => typeof value === "string" && value.trim().length > 400 ? "El resumen admite hasta 400 caracteres." : undefined;
export const validateBlogSlug = (value: unknown) => {
    const text = typeof value === "string" ? value : "";
    if (!text) return undefined;
    return text.length > 120 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(text)
        ? "Usa letras minúsculas sin acentos, números y guiones (máximo 120 caracteres)." : undefined;
};
