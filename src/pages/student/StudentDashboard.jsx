import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { Avatar } from '../../components/Sidebar'

const THUMB = { Informática: '💻', Matemáticas: '📐', Ciencias: '🔬', Historia: '📚', Idiomas: '🌍', Arte: '🎨', Ingeniería: '⚙️', General: '📖' }

export default function StudentDashboard() {
  const { currentUser, users, courses, classes, enrollStudent, unenrollStudent, getCoursesForStudent, getActiveClasses, joinClass, setActivePage, setActiveClassId } = useApp()
  const [tab, setTab] = useState('my')
  const [search, setSearch] = useState('')

  const myCourses    = getCoursesForStudent(currentUser.id)
  const allCourses   = courses.filter(c => c.status === 'active')
  const activeClasses = getActiveClasses()

  // Active classes I'm enrolled in
  const myActiveClasses = activeClasses.filter(cl => {
    const course = courses.find(c => c.id === cl.courseId)
    return course && course.studentIds.includes(currentUser.id)
  })

  const enterClass = (classId) => {
    joinClass(classId, currentUser.id)
    setActiveClassId(classId)
    setActivePage('classroom')
  }

  const explored = allCourses.filter(c =>
    !c.studentIds.includes(currentUser.id) &&
    (c.name.toLowerCase().includes(search.toLowerCase()) || c.category.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <>
      <div className="topbar">
        <div>
          <div className="topbar-title">🏠 Portal del Estudiante</div>
          <div className="topbar-subtitle">Hola, {currentUser.name.split(' ')[0]} 👋</div>
        </div>
        <div className="topbar-right">
          <span className="badge badge-info">Estudiante</span>
        </div>
      </div>

      <div className="page-content fade-in">
        {/* Stats */}
        <div className="stats-grid">
          {[
            { label: 'Mis Cursos',    value: myCourses.length,     icon: '📚', bg: '#EDE9FE', color: '#7C3AED' },
            { label: 'Clases Activas',value: myActiveClasses.length,icon: '🔴', bg: '#FEF2F2', color: '#DC2626' },
            { label: 'Clases Guardadas', value: classes.filter(cl => cl.attendance.some(a => a.userId === currentUser.id) && cl.savedTranscription).length, icon: '💾', bg: '#ECFDF5', color: '#059669' },
            { label: 'Cursos Disponibles', value: explored.length, icon: '🔍', bg: '#EFF6FF', color: '#2563EB' },
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

        {/* Live classes */}
        {myActiveClasses.length > 0 && (
          <div className="card" style={{ marginBottom: 20, borderColor: 'var(--danger)', borderWidth: 2 }}>
            <div className="card-header">
              <div>
                <div className="card-title" style={{ color: 'var(--danger)' }}>🔴 Clases en vivo ahora</div>
                <div className="card-subtitle">Puedes unirte a cualquiera de estas sesiones activas</div>
              </div>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {myActiveClasses.map(cl => {
                const course  = courses.find(c => c.id === cl.courseId)
                const teacher = users.find(u => u.id === course?.teacherId)
                return (
                  <div key={cl.id} className="lobby-card">
                    <div className="lobby-icon" style={{ background: '#FEF2F2' }}>🔴</div>
                    <div className="lobby-info">
                      <div className="lobby-title">{cl.title}</div>
                      <div className="lobby-sub">{course?.name}</div>
                      <div className="lobby-meta">
                        <span>👨‍🏫 {teacher?.name || 'Profesor'}</span>
                        <span>👥 {cl.participantIds.length} conectados</span>
                        <span>🕐 {cl.startTime || 'En curso'}</span>
                      </div>
                    </div>
                    <button className="btn btn-primary" onClick={() => enterClass(cl.id)}>→ Unirme</button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="tabs">
          <button className={`tab-btn ${tab === 'my' ? 'active' : ''}`} onClick={() => setTab('my')}>
            Mis Cursos <span className="tab-count">{myCourses.length}</span>
          </button>
          <button className={`tab-btn ${tab === 'explore' ? 'active' : ''}`} onClick={() => setTab('explore')}>
            Explorar Cursos <span className="tab-count">{explored.length}</span>
          </button>
          <button className={`tab-btn ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}>
            Mi Historial
          </button>
        </div>

        {/* MY COURSES */}
        {tab === 'my' && (
          myCourses.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state-icon">📚</span>
              <div className="empty-state-title">Aún no estás inscrito en ningún curso</div>
              <div className="empty-state-desc">Explora los cursos disponibles y únete</div>
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setTab('explore')}>Explorar Cursos →</button>
            </div>
          ) : (
            <div className="course-grid">
              {myCourses.map(c => {
                const teacher     = users.find(u => u.id === c.teacherId)
                const courseClasses = classes.filter(cl => cl.courseId === c.id)
                const hasActive    = courseClasses.some(cl => cl.isActive)
                const myAttended  = courseClasses.filter(cl => cl.attendance.some(a => a.userId === currentUser.id))
                return (
                  <div key={c.id} className="course-card">
                    <div className="course-card-thumb" style={{ background: hasActive ? '#FEF2F2' : 'var(--primary-bg)' }}>
                      {THUMB[c.category] || '📖'}
                    </div>
                    <div className="course-card-body">
                      <div className="course-card-cat">{c.category}</div>
                      <div className="course-card-name">{c.name}</div>
                      <div className="course-card-desc">{c.description}</div>
                      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                        {hasActive && <span className="badge badge-live">🔴 En Vivo</span>}
                        <span className="badge badge-gray">🎓 {myAttended.length} clases asistidas</span>
                      </div>
                      <div className="course-card-footer">
                        <div className="course-card-teacher">
                          {teacher && <Avatar user={teacher} size="sm" />}
                          <span>{teacher?.name || 'Sin profesor'}</span>
                        </div>
                        <button className="btn btn-sm btn-danger" onClick={() => unenrollStudent(c.id, currentUser.id)}>Salir</button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        )}

        {/* EXPLORE */}
        {tab === 'explore' && (
          <>
            <div className="search-wrap" style={{ marginBottom: 16 }}>
              <span className="search-icon">🔍</span>
              <input className="form-input" placeholder="Buscar cursos disponibles..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {explored.length === 0 ? (
              <div className="empty-state">
                <span className="empty-state-icon">🔍</span>
                <div className="empty-state-title">No hay cursos disponibles</div>
              </div>
            ) : (
              <div className="course-grid">
                {explored.map(c => {
                  const teacher = users.find(u => u.id === c.teacherId)
                  return (
                    <div key={c.id} className="course-card">
                      <div className="course-card-thumb" style={{ background: 'var(--primary-bg)' }}>
                        {THUMB[c.category] || '📖'}
                      </div>
                      <div className="course-card-body">
                        <div className="course-card-cat">{c.category}</div>
                        <div className="course-card-name">{c.name}</div>
                        <div className="course-card-desc">{c.description}</div>
                        <div className="course-card-footer">
                          <div className="course-card-teacher">
                            {teacher && <Avatar user={teacher} size="sm" />}
                            <span>{teacher?.name || 'Sin profesor'}</span>
                          </div>
                          <button className="btn btn-sm btn-primary" onClick={() => enrollStudent(c.id, currentUser.id)}>+ Inscribirme</button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* HISTORY */}
        {tab === 'history' && (
          <div className="card">
            <div className="card-body" style={{ padding: 0 }}>
              <table className="data-table">
                <thead>
                  <tr><th>Clase</th><th>Curso</th><th>Fecha</th><th>Transcripción</th><th>Resumen IA</th></tr>
                </thead>
                <tbody>
                  {classes.filter(cl => cl.attendance.some(a => a.userId === currentUser.id)).length === 0 ? (
                    <tr><td colSpan={5}><div className="empty-state"><span className="empty-state-icon">📋</span><div className="empty-state-title">Aún no has asistido a ninguna clase</div></div></td></tr>
                  ) : classes.filter(cl => cl.attendance.some(a => a.userId === currentUser.id)).map(cl => {
                    const course = courses.find(c => c.id === cl.courseId)
                    return (
                      <tr key={cl.id}>
                        <td><div style={{ fontWeight: 600 }}>{cl.title}</div></td>
                        <td style={{ fontSize: 12 }}>{course?.name}</td>
                        <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{cl.date}</td>
                        <td>
                          {cl.savedTranscription
                            ? <span className="badge badge-success">✅ Disponible</span>
                            : <span className="badge badge-gray">Sin guardar</span>}
                        </td>
                        <td>
                          {cl.summary
                            ? <span className="badge badge-primary">🤖 Generado</span>
                            : <span className="badge badge-gray">—</span>}
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
    </>
  )
}
