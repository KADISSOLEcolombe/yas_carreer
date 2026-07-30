import { mkdir, writeFile } from 'node:fs/promises'
import { join, extname } from 'node:path'
import { randomUUID } from 'node:crypto'
import app from '@adonisjs/core/services/app'
import type { MultipartFile } from '@adonisjs/core/bodyparser'

const ALLOWED = new Set(['.pdf', '.doc', '.docx'])
const MAX_SIZE = 5 * 1024 * 1024

export default class StorageService {
  static async saveUpload(file: MultipartFile, folder: string): Promise<string> {
    if (!file.isValid) {
      throw new Error(file.errors.map((e) => e.message).join(', ') || 'Fichier invalide')
    }

    const ext = extname(file.clientName || '').toLowerCase()
    if (!ALLOWED.has(ext)) {
      throw new Error('Type de fichier non autorisé (PDF, DOC, DOCX)')
    }

    if ((file.size || 0) > MAX_SIZE) {
      throw new Error('Fichier trop volumineux (max 5 Mo)')
    }

    const dir = app.makePath('storage', 'uploads', folder)
    await mkdir(dir, { recursive: true })

    const filename = `${randomUUID()}${ext}`
    const absolute = join(dir, filename)

    // Move tmp file or write buffer
    await file.move(dir, { name: filename, overwrite: true })
    if (!file.filePath && file.tmpPath) {
      // fallback unused — move handles it
      await writeFile(absolute, '')
    }

    return `/uploads/${folder}/${filename}`
  }
}
