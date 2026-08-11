import { readFile } from "node:fs/promises";
import { join, extname } from "node:path";
import { NextResponse } from "next/server";
import { uploadsRoot } from "@/server/services/storage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MIME: Record<string, string> = {
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

// Serves candidate uploads stored outside public/ (storage/uploads/...).
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ path: string[] }> }
) {
  const { path } = await ctx.params;
  const safe = path.filter((p) => p && p !== ".." && !p.includes("/"));
  const absolute = join(uploadsRoot(), ...safe);
  try {
    const data = await readFile(absolute);
    const type = MIME[extname(absolute).toLowerCase()] || "application/octet-stream";
    return new NextResponse(new Uint8Array(data), {
      headers: { "Content-Type": type, "Cache-Control": "private, max-age=3600" },
    });
  } catch {
    return NextResponse.json({ message: "Fichier introuvable" }, { status: 404 });
  }
}
