import { mkdir, writeFile } from "node:fs/promises";
import { join, extname } from "node:path";
import { randomUUID } from "node:crypto";
import { badRequest } from "@/server/http";

const ALLOWED = new Set([".pdf", ".doc", ".docx"]);
const MAX_SIZE = 5 * 1024 * 1024;

/** Absolute path to the uploads root (outside public/, served via a route). */
export function uploadsRoot(): string {
  return join(process.cwd(), "storage", "uploads");
}

export const StorageService = {
  /**
   * Persists a browser File (from multipart FormData) under
   * storage/uploads/{folder} and returns its public URL: /uploads/{folder}/{name}
   */
  async saveUpload(file: File, folder: string): Promise<string> {
    const ext = extname(file.name || "").toLowerCase();
    if (!ALLOWED.has(ext)) {
      throw badRequest("Type de fichier non autorisé (PDF, DOC, DOCX)");
    }
    if ((file.size || 0) > MAX_SIZE) {
      throw badRequest("Fichier trop volumineux (max 5 Mo)");
    }

    const dir = join(uploadsRoot(), folder);
    await mkdir(dir, { recursive: true });

    const filename = `${randomUUID()}${ext}`;
    const absolute = join(dir, filename);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(absolute, buffer);

    return `/uploads/${folder}/${filename}`;
  },
};
