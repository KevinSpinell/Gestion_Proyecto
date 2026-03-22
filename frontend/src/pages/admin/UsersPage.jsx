import { useState, useEffect, useCallback } from 'react'
import { useApp } from '../../context/AppContext'
import { DOMAIN_AREAS } from '../../context/AppContext'
import { Avatar } from '../../components/Sidebar'

const API = 'http://localhost:3001'

// ── Reusable modal shell ──────────────────────────────────────────────────────
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

// ── RF-02 empty form state ────────────────────────────────────────────────────
const EMPTY_TEACHER_FORM = {
  documento: '', nombre: '', apellido: '',
  telefono: '', correo: '', clave: '',
  areaDominio: '', anioInicio: '',
}

const roleLabel = { admin: 'Admin', teacher: 'Profesor', student: 'Estudiante' }
const roleBadge = { admin: 'badge-danger', teacher: 'badge-primary', student: 'badge-info' }

export default function UsersPage() {
  const { createTeacher } = useApp()

  // ── DB users (from API) ────────────────────────────────────────────────────
  const [dbUsers, setDbUsers]     = useState([])
  const [loadingDb, setLoadingDb] = useState(true)
  const [dbError, setDbError]     = useState('')

  const fetchUsers = useCallback(async () => {
    setLoadingDb(true)
    setDbError('')
    try {
      const res  = await fetch(`${API}/api/users/all`)
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const data = await res.json()
      setDbUsers(data)
    } catch {
      setDbError('No se pudo cargar la lista. Verifica que el backend esté corriendo.')
    } finally {
      setLoadingDb(false)
    }
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  // ── Filters ────────────────────────────────────────────────────────────────
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const counts = {
    all:     dbUsers.length,
    admin:   dbUsers.filter(u => u.role === 'admin').length,
    teacher: dbUsers.filter(u => u.role === 'teacher').length,
    student: dbUsers.filter(u => u.role === 'student').length,
  }

  const filtered = dbUsers.filter(u => {
    if (filter !== 'all' && u.role !== filter) return false
    const q = search.toLowerCase()
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.documento || '').includes(q) ||
      (u.areaDominio || '').toLowerCase().includes(q) ||
      (u.institucion || '').toLowerCase().includes(q)
    )
  })

  // ── Modals ─────────────────────────────────────────────────────────────────
  const [modal, setModal]       = useState(null)
  const [selected, setSelected] = useState(null)
  const [form, setForm]         = useState(EMPTY_TEACHER_FORM)
  const [editForm, setEditForm] = useState({ name: '', email: '', password: '', estado: true })
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')
  const [loading, setLoading]   = useState(false)

  const openCreate = () => { setForm(EMPTY_TEACHER_FORM); setError(''); setSuccess(''); setModal('create') }
  const openEdit   = (u) => {
    setSelected(u)
    setEditForm({ name: u.name, email: u.email, password: '', estado: u.estado !== false })
    setError(''); setSuccess(''); setModal('edit')
  }
  const openDelete = (u) => { setSelected(u); setModal('delete') }
  const closeModal = () => { setModal(null); setSelected(null); setError(''); setSuccess('') }

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  // ── RF-02 create teacher ───────────────────────────────────────────────────
  const handleCreate = async () => {
    setError('')
    setLoading(true)
    const result = await createTeacher(form)
    setLoading(false)
    if (!result.success) { setError(result.error); return }
    setForm(EMPTY_TEACHER_FORM)
    setSuccess(`✅ Profesor "${result.user.name}" registrado correctamente.`)
    fetchUsers()
    setTimeout(() => closeModal(), 1800)
  }

  // ── Edit ───────────────────────────────────────────────────────────────────
  const handleEdit = async () => {
    if (!editForm.name || !editForm.email) { setError('Nombre y correo son requeridos'); return }
    try {
      if (selected.role === 'teacher') {
        const payload = { estado: editForm.estado }
        if (editForm.password) payload.clave = editForm.password
        const res  = await fetch(`${API}/api/teachers/${selected.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const json = await res.json()
        if (!res.ok) { setError(json.message || 'Error al actualizar el profesor'); return }
      }
      await fetchUsers()
      closeModal()
    } catch {
      setError('No se pudo conectar al servidor.')
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    try {
      const endpoint = selected.role === 'teacher'
        ? `${API}/api/teachers/${selected.id}`
        : `${API}/api/students/${selected.id}`
      await fetch(endpoint, { method: 'DELETE' })
      await fetchUsers()
      closeModal()
    } catch {
      closeModal()
    }
  }

  return (
    <>
      {/* ── TOPBAR ──────────────────────────────────────────────────────────── */}
      <div className="topbar">
        <div>
          <div className="topbar-title">👥 Gestión de Usuarios</div>
          <div className="topbar-subtitle">
            {loadingDb ? 'Cargando...' : `${counts.all} usuarios en el sistema`}
          </div>
        </div>
        <div className="topbar-right">
          <button className="btn btn-secondary btn-sm" onClick={fetchUsers} title="Actualizar lista">
            🔄 Actualizar
          </button>
          <button className="btn btn-primary" onClick={openCreate}>＋ Nuevo Profesor</button>
        </div>
      </div>

      {/* ── TABLE ───────────────────────────────────────────────────────────── */}
      <div className="page-content fade-in">
        <div className="card">
          <div className="card-body">

            {/* Filtros con conteo */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
              <div className="search-wrap" style={{ flex: 1 }}>
                <span className="search-icon">🔍</span>
                <input
                  className="form-input"
                  placeholder="Buscar por nombre, documento, correo, área, institución…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              {['all', 'admin', 'teacher', 'student'].map(r => (
                <button
                  key={r}
                  className={`btn btn-sm ${filter === r ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFilter(r)}
                >
                  {r === 'all' ? 'Todos' : roleLabel[r]}
                  <span style={{
                    marginLeft: 6, background: 'rgba(255,255,255,0.25)',
                    borderRadius: 10, padding: '1px 7px', fontSize: 11
                  }}>
                    {counts[r]}
                  </span>
                </button>
              ))}
            </div>

            {/* Error de red */}
            {dbError && (
              <div style={{ background: 'var(--danger-bg)', border: '1px solid #FECACA', borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: 12, fontSize: 13, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 8 }}>
                ⚠️ {dbError}
                <button className="btn btn-sm btn-secondary" style={{ marginLeft: 'auto' }} onClick={fetchUsers}>Reintentar</button>
              </div>
            )}

            {/* Spinner de carga */}
            {loadingDb ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                <span className="spinner" style={{ marginRight: 8 }} />Cargando usuarios desde la base de datos…
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Documento</th>
                    <th>Email</th>
                    <th>Área / Institución</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={7}><div className="empty-state"><span className="empty-state-icon">👤</span><div className="empty-state-title">No hay usuarios</div></div></td></tr>
                  ) : filtered.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Avatar user={u} size="sm" />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{u.name}</div>
                            {u.telefono && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>📞 {u.telefono}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: 12, fontFamily: 'monospace' }}>{u.documento || '—'}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{u.email}</td>
                      <td>
                        {u.areaDominio
                          ? <span className="badge badge-primary">{u.areaDominio}</span>
                          : u.institucion
                            ? <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>🏫 {u.institucion}</span>
                            : <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>—</span>
                        }
                      </td>
                      <td><span className={`badge ${roleBadge[u.role]}`}>{roleLabel[u.role]}</span></td>
                      <td>
                        {u.role === 'student'
                          ? (
                            <span className={`badge ${u.aprobado ? (u.estado !== false ? 'badge-success' : 'badge-gray') : 'badge-warning'}`}>
                              {!u.aprobado ? 'Pendiente' : u.estado !== false ? 'Activo' : 'Inactivo'}
                            </span>
                          )
                          : u.role === 'teacher'
                            ? <span className={`badge ${u.estado !== false ? 'badge-success' : 'badge-gray'}`}>{u.estado !== false ? 'Activo' : 'Inactivo'}</span>
                            : <span className="badge badge-success">Activo</span>
                        }
                      </td>
                      <td>
                        <div className="actions">
                          <button className="btn btn-sm btn-secondary" onClick={() => openEdit(u)}>✏️ Editar</button>
                          {u.role !== 'admin' && (
                            <button className="btn btn-sm btn-danger" onClick={() => openDelete(u)}>🗑️</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* ── CREAR PROFESOR MODAL (RF-02) ────────────────────────────────────── */}
      {modal === 'create' && (
        <Modal
          title="➕ Nuevo Profesor"
          size="modal-lg"
          onClose={closeModal}
          footer={
            <>
              <button className="btn btn-secondary" onClick={closeModal}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleCreate} disabled={loading}>
                {loading ? '⏳ Guardando...' : 'Crear Profesor'}
              </button>
            </>
          }
        >
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Documento *</label>
              <input className="form-input" value={form.documento} onChange={set('documento')} placeholder="Ej: 10234567890" maxLength={11} inputMode="numeric" />
              <span className="form-hint">Solo números, entre 8 y 11 dígitos</span>
            </div>
            <div className="form-group">
              <label className="form-label">Teléfono *</label>
              <input className="form-input" value={form.telefono} onChange={set('telefono')} placeholder="Ej: 3001234567" maxLength={10} inputMode="numeric" />
              <span className="form-hint">Solo números, exactamente 10 dígitos</span>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Nombre *</label>
              <input className="form-input" value={form.nombre} onChange={set('nombre')} placeholder="Ej: Carlos" maxLength={32} />
            </div>
            <div className="form-group">
              <label className="form-label">Apellido *</label>
              <input className="form-input" value={form.apellido} onChange={set('apellido')} placeholder="Ej: Méndez Ríos" maxLength={32} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Correo electrónico *</label>
            <input className="form-input" type="email" value={form.correo} onChange={set('correo')} placeholder="Ej: cmendez@institucion.edu" />
          </div>
          <div className="form-group">
            <label className="form-label">Clave *</label>
            <input className="form-input" type="password" value={form.clave} onChange={set('clave')} placeholder="Mín. 8 caracteres" />
            <span className="form-hint">Se almacenará cifrada</span>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Área de dominio *</label>
              <select className="form-select" value={form.areaDominio} onChange={set('areaDominio')}>
                <option value="">— Seleccionar área —</option>
                {DOMAIN_AREAS.map(area => <option key={area} value={area}>{area}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Año de inicio *</label>
              <input className="form-input" value={form.anioInicio} onChange={set('anioInicio')} placeholder="Ej: 2024" maxLength={4} inputMode="numeric" />
              <span className="form-hint">Solo números, exactamente 4 dígitos</span>
            </div>
          </div>
          {error   && <div className="form-error" style={{ padding: '10px 14px', background: 'var(--danger-bg)', borderRadius: 'var(--radius-md)', border: '1px solid #FECACA' }}>⚠️ {error}</div>}
          {success && <div style={{ fontSize: 13, color: 'var(--success)', padding: '10px 14px', background: 'var(--success-bg)', borderRadius: 'var(--radius-md)', border: '1px solid #A7F3D0' }}>{success}</div>}
        </Modal>
      )}

      {/* ── EDITAR MODAL ───────────────────────────────────────────────────── */}
      {modal === 'edit' && selected && (
        <Modal
          title="✏️ Editar Usuario"
          onClose={closeModal}
          footer={
            <>
              <button className="btn btn-secondary" onClick={closeModal}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleEdit}>Guardar Cambios</button>
            </>
          }
        >
          <div className="form-group">
            <label className="form-label">Nombre completo</label>
            <input className="form-input" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Correo electrónico</label>
            <input className="form-input" type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Nueva contraseña (opcional)</label>
            <input className="form-input" type="password" value={editForm.password} onChange={e => setEditForm({ ...editForm, password: e.target.value })} placeholder="Dejar vacío para no cambiar" />
          </div>
          {selected.role === 'teacher' && (
            <div className="form-group">
              <label className="form-label">Estado</label>
              <select className="form-select" value={editForm.estado ? 'true' : 'false'} onChange={e => setEditForm({ ...editForm, estado: e.target.value === 'true' })}>
                <option value="true">✅ Activo</option>
                <option value="false">⛔ Inactivo</option>
              </select>
              <span className="form-hint">Controla si el profesor puede acceder al sistema</span>
            </div>
          )}
          {error && <div className="form-error">⚠️ {error}</div>}
        </Modal>
      )}

      {/* ── ELIMINAR MODAL ─────────────────────────────────────────────────── */}
      {modal === 'delete' && selected && (
        <Modal
          title="🗑️ Eliminar Usuario"
          onClose={closeModal}
          footer={
            <>
              <button className="btn btn-secondary" onClick={closeModal}>Cancelar</button>
              <button className="btn btn-danger" onClick={handleDelete}>Sí, Eliminar</button>
            </>
          }
        >
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            ¿Estás seguro de que deseas eliminar a <strong>{selected.name}</strong>? Esta acción no se puede deshacer.
          </p>
        </Modal>
      )}
    </>
  )
}
