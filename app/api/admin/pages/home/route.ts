import { getPageDraft, writePage } from "@/src/server/pages";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const GET = getPageDraft;
export const PUT = (request: Request) => writePage(request, "save");
export const POST = (request: Request) => writePage(request, "publish");
