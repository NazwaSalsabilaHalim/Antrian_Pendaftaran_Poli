/*
  Kumpulan komponen kecil yang dipakai berulang di halaman-halaman
  Panel Admin IT. Semua memakai class CSS yang SUDAH ADA di desain
  sistem antrian pendaftaran (card, stat-card, data-table, badge-*),
  jadi tidak ada style baru yang perlu ditambahkan.
*/

export function StatCard({ label, value, description }) {
  return (
    <div className="stat-card">
      <div className="stat-card__label">{label}</div>
      <div className="stat-card__value">{value}</div>

      {description && (
        <div className="muted" style={{ fontSize: 12 }}>
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

/*
  Modal generik untuk formulir Tambah/Edit — overlay gelap + blur di
  belakang, card di tengah (pakai class .card yang sama dengan komponen
  lain). Klik area luar atau tombol × untuk menutup.
*/
export function Modal({ title, onClose, children }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(22, 45, 38, 0.35)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        zIndex: 200,
      }}
    >
      <div
        className="card"
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 440, maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 18,
          }}
        >
          <p className="section-title" style={{ margin: 0 }}>
            {title}
          </p>

          <button
            onClick={onClose}
            aria-label="Tutup"
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: 20,
              lineHeight: 1,
              color: 'var(--muted)',
            }}
          >
            ×
          </button>
        </div>

        {children}
      </div>
    </div>
  )
}

export function RowActions({ onEdit, onDelete }) {
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <button
        onClick={onEdit}
        style={{
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--secondary)',
        }}
      >
        Edit
      </button>

      <button
        onClick={onDelete}
        style={{
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--danger)',
        }}
      >
        Hapus
      </button>
    </div>
  )
}

/*
  Layout standar untuk halaman "kelola data" (Petugas, Loket, Jenis
  Pendaftaran, Data Antrian) — page-intro di atas + satu card berisi
  tabel, sama seperti pola di Dashboard.jsx / Loket.jsx.
*/
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
          {eyebrow && <div className="page-intro__eyebrow">{eyebrow}</div>}

          <h1 className="page-intro__title">{title}</h1>

          {description && (
            <p className="page-intro__subtitle">{description}</p>
          )}
        </div>
      </div>

      <div className="card">
        <div className="section-header">
          <p className="section-title" style={{ margin: 0 }}>
            {title}
          </p>

          {button && (
            <button className="btn" onClick={onButtonClick}>
              {button}
            </button>
          )}
        </div>

        <div style={{ overflowX: 'auto' }}>{children}</div>
      </div>
    </>
  )
}