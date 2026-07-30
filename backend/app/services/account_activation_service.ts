import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import env from '#start/env'

type ActivationPayload = {
  userId: number
  exp: number
}

function appKey(): string {
  const key = env.get('APP_KEY')
  return typeof key === 'string' ? key : String((key as { release: () => string }).release())
}

export default class AccountActivationService {
  static createToken(userId: number, ttlHours = 48): string {
    const payload: ActivationPayload = {
      userId,
      exp: Math.floor(Date.now() / 1000) + ttlHours * 3600,
    }
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
    const sig = createHmac('sha256', appKey()).update(body).digest('base64url')
    return `${body}.${sig}`
  }

  static verifyToken(token: string): ActivationPayload | null {
    const [body, sig] = token.split('.')
    if (!body || !sig) return null
    const expected = createHmac('sha256', appKey()).update(body).digest('base64url')
    try {
      const a = Buffer.from(sig)
      const b = Buffer.from(expected)
      if (a.length !== b.length || !timingSafeEqual(a, b)) return null
      const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as ActivationPayload
      if (!payload?.userId || !payload?.exp) return null
      if (payload.exp < Math.floor(Date.now() / 1000)) return null
      return payload
    } catch {
      return null
    }
  }

  static randomPassword(length = 24): string {
    return randomBytes(length).toString('base64url').slice(0, length)
  }
}
