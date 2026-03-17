import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { Avatar } from '../../components/Sidebar'

function Modal({ title, onClose, children, footer }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}

export default function UsersPage() {
  const { users, createTeacher, updateUser, deleteUser } = useApp()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null) // 'create' | 'edit' | 'delete'
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', username: '', password: '' })
  const [error, setError] = useState('')

  const filtered = users.filter(u => {
    if (filter !== 'all' && u.role !== filter) return false
    const q = search.toLowerCase()
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.username.toLowerCase().includes(q)
  })

  const openCreate = () => { setForm({ name: '', email: '', username: '', password: '' }); setError(''); setModal('create') }
  const openEdit   = (u) => { setSelected(u); setForm({ name: u.name, email: u.email, username: u.username, password: '' }); setError(''); setModal('edit') }
  const openDelete = (u) => { setSelected(u); setModal('delete') }
  const closeModal = () => { setModal(null); setSelected(null); setError('') }

  const handleCreate = () => {
    if (!form.name || !form.email || !form.username || !form.password) { setError('Todos los campos son requeridos'); return }
    const result = createTeacher(form)
    if (!result.success) { setError(result.error); return }
    closeModal()
  }

  const handleEdit = () => {
    if (!form.name || !form.email) { setError('Nombre y correo son requeridos'); return }
    const updates = { name: form.name, email: form.email }
    if (form.password) updates.password = form.password
    updateUser(selected.id, updates)
    closeModal()
  }

  const handleDelete = () => { deleteUser(selected.id); closeModal() }

  const roleLabel = { admin: 'Admin', teacher: 'Profesor', student: 'Estudiante' }
  const roleBadge = { admin: 'badge-danger', teacher: 'badge-primary', student: 'badge-info' }

  return (
    <>
      <div className="topbar">
        <div>
          <div className="topbar-title">👥 Gestión de Usuarios</div>
          <div className="topbar-subtitle">{users.length} usuarios en el sistema</div>
        </div>
        <div className="topbar-right">
          <button className="btn btn-primary" onClick={openCreate}>＋ Nuevo Profesor</button>
        </div>
      </div>

      <div className="page-content fade-in">
        <div className="card">
          <div className="card-body">
            {/* Filters */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
              <div className="search-wrap" style={{ flex: 1 }}>
                <span className="search-icon">🔍</span>
                <input className="form-input" placeholder="Buscar usuarios..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              {['all', 'admin', 'teacher', 'student'].map(r => (
                <button key={r} className={`btn btn-sm ${filter === r ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(r)}>
                  {r === 'all' ? 'Todos' : roleLabel[r]}
                </button>
              ))}
            </div>

            {/* Table */}
            <table className="data-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Email</th>
                  <th>Username</th>
                  <th>Rol</th>
                  <th>Creado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6}><div className="empty-state"><span className="empty-state-icon">👤</span><div className="empty-state-title">No hay usuarios</div></div></td></tr>
                ) : filtered.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar user={u} size="sm" />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{u.name}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td style={{ fontSize: 12, fontFamily: 'monospace' }}>{u.username}</td>
                    <td><span className={`badge ${roleBadge[u.role]}`}>{roleLabel[u.role]}</span></td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.createdAt}</td>
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
          </div>
        </div>
      </div>

      {/* Create modal */}
      {modal === 'create' && (
        <Modal title="➕ Nuevo Profesor" onClose={closeModal}
          footer={<><button className="btn btn-secondary" onClick={closeModal}>Cancelar</button><button className="btn btn-primary" onClick={handleCreate}>Crear Profesor</button></>}>
          <div className="form-group"><label className="form-label">Nombre completo</label><input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Prof. Nombre Apellido" /></div>
          <div className="form-group"><label className="form-label">Correo electrónico</label><input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="nombre@classai.edu" /></div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Username</label><input className="form-input" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="prof123" /></div>
            <div className="form-group"><label className="form-label">Contraseña temporal</label><input className="form-input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" /></div>
          </div>
          {error && <div className="form-error">⚠️ {error}</div>}
        </Modal>
      )}

      {/* Edit modal */}
      {modal === 'edit' && selected && (
        <Modal title="✏️ Editar Usuario" onClose={closeModal}
          footer={<><button className="btn btn-secondary" onClick={closeModal}>Cancelar</button><button className="btn btn-primary" onClick={handleEdit}>Guardar Cambios</button></>}>
          <div className="form-group"><label className="form-label">Nombre completo</label><input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Correo electrónico</label><input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Nueva contraseña (opcional)</label><input className="form-input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Dejar vacío para no cambiar" /></div>
          {error && <div className="form-error">⚠️ {error}</div>}
        </Modal>
      )}

      {/* Delete modal */}
      {modal === 'delete' && selected && (
        <Modal title="🗑️ Eliminar Usuario" onClose={closeModal}
          footer={<><button className="btn btn-secondary" onClick={closeModal}>Cancelar</button><button className="btn btn-danger" onClick={handleDelete}>Sí, Eliminar</button></>}>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            ¿Estás seguro de que deseas eliminar a <strong>{selected.name}</strong>? Esta acción no se puede deshacer.
          </p>
        </Modal>
      )}
    </>
  )
}
