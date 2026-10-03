'use client'

import { CopyButton } from './CopyButton'

export function SecretReveal({
  title,
  value,
  onDone,
  doneLabel = 'Saya sudah menyimpannya',
}: {
  title: string
  value: string
  onDone: () => void
  doneLabel?: string
}) {
  return (
    <div className="secret-reveal" role="status">
      <div className="secret-reveal__head">
        <span className="secret-reveal__icon" aria-hidden>🔑</span>
        <div>
          <h3>{title}</h3>
          <p>Token ini hanya ditampilkan sekali. Simpan sekarang, karena tidak bisa dilihat lagi nanti.</p>
        </div>
      </div>
      <div className="secret-reveal__value">
        <code className="mono">{value}</code>
        <CopyButton value={value} label="Salin token" className="btn-primary" />
      </div>
      <div className="secret-reveal__foot">
        <button type="button" className="btn btn-outline" onClick={onDone}>{doneLabel}</button>
      </div>
    </div>
  )
}
