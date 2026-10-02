import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto'

const SALT = 'conduit-credentials'

function deriveKey(): Buffer {
  const secret = process.env.CONDUIT_ENCRYPTION_KEY
  if (!secret) throw new Error('CONDUIT_ENCRYPTION_KEY belum diset di env')
  return scryptSync(secret, SALT, 32)
}

export function encrypt(plaintext: string): string {
  const key = deriveKey()
  const iv = randomBytes(16)
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`
}

export function decrypt(payload: string): string {
  const [ivHex, tagHex, dataHex] = payload.split(':')
  if (!ivHex || !tagHex || !dataHex) throw new Error('Format credential terenkripsi tidak valid')
  const key = deriveKey()
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(ivHex, 'hex'))
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'))
  const decrypted = Buffer.concat([decipher.update(Buffer.from(dataHex, 'hex')), decipher.final()])
  return decrypted.toString('utf8')
}

export function encryptCredentials(creds: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(creds)) out[k] = encrypt(v)
  return out
}

export function decryptCredentials(creds: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(creds)) out[k] = decrypt(v)
  return out
}
