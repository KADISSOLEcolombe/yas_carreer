import { readFile } from 'node:fs/promises'
import { extname, join } from 'node:path'
import app from '@adonisjs/core/services/app'
import logger from '@adonisjs/core/services/logger'

export type DocumentReadResult = {
  text: string
  source: string
  imageCount: number
  error?: string
}

function resolveUploadPath(url: string): string | null {
  // Stored as /uploads/{folder}/{filename}
  const clean = url.split('?')[0]
  const marker = '/uploads/'
  const idx = clean.indexOf(marker)
  if (idx === -1) return null
  const relative = clean.slice(idx + marker.length)
  return app.makePath('storage', 'uploads', ...relative.split('/').filter(Boolean))
}

async function extractPdf(buffer: Buffer): Promise<{ text: string; imageCount: number }> {
  const { PDFParse } = await import('pdf-parse')
  const parser = new PDFParse({ data: buffer })
  try {
    const textResult = await parser.getText()
    let imageCount = 0
    try {
      const images = await parser.getImage({ imageThreshold: 40 })
      imageCount = (images.pages || []).reduce(
        (sum, page) => sum + (page.images?.length || 0),
        0
      )
    } catch {
      imageCount = 0
    }
    return {
      text: (textResult.text || '').replace(/\s+\n/g, '\n').trim(),
      imageCount,
    }
  } finally {
    await parser.destroy().catch(() => undefined)
  }
}

async function extractDocx(buffer: Buffer): Promise<string> {
  const mammoth = await import('mammoth')
  const extract = mammoth.extractRawText || mammoth.default?.extractRawText
  const result = await extract({ buffer })
  return (result.value || '').trim()
}

export default class DocumentReaderService {
  static async readUpload(url: string | null | undefined): Promise<DocumentReadResult | null> {
    if (!url) return null
    const absolute = resolveUploadPath(url)
    if (!absolute) {
      return { text: '', source: url, imageCount: 0, error: 'Chemin fichier invalide' }
    }

    try {
      const buffer = await readFile(absolute)
      const ext = extname(absolute).toLowerCase()

      if (ext === '.pdf') {
        const { text, imageCount } = await extractPdf(buffer)
        return { text: text.slice(0, 20000), source: url, imageCount }
      }

      if (ext === '.docx') {
        const text = await extractDocx(buffer)
        return { text: text.slice(0, 20000), source: url, imageCount: 0 }
      }

      if (ext === '.doc') {
        // Best-effort: binary .doc has limited plain-text recovery
        const raw = buffer.toString('utf8').replace(/[^\x09\x0A\x0D\x20-\x7E\u00C0-\u024F]/g, ' ')
        const text = raw.replace(/\s+/g, ' ').trim().slice(0, 8000)
        return {
          text,
          source: url,
          imageCount: 0,
          error: text.length < 40 ? 'Lecture .doc limitée' : undefined,
        }
      }

      return {
        text: buffer.toString('utf8').slice(0, 8000),
        source: url,
        imageCount: 0,
      }
    } catch (error) {
      logger.warn({ err: error, url }, 'Document read failed')
      return {
        text: '',
        source: url,
        imageCount: 0,
        error: (error as Error).message || 'Lecture impossible',
      }
    }
  }

  static async readApplicationDossier(input: {
    cvUrl?: string | null
    coverLetterUrl?: string | null
    coverLetterText?: string | null
    profileBio?: string | null
    profileSkills?: string | null
    profileExtracted?: unknown
  }): Promise<{
    dossierText: string
    cv: DocumentReadResult | null
    coverFile: DocumentReadResult | null
    documents: { label: string; ok: boolean; chars: number; images: number }[]
  }> {
    const [cv, coverFile] = await Promise.all([
      this.readUpload(input.cvUrl),
      this.readUpload(input.coverLetterUrl),
    ])

    const parts: string[] = []
    if (input.profileBio) parts.push(`Profil bio:\n${input.profileBio}`)
    if (input.profileSkills) parts.push(`Compétences profil:\n${input.profileSkills}`)
    if (input.profileExtracted) {
      try {
        parts.push(`Données extraites profil:\n${JSON.stringify(input.profileExtracted).slice(0, 3000)}`)
      } catch {
        /* ignore */
      }
    }
    if (input.coverLetterText) parts.push(`Lettre de motivation (texte):\n${input.coverLetterText}`)
    if (coverFile?.text) parts.push(`Lettre (fichier):\n${coverFile.text}`)
    if (cv?.text) {
      parts.push(
        `CV (texte extrait${cv.imageCount ? `, ${cv.imageCount} image(s) détectée(s)` : ''}):\n${cv.text}`
      )
    } else if (input.cvUrl) {
      parts.push('CV: fichier présent mais texte non extractible.')
    }

    const documents = [
      {
        label: 'CV',
        ok: Boolean(cv?.text),
        chars: cv?.text?.length || 0,
        images: cv?.imageCount || 0,
      },
      {
        label: 'Lettre fichier',
        ok: Boolean(coverFile?.text),
        chars: coverFile?.text?.length || 0,
        images: 0,
      },
      {
        label: 'Lettre texte',
        ok: Boolean(input.coverLetterText),
        chars: input.coverLetterText?.length || 0,
        images: 0,
      },
      {
        label: 'Profil',
        ok: Boolean(input.profileBio || input.profileSkills),
        chars: (input.profileBio?.length || 0) + (input.profileSkills?.length || 0),
        images: 0,
      },
    ]

    return {
      dossierText: parts.join('\n\n').slice(0, 24000),
      cv,
      coverFile,
      documents,
    }
  }
}
