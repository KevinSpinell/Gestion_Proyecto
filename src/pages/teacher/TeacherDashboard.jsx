import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { Avatar } from '../../components/Sidebar'

function CreateClassModal({ courseId, onClose }) {
  const { createClass, activateClass, setActivePage, setActiveClassId } = useApp()
  const [form, setForm] = useState({ title: '', date: new Date().toISOString().split('T')[0], startTime: '', sessionType: 'Live' })
  const [error, setError] = useState('')

  const handleCreate = () => {
    if (!form.title) { setError('El título es requerido'); return }
    const result = createClass({ ...form, courseId })
    if (result.success) {
      activateClass(result.class.id)
      setActiveClassId(result.class.id)
      setActivePage('classroom')
      onClose()
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header purple">
          <div className="modal-title" style={{ color: 'white' }}>➕ Crear Nueva Clase</div>
          <button className="btn btn-ghost btn-sm" style={{ color: 'white' }} onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">TÍTULO DE LA CLASE</label>
            <input className="form-input" placeholder="Ej: Relatividad Especial — Workshop" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} autoFocus />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">FECHA</label>
              <input className="form-input" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">HORA DE INICIO</label>
              <input className="form-input" type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">TIPO DE SESIÓN</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['Live', 'In-Person', 'Workshop'].map(type => (
                <button key={type} type="button"
                  className={`btn ${form.sessionType === type ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => setForm({ ...form, sessionType: type })}
                >
                  {type === 'Live' ? '📡 Live' : type === 'In-Person' ? '🏫 Presencial' : '🔧 Workshop'}
                </button>
              ))}
            </div>
          </div>
          <div style={{ background: 'var(--primary-bg)', border: '1px solid var(--primary-border)', borderRadius: 'var(--radius-md)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="checkbox" defaultChecked id="autoRecord" />
            <label htmlFor="autoRecord" style={{ fontSize: 13, cursor: 'pointer' }}>
              <strong>Auto-guardar transcripción</strong><br />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>La transcripción se guardará automáticamente al finalizar la clase</span>
            </label>
          </div>
          {error && <div className="form-error">⚠️ {error}</div>}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleCreate}>🚀 Iniciar Clase</button>
        </div>
      </div>
    </div>
  )
}

export default function TeacherDashboard() {
  const { currentUser, classes, courses, users, getCoursesForTeacher, getClassesForCourse, activateClass, setActivePage, setActiveClassId } = useApp()
  const [showCreateModal, setShowCreateModal] = useState(null) // courseId
  const [tab, setTab] = useState('active')

  const myCourses = getCoursesForTeacher(currentUser.id)
  const myClasses = myCourses.flatMap(c => getClassesForCourse(c.id))
  const activeClasses = myClasses.filter(cl => cl.isActive)
  const pastClasses   = myClasses.filter(cl => !cl.isActive && cl.savedTranscription)

  const enterClass = (classId) => {
    setActiveClassId(classId)
    setActivePage('classroom')
  }

  const THUMB = { Informática: '💻', Matemáticas: '📐', Ciencias: '🔬', Historia: '📚', Idiomas: '🌍', Arte: '🎨', Ingeniería: '⚙️', General: '📖' }

  return (
    <>
      <div className="topbar">
        <div>
          <div className="topbar-title">🏠 Panel del Profesor</div>
          <div className="topbar-subtitle">Hola, {currentUser.name.split(' ')[0]} 👋 — {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
        </div>
        <div className="topbar-right">
          <span className="badge badge-primary">Profesor</span>
        </div>
      </div>

      <div className="page-content fade-in">
        {/* Stats */}
        <div className="stats-grid">
          {[
            { label: 'Mis Cursos',   value: myCourses.length,    icon: '📚', bg: '#EDE9FE', color: '#7C3AED' },
            { label: 'Clases Dadas', value: myClasses.length,    icon: '🎓', bg: '#EFF6FF', color: '#2563EB' },
            { label: 'En Vivo',      value: activeClasses.length, icon: '🔴', bg: '#FEF2F2', color: '#DC2626' },
            { label: 'Guardadas',    value: pastClasses.length,  icon: '💾', bg: '#ECFDF5', color: '#059669' },
          ].map(s => (
            <div className="stat-card" key={s.label}>
              <div className="stat-card-top">
                <div className="stat-card-label">{s.label}</div>
                <div className="stat-card-icon" style={{ background: s.bg }}>{s.icon}</div>
              </div>
              <div className="stat-card-value">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Active Classes */}
        {activeClasses.length > 0 && (
          <div className="card" style={{ marginBottom: 20, borderColor: 'var(--primary-border)', borderWidth: 2 }}>
            <div className="card-header">
              <div>
                <div className="card-title" style={{ color: 'var(--primary)' }}>🔴 Clases activas ahora</div>
                <div className="card-subtitle">Hay {activeClasses.length} clase(s) en vivo</div>
              </div>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {activeClasses.map(cl => {
                const course = myCourses.find(c => c.id === cl.courseId)
                return (
                  <div key={cl.id} className="lobby-card">
                    <div className="lobby-icon" style={{ background: '#FEF2F2' }}>🔴</div>
                    <div className="lobby-info">
                      <div className="lobby-title">{cl.title}</div>
                      <div className="lobby-sub">{course?.name}</div>
                      <div className="lobby-meta">
                        <span>👥 {cl.participantIds.length} conectados</span>
                        <span>❓ {cl.questions.filter(q => q.status === 'pending').length} preguntas pendientes</span>
                      </div>
                    </div>
                    <button className="btn btn-primary" onClick={() => enterClass(cl.id)}>→ Entrar</button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* My Courses */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Mis Cursos Asignados</div>
            <div className="card-subtitle">{myCourses.length} cursos</div>
          </div>
          <div className="card-body">
            {myCourses.length === 0 ? (
              <div className="empty-state">
                <span className="empty-state-icon">📚</span>
                <div className="empty-state-title">Sin cursos asignados</div>
                <div className="empty-state-desc">El administrador aún no te ha asignado ningún curso</div>
              </div>
            ) : (
              <div className="course-grid">
                {myCourses.map(c => {
                  const courseClasses = getClassesForCourse(c.id)
                  const hasActive     = courseClasses.some(cl => cl.isActive)
                  return (
                    <div key={c.id} className="course-card">
                      <div className="course-card-thumb" style={{ background: hasActive ? '#FEF2F2' : 'var(--primary-bg)' }}>
                        {THUMB[c.category] || '📖'}
                      </div>
                      <div className="course-card-body">
                        <div className="course-card-cat">{c.category}</div>
                        <div className="course-card-name">{c.name}</div>
                        <div className="course-card-desc">{c.description}</div>
                        <div style={{ display: 'flex', gap: 6, marginBottom: 12, fontSize: 11 }}>
                          <span className="badge badge-info">👥 {c.studentIds.length} estudiantes</span>
                          <span className="badge badge-gray">🎓 {courseClasses.length} clases</span>
                          {hasActive && <span className="badge badge-live">🔴 En Vivo</span>}
                        </div>
                        <button className="btn btn-primary w-full" onClick={() => setShowCreateModal(c.id)}>
                          ➕ Nueva Clase
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Class History */}
        {myClasses.length > 0 && (
          <div className="card" style={{ marginTop: 20 }}>
            <div className="card-header">
              <div className="card-title">📋 Historial de Clases</div>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <table className="data-table">
                <thead>
                  <tr><th>Clase</th><th>Curso</th><th>Fecha</th><th>Asistentes</th><th>Estado</th><th>Acciones</th></tr>
                </thead>
                <tbody>
                  {myClasses.slice().reverse().map(cl => {
                    const course = myCourses.find(c => c.id === cl.courseId)
                    return (
                      <tr key={cl.id}>
                        <td><div style={{ fontWeight: 600 }}>{cl.title}</div></td>
                        <td style={{ fontSize: 12 }}>{course?.name}</td>
                        <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{cl.date} {cl.startTime}</td>
                        <td><span className="badge badge-primary">{cl.attendance.length} 👥</span></td>
                        <td>
                          <span className={`badge ${cl.isActive ? 'badge-live' : cl.savedTranscription ? 'badge-success' : 'badge-gray'}`}>
                            {cl.isActive ? '🔴 En Vivo' : cl.savedTranscription ? '✅ Guardada' : 'Sin transcript'}
                          </span>
                        </td>
                        <td>
                          {cl.isActive
                            ? <button className="btn btn-sm btn-primary" onClick={() => enterClass(cl.id)}>→ Retomar</button>
                            : <button className="btn btn-sm btn-secondary" disabled>Finalizada</button>
                          }
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateClassModal courseId={showCreateModal} onClose={() => setShowCreateModal(null)} />
      )}
    </>
  )
}
