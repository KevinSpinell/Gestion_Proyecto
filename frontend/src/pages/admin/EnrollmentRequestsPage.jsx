import { useState, useEffect, useCallback } from 'react'
import { Avatar } from '../../components/Sidebar'

// ── Modal shell ───────────────────────────────────────────────────────────────
function Modal({ title, onClose, children, footer, size = '' }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal ${size}`} onClick={e => e.stopPropagation()}>
        <div className="modal-header purple">
          <div className="modal-title" style={{ color: 'white' }}>{title}</div>
          <button className="btn btn-ghost btn-sm" style={{ color: 'white' }} onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}

// ── Detail field helper ───────────────────────────────────────────────────────
function DetailRow({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--border-light, #F3F4F6)', fontSize: 13 }}>
      <span style={{ color: 'var(--text-muted)', minWidth: 160 }}>{label}</span>
      <span style={{ fontWeight: 500, color: 'var(--text-primary)', wordBreak: 'break-word' }}>{value || '—'}</span>
    </div>
  )
}

export default function EnrollmentRequestsPage() {
  const [students, setStudents] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')

  const [modal, setModal]       = useState(null)   // 'detail' | 'confirm-reject'
  const [selected, setSelected] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [feedback, setFeedback] = useState('')

  // ── Fetch pending students ─────────────────────────────────────────────────
  const fetchPending = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('http://localhost:3001/api/students/pending')
      if (!res.ok) throw new Error('Error al cargar las solicitudes')
      const data = await res.json()
      setStudents(data)
    } catch {
      setError('No se pudo cargar la lista. Verifica que el backend esté disponible.')
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchPending() }, [fetchPending])

  // ── Approve ────────────────────────────────────────────────────────────────
  const handleApprove = async (student) => {
    setActionLoading(true)
    try {
      const res = await fetch(`http://localhost:3001/api/students/${student._id}/approve`, { method: 'PUT' })
      if (!res.ok) throw new Error()
      setStudents(prev => prev.filter(s => s._id !== student._id))
      setModal(null)
      setFeedback(`✅ Inscripción de ${student.nombre} ${student.apellido} aprobada.`)
      setTimeout(() => setFeedback(''), 3500)
    } catch {
      setError('Error al aprobar. Intenta de nuevo.')
    }
    setActionLoading(false)
  }

  // ── Reject / Delete ────────────────────────────────────────────────────────
  const handleReject = async () => {
    if (!selected) return
    setActionLoading(true)
    try {
      const res = await fetch(`http://localhost:3001/api/students/${selected._id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setStudents(prev => prev.filter(s => s._id !== selected._id))
      setModal(null)
      setFeedback(`🗑️ Solicitud de ${selected.nombre} ${selected.apellido} eliminada.`)
      setTimeout(() => setFeedback(''), 3500)
    } catch {
      setError('Error al rechazar. Intenta de nuevo.')
    }
    setActionLoading(false)
  }

  const openDetail = (s) => { setSelected(s); setModal('detail') }
  const openRejectConfirm = (s) => { setSelected(s); setModal('confirm-reject') }
  const closeModal = () => { setModal(null); setSelected(null) }

  const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

  return (
    <>
      {/* ── TOPBAR ──────────────────────────────────────────────────────── */}
      <div className="topbar">
        <div>
          <div className="topbar-title">📋 Solicitudes de Inscripción</div>
          <div className="topbar-subtitle">
            {loading ? 'Cargando…' : `${students.length} solicitud${students.length !== 1 ? 'es' : ''} pendiente${students.length !== 1 ? 's' : ''}`}
          </div>
        </div>
        <div className="topbar-right">
          <button className="btn btn-secondary btn-sm" onClick={fetchPending} disabled={loading}>
            🔄 Actualizar
          </button>
        </div>
      </div>

      <div className="page-content fade-in">

        {/* ── Feedback banner ─────────────────────────────────────────────── */}
        {feedback && (
          <div style={{
            background: 'var(--success-bg, #ECFDF5)', border: '1px solid #A7F3D0',
            borderRadius: 'var(--radius-md)', padding: '10px 16px', fontSize: 13,
            color: 'var(--success, #065F46)', marginBottom: 16,
          }}>
            {feedback}
          </div>
        )}

        {/* ── Error banner ─────────────────────────────────────────────────── */}
        {error && (
          <div style={{
            background: 'var(--danger-bg)', border: '1px solid #FECACA',
            borderRadius: 'var(--radius-md)', padding: '10px 16px', fontSize: 13,
            color: 'var(--danger)', marginBottom: 16,
          }}>
            ⚠️ {error}
          </div>
        )}

        <div className="card">
          <div className="card-body">
            {loading ? (
              <div className="empty-state">
                <span className="empty-state-icon">⏳</span>
                <div className="empty-state-title">Cargando solicitudes…</div>
              </div>
            ) : students.length === 0 ? (
              <div className="empty-state">
                <span className="empty-state-icon">✅</span>
                <div className="empty-state-title">Sin solicitudes pendientes</div>
                <div className="empty-state-desc">Todas las inscripciones han sido procesadas.</div>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Estudiante</th>
                    <th>Documento</th>
                    <th>Correo</th>
                    <th>Institución</th>
                    <th>Fecha solicitud</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => {
                    const fullName = `${s.nombre} ${s.apellido}`
                    const avatarUser = {
                      id: s._id,
                      name: fullName,
                      avatar: fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
                    }
                    return (
                      <tr key={s._id} style={{ cursor: 'pointer' }} onClick={() => openDetail(s)}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Avatar user={avatarUser} size="sm" />
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 13 }}>{fullName}</div>
                              {s.telefono && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>📞 {s.telefono}</div>}
                            </div>
                          </div>
                        </td>
                        <td style={{ fontSize: 12, fontFamily: 'monospace' }}>{s.documento}</td>
                        <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.correo}</td>
                        <td style={{ fontSize: 12 }}>{s.institucion}</td>
                        <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{fmtDate(s.createdAt)}</td>
                        <td onClick={e => e.stopPropagation()}>
                          <div className="actions">
                            <button
                              className="btn btn-sm btn-success"
                              style={{ background: 'var(--success, #10B981)', color: 'white', border: 'none' }}
                              onClick={() => handleApprove(s)}
                              disabled={actionLoading}
                              title="Aprobar inscripción"
                            >
                              ✅ Aprobar
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => openRejectConfirm(s)}
                              disabled={actionLoading}
                              title="Rechazar solicitud"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* ── DETAIL MODAL ─────────────────────────────────────────────────── */}
      {modal === 'detail' && selected && (() => {
        const fullName = `${selected.nombre} ${selected.apellido}`
        return (
          <Modal
            title="👤 Detalle de Solicitud"
            onClose={closeModal}
            footer={
              <>
                <button className="btn btn-secondary" onClick={closeModal}>Cerrar</button>
                <button
                  className="btn btn-danger"
                  onClick={() => { closeModal(); openRejectConfirm(selected) }}
                >
                  🗑️ Rechazar
                </button>
                <button
                  className="btn btn-primary"
                  style={{ background: 'var(--success, #10B981)', border: 'none' }}
                  onClick={() => handleApprove(selected)}
                  disabled={actionLoading}
                >
                  {actionLoading ? '⏳ Aprobando…' : '✅ Aprobar Inscripción'}
                </button>
              </>
            }
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: 'var(--primary)', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, fontWeight: 700,
              }}>
                {fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{fullName}</div>
                <span className="badge badge-warning" style={{ background: '#FEF3C7', color: '#92400E', fontSize: 11 }}>
                  ⏳ Pendiente de aprobación
                </span>
              </div>
            </div>
            <DetailRow label="Documento"          value={selected.documento} />
            <DetailRow label="Teléfono"            value={selected.telefono} />
            <DetailRow label="Correo electrónico"  value={selected.correo} />
            <DetailRow label="Institución académica" value={selected.institucion} />
            <DetailRow label="Año de nacimiento"   value={selected.anioNacimiento} />
            <DetailRow label="Fecha de solicitud"  value={fmtDate(selected.createdAt)} />
          </Modal>
        )
      })()}

      {/* ── REJECT CONFIRM MODAL ─────────────────────────────────────────── */}
      {modal === 'confirm-reject' && selected && (
        <Modal
          title="🗑️ Rechazar Solicitud"
          onClose={closeModal}
          footer={
            <>
              <button className="btn btn-secondary" onClick={closeModal}>Cancelar</button>
              <button className="btn btn-danger" onClick={handleReject} disabled={actionLoading}>
                {actionLoading ? '⏳ Eliminando…' : 'Sí, Rechazar'}
              </button>
            </>
          }
        >
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            ¿Estás seguro de que deseas rechazar la solicitud de{' '}
            <strong>{selected.nombre} {selected.apellido}</strong>?
            Esta acción eliminará su registro permanentemente.
          </p>
        </Modal>
      )}
    </>
  )
}
