import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { Avatar } from '../../components/Sidebar'

function Modal({ title, onClose, children, footer }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-header purple">
          <div className="modal-title" style={{ color: 'white' }}>➕ {title}</div>
          <button className="btn btn-ghost btn-sm" style={{ color: 'white' }} onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}

export default function CoursesPage() {
  const { users, courses, classes, createCourse, updateCourse, deleteCourse, enrollStudent } = useApp()
  const [modal, setModal]     = useState(null)
  const [selected, setSelected] = useState(null)
  const [search, setSearch]   = useState('')
  const [form, setForm]       = useState({ name: '', description: '', category: '', teacherId: '' })
  const [error, setError]     = useState('')

  const teachers = users.filter(u => u.role === 'teacher')
  const students = users.filter(u => u.role === 'student')

  const filtered = courses.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => { setForm({ name: '', description: '', category: '', teacherId: '' }); setError(''); setModal('create') }
  const openEdit   = (c) => { setSelected(c); setForm({ name: c.name, description: c.description, category: c.category, teacherId: c.teacherId || '' }); setError(''); setModal('edit') }
  const openDetail = (c) => { setSelected(c); setModal('detail') }
  const closeModal = () => { setModal(null); setSelected(null); setError('') }

  const handleCreate = () => {
    if (!form.name) { setError('El nombre del curso es requerido'); return }
    createCourse(form)
    closeModal()
  }

  const handleEdit = () => {
    if (!form.name) { setError('El nombre del curso es requerido'); return }
    updateCourse(selected.id, form)
    closeModal()
  }

  const handleDelete = (id) => {
    if (window.confirm('¿Eliminar este curso y todas sus clases?')) deleteCourse(id)
  }

  const getCourseClasses = (courseId) => classes.filter(cl => cl.courseId === courseId)

  const CATEGORIES = ['Informática', 'Matemáticas', 'Ciencias', 'Historia', 'Idiomas', 'Arte', 'Ingeniería', 'General']
  const THUMB_EMOJIS = { Informática: '💻', Matemáticas: '📐', Ciencias: '🔬', Historia: '📚', Idiomas: '🌍', Arte: '🎨', Ingeniería: '⚙️', General: '📖' }

  const DetailModal = () => {
    if (!selected) return null
    const course      = courses.find(c => c.id === selected.id) || selected
    const teacher     = users.find(u => u.id === course.teacherId)
    const enrolled    = students.filter(s => course.studentIds.includes(s.id))
    const notEnrolled = students.filter(s => !course.studentIds.includes(s.id))
    const courseClasses = getCourseClasses(course.id)

    return (
      <div className="modal-overlay" onClick={closeModal}>
        <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <div className="modal-title">📚 {course.name}</div>
            <button className="btn btn-ghost btn-sm" onClick={closeModal}>✕</button>
          </div>
          <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {/* Left: info */}
              <div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>{course.description}</p>
                <div className="report-row"><span className="report-label">Categoría</span><span className="badge badge-primary">{course.category}</span></div>
                <div className="report-row"><span className="report-label">Profesor</span><span>{teacher ? teacher.name : <span className="text-muted">Sin asignar</span>}</span></div>
                <div className="report-row"><span className="report-label">Estudiantes</span><span className="report-value">{enrolled.length}</span></div>
                <div className="report-row"><span className="report-label">Clases</span><span className="report-value">{courseClasses.length}</span></div>

                {/* Assign teacher */}
                <div className="form-group" style={{ marginTop: 16 }}>
                  <label className="form-label">Asignar Profesor</label>
                  <select className="form-select" value={course.teacherId || ''} onChange={e => updateCourse(course.id, { teacherId: e.target.value || null })}>
                    <option value="">— Sin asignar —</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Right: students */}
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Estudiantes inscritos ({enrolled.length})</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 180, overflowY: 'auto' }}>
                  {enrolled.map(s => (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-page)' }}>
                      <Avatar user={s} size="sm" />
                      <span style={{ fontSize: 12, flex: 1 }}>{s.name}</span>
                    </div>
                  ))}
                  {enrolled.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Sin estudiantes aún</div>}
                </div>

                {notEnrolled.length > 0 && (
                  <>
                    <div style={{ fontWeight: 600, fontSize: 13, marginTop: 14, marginBottom: 8 }}>Agregar estudiante</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {notEnrolled.map(s => (
                        <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Avatar user={s} size="sm" />
                          <span style={{ fontSize: 12, flex: 1 }}>{s.name}</span>
                          <button className="btn btn-sm btn-success" onClick={() => enrollStudent(course.id, s.id)}>+ Inscribir</button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="modal-footer"><button className="btn btn-secondary" onClick={closeModal}>Cerrar</button></div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="topbar">
        <div>
          <div className="topbar-title">📚 Gestión de Cursos</div>
          <div className="topbar-subtitle">{courses.length} cursos en el sistema</div>
        </div>
        <div className="topbar-right">
          <button className="btn btn-primary" onClick={openCreate}>➕ Nuevo Curso</button>
        </div>
      </div>

      <div className="page-content fade-in">
        <div className="card">
          <div className="card-body">
            <div className="search-wrap" style={{ marginBottom: 16 }}>
              <span className="search-icon">🔍</span>
              <input className="form-input" placeholder="Buscar cursos..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>Curso</th>
                  <th>Categoría</th>
                  <th>Profesor</th>
                  <th>Estudiantes</th>
                  <th>Clases</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7}><div className="empty-state"><span className="empty-state-icon">📚</span><div className="empty-state-title">Sin cursos</div></div></td></tr>
                ) : filtered.map(c => {
                  const teacher      = users.find(u => u.id === c.teacherId)
                  const courseClasses = getCourseClasses(c.id)
                  return (
                    <tr key={c.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'var(--primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                            {THUMB_EMOJIS[c.category] || '📖'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.description?.slice(0, 50)}...</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="badge badge-primary">{c.category}</span></td>
                      <td>
                        {teacher ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Avatar user={teacher} size="sm" />
                            <span style={{ fontSize: 12 }}>{teacher.name}</span>
                          </div>
                        ) : <span className="badge badge-warning">Sin asignar</span>}
                      </td>
                      <td><span className="badge badge-info">{c.studentIds.length} 👥</span></td>
                      <td><span className="badge badge-gray">{courseClasses.length} clases</span></td>
                      <td><span className={`badge ${c.status === 'active' ? 'badge-success' : 'badge-gray'}`}>{c.status === 'active' ? 'Activo' : 'Inactivo'}</span></td>
                      <td>
                        <div className="actions">
                          <button className="btn btn-sm btn-secondary" onClick={() => openDetail(c)}>👁️ Ver</button>
                          <button className="btn btn-sm btn-secondary" onClick={() => openEdit(c)}>✏️</button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(c.id)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modal === 'create' && (
        <Modal title="Nuevo Curso" onClose={closeModal}
          footer={<><button className="btn btn-secondary" onClick={closeModal}>Cancelar</button><button className="btn btn-primary" onClick={handleCreate}>Crear Curso</button></>}>
          <div className="form-group"><label className="form-label">Nombre del curso *</label><input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ej: Cálculo Diferencial" /></div>
          <div className="form-group"><label className="form-label">Descripción</label><textarea className="form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Descripción del curso..." /></div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Categoría</label>
              <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                <option value="">— Seleccionar —</option>
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Profesor</label>
              <select className="form-select" value={form.teacherId} onChange={e => setForm({ ...form, teacherId: e.target.value })}>
                <option value="">— Sin asignar —</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>
          {error && <div className="form-error">⚠️ {error}</div>}
        </Modal>
      )}

      {modal === 'edit' && selected && (
        <Modal title={`Editar: ${selected.name}`} onClose={closeModal}
          footer={<><button className="btn btn-secondary" onClick={closeModal}>Cancelar</button><button className="btn btn-primary" onClick={handleEdit}>Guardar</button></>}>
          <div className="form-group"><label className="form-label">Nombre</label><input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Descripción</label><textarea className="form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Categoría</label>
              <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Profesor</label>
              <select className="form-select" value={form.teacherId} onChange={e => setForm({ ...form, teacherId: e.target.value })}>
                <option value="">— Sin asignar —</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>
          {error && <div className="form-error">⚠️ {error}</div>}
        </Modal>
      )}

      {modal === 'detail' && <DetailModal />}
    </>
  )
}
