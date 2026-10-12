/*
  Kumpulan komponen kecil yang dipakai berulang di halaman-halaman
  Panel Admin IT.
*/

import { useEffect } from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

export function StatCard({ label, value, description }) {
  return (
    <div className="stat-card">
      <div className="stat-card__label">{label}</div>
      <div className="stat-card__value">{value}</div>

      {description && (
        <div className="muted stat-card__description">
          {description}
        </div>
      )}
    </div>
  )
}

export function StatusBadge({ status }) {
  let className = 'badge'

  if (status === 'Aktif' || status === 'Dilayani') {
    className = 'badge badge-success'
  } else if (status === 'Menunggu') {
    className = 'badge badge-warning'
  } else if (status === 'Tidak Aktif') {
    className = 'badge badge-danger'
  } else if (status === 'Selesai' || status === 'Kosong') {
    className = 'badge badge-info'
  }

  return <span className={className}>{status}</span>
}

// [BARU] Notifikasi kecil (berhasil / gagal), hilang sendiri.
// toast = { type: 'success' | 'error', text } atau null
export function Toast({ toast, onClose, duration = 4000 }) {
  useEffect(() => {
    if (!toast) return
    const id = setTimeout(onClose, duration)
    return () => clearTimeout(id)
  }, [toast])

  if (!toast) return null

  const Icon = toast.type === 'error' ? AlertCircle : CheckCircle2

  return (
    <div
      className={`it-toast it-toast--${toast.type}`}
      role={toast.type === 'error' ? 'alert' : 'status'}
    >
      <Icon size={18} strokeWidth={2} />
      <span>{toast.text}</span>

      <button
        type="button"
        onClick={onClose}
        aria-label="Tutup"
        className="it-toast__close"
      >
        ×
      </button>
    </div>
  )
}

// [BARU] Tab untuk halaman gabungan.
// tabs = [{ key, label }], active = key tab aktif, onChange(key)
export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="it-tabs" role="tablist">
      {tabs.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          role="tab"
          aria-selected={active === key}
          className={'it-tabs__tab' + (active === key ? ' is-active' : '')}
          onClick={() => onChange(key)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

export function Modal({
  title,
  subtitle,
  icon: Icon,
  onClose,
  children,
}) {
  return (
    <div
      className="it-modal-overlay"
      onClick={onClose}
    >
      <div
        className="card it-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="it-modal-header">
          <div className="it-modal-header__decoration" />

          {Icon && (
            <div className="it-modal-header__icon">
              <Icon size={20} strokeWidth={2} />
            </div>
          )}

          <div className="it-modal-header__content">
            <p className="it-modal-header__title">
              {title}
            </p>

            {subtitle && (
              <p className="it-modal-header__subtitle">
                {subtitle}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            aria-label="Tutup"
            className="it-modal-close"
          >
            ×
          </button>
        </div>

        {/* BODY */}
        <div className="it-modal-body">
          {children}
        </div>
      </div>
    </div>
  )
}

export function FieldWrap({ icon: Icon, children }) {
  return (
    <div className="field-wrap">
      {Icon && (
        <span className="field-wrap__icon">
          <Icon size={16} strokeWidth={2} />
        </span>
      )}

      {children}
    </div>
  )
}

export function RowActions({ onEdit, onDelete }) {
  return (
    <div className="row-actions">
      <button
        onClick={onEdit}
        className="row-actions__edit"
      >
        Edit
      </button>

      <button
        onClick={onDelete}
        className="row-actions__delete"
      >
        Hapus
      </button>
    </div>
  )
}

export function ManagementPage({
  eyebrow,
  title,
  description,
  button,
  onButtonClick,
  children,
}) {
  return (
    <>
      <div className="page-intro">
        <div>
          {eyebrow && (
            <div className="page-intro__eyebrow">
              {eyebrow}
            </div>
          )}

          <h1 className="page-intro__title">
            {title}
          </h1>

          {description && (
            <p className="page-intro__subtitle">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="card">
        <div className="section-header">
          <p className="section-title management-section-title">
            {title}
          </p>

          {button && (
            <button
              className="btn"
              onClick={onButtonClick}
            >
              {button}
            </button>
          )}
        </div>

        <div className="management-table-wrapper">
          {children}
        </div>
      </div>
    </>
  )
}