import { query, where, documentId, collection, doc, getDoc, getDocs, deleteDoc, serverTimestamp, runTransaction } from "firebase/firestore";
import type { OutputData } from "@editorjs/editorjs";
import { createBlogSlug, getBlogSlug, validateBlogSlug, validateBlogTitle, validateBlogExcerpt } from "@/src/utilities/blogSlug";
import { db } from "./firebase";

export interface BlogMedia {
    url: string;
    publicId: string;
    resourceType: "image" | "video";
    name: string;
}
export interface BlogPost {
    slug?: string;
    previousSlugs?: string[];
    title: string;
    excerpt: string;
    content: OutputData;
    media: BlogMedia[];
    published: boolean;
}
export type BlogEntry = BlogPost & { id: string };
const posts = () => collection(db, "blog");
export const newBlogId = () => doc(posts()).id;
export async function getBlogPosts(): Promise<BlogEntry[]> {
    const snapshot = await getDocs(posts());
    return snapshot.docs.map(item => ({ ...item.data(), id: item.id }) as BlogEntry)
        .sort((a, b) => a.title.localeCompare(b.title, "es"));
}
export async function getBlogPost(id: string): Promise<BlogPost | null> {
    const snapshot = await getDoc(doc(posts(), id));
    return snapshot.exists() ? snapshot.data() as BlogPost : null;
}
export async function saveBlogPost(id: string, post: BlogPost) {
    const slug = post.slug || createBlogSlug(post.title);
    const error = validateBlogTitle(post.title) || validateBlogSlug(slug) || validateBlogExcerpt(post.excerpt);
    if (error || !slug) throw new Error(error || "Escribe un slug válido.");
    const existing = await getBlogPosts();
    if (existing.some(item => item.id !== id && (getBlogSlug(item) === slug || item.id === slug || item.previousSlugs?.includes(slug)))) {
        throw new Error("Este slug ya pertenece a otra entrada. Elige uno diferente.");
    }
    const claim = doc(db, "blogSlugs", slug);
    await runTransaction(db, async transaction => {
        const owner = await transaction.get(claim);
        const previous = await transaction.get(doc(posts(), id));
        if (owner.exists() && owner.data().postId !== id) {
            throw new Error("Este slug ya pertenece a otra entrada. Elige uno diferente.");
        }
        const oldPost = previous.exists() ? previous.data() as BlogPost : null;
        const oldSlug = oldPost ? getBlogSlug({ ...oldPost, id }) : null;
        const previousSlugs = Array.from(new Set([
            ...(oldPost?.previousSlugs || []),
            ...(oldSlug && oldSlug !== slug ? [oldSlug] : []),
        ]));
        transaction.set(claim, { postId: id });
        transaction.set(doc(posts(), id), { ...post, slug, previousSlugs, updatedAt: serverTimestamp() });
    });
}
export async function deleteBlogPost(id: string) {
    await deleteDoc(doc(posts(), id));
}

export async function getPublishedBlogPosts(): Promise<BlogEntry[]> {
    const snapshot = await getDocs(query(posts(), where("published", "==", true)));
    return snapshot.docs
        .sort((a, b) => (b.data().updatedAt?.toMillis?.() || 0) - (a.data().updatedAt?.toMillis?.() || 0))
        .map(item => ({ ...item.data(), id: item.id }) as BlogEntry);
}

export async function getPublishedBlogPost(id: string): Promise<BlogPost | null> {
    const snapshot = await getDocs(query(posts(), where(documentId(), "==", id), where("published", "==", true)));
    return snapshot.empty ? null : snapshot.docs[0].data() as BlogPost;
}


export async function getPublishedBlogPostBySlug(slug: string): Promise<BlogEntry | null> {
    const published = await getPublishedBlogPosts();
    return published.find(post => getBlogSlug(post) === slug)
        || published.find(post => post.id === slug || post.previousSlugs?.includes(slug)) || null;
}
