import { mkdir, writeFile } from "node:fs/promises";
import { join, extname } from "node:path";
import { randomUUID } from "node:crypto";
import { badRequest } from "@/server/http";

// PDF uniquement — condition pour que les recruteurs puissent lire CV et
// lettres directement dans l'application (aperçu inline), sans conversion
// ni téléchargement forcé (impossible à garantir pour .doc/.docx).
const ALLOWED = new Set([".pdf"]);
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
      throw badRequest("Seuls les fichiers PDF sont acceptés");
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

  /**
   * Persists a server-generated file (ex. PDF de rapport) under
   * storage/uploads/{folder} and returns its public URL. Pas de validation
   * de type/taille — contrairement à saveUpload, le contenu est produit par
   * le serveur lui-même, pas soumis par un utilisateur.
   */
  async saveBuffer(buffer: Buffer, folder: string, extension = ".pdf"): Promise<string> {
    const dir = join(uploadsRoot(), folder);
    await mkdir(dir, { recursive: true });

    const filename = `${randomUUID()}${extension}`;
    const absolute = join(dir, filename);
    await writeFile(absolute, buffer);

    return `/uploads/${folder}/${filename}`;
  },
};
