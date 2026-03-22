import { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import { Avatar } from '../../components/Sidebar'

const THUMB = {
  Informática: '💻', Matemáticas: '📐', Ciencias: '🔬', Historia: '📚',
  Idiomas: '🌍', Arte: '🎨', Ingeniería: '⚙️', General: '📖',
}

// ── Toast helper ─────────────────────────────────────────────────────────────
function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [toast, onClose])

  if (!toast) return null
  const colors = {
    success: { bg: '#ECFDF5', border: '#059669', color: '#065F46', icon: '✅' },
    error:   { bg: '#FEF2F2', border: '#DC2626', color: '#991B1B', icon: '❌' },
    info:    { bg: '#EFF6FF', border: '#2563EB', color: '#1E3A8A', icon: 'ℹ️' },
  }
  const s = colors[toast.type] || colors.info
  return (
    <div style={{
      position: 'fixed', top: 24, right: 24, zIndex: 9999,
      padding: '14px 20px', borderRadius: 12, border: `1.5px solid ${s.border}`,
      background: s.bg, color: s.color, fontWeight: 600, fontSize: 14,
      display: 'flex', alignItems: 'center', gap: 10,
      boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
      animation: 'fadeIn .25s ease',
      maxWidth: 340,
    }}>
      <span style={{ fontSize: 18 }}>{s.icon}</span>
      {toast.message}
      <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: s.color, opacity: 0.6 }}>✕</button>
    </div>
  )
}

// ── Confirmation Modal ────────────────────────────────────────────────────────
function ConfirmModal({ course, onConfirm, onCancel, loading }) {
  if (!course) return null
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9000,
      background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: 'var(--card-bg, #fff)', borderRadius: 16, padding: '32px 28px',
        width: 380, maxWidth: '90vw', boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
        display: 'flex', flexDirection: 'column', gap: 18,
      }}>
        <div style={{ fontSize: 36, textAlign: 'center' }}>{THUMB[course.category] || '📖'}</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 6 }}>Confirmar inscripción</div>
          <div style={{ color: 'var(--text-muted, #666)', fontSize: 14 }}>
            ¿Deseas inscribirte en <strong>{course.name}</strong>?
          </div>
          {course.category && (
            <div style={{ marginTop: 8 }}>
              <span className="badge badge-gray">{course.category}</span>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <button className="btn btn-outline" style={{ flex: 1 }} onClick={onCancel} disabled={loading}>
            Cancelar
          </button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={onConfirm} disabled={loading}>
            {loading ? 'Inscribiendo...' : '✓ Inscribirme'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function StudentDashboard() {
  const {
    currentUser, users, courses, classes,
    enrollStudent, unenrollStudent,
    getCoursesForStudent, getActiveClasses, joinClass,
    setActivePage, setActiveClassId,
  } = useApp()

  const [tab, setTab]               = useState('my')
  const [search, setSearch]         = useState('')
  const [toast, setToast]           = useState(null)
  const [confirmCourse, setConfirmCourse] = useState(null)  // course object pending confirm
  const [enrollLoading, setEnrollLoading] = useState(false)
  const [unenrollLoading, setUnenrollLoading] = useState(null) // courseId being unenrolled

  const showToast = (message, type = 'success') => setToast({ message, type })

  const studentId  = currentUser.id || currentUser._id
  const myCourses  = getCoursesForStudent(studentId)
  const allCourses = courses.filter(c => c.status === 'active')
  const activeClasses = getActiveClasses()

  // Active classes I'm enrolled in
  const myActiveClasses = activeClasses.filter(cl => {
    const course = courses.find(c => (c.id || c._id) === cl.courseId)
    return course && course.studentIds.map(String).includes(String(studentId))
  })

  const enterClass = (classId) => {
    joinClass(classId, studentId)
    setActiveClassId(classId)
    setActivePage('classroom')
  }

  // Courses not yet enrolled — active only, filtered by search
  const explored = allCourses.filter(c =>
    !c.studentIds.map(String).includes(String(studentId)) &&
    (
      (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.category || '').toLowerCase().includes(search.toLowerCase())
    )
  )

  // Also surface inactive/closed courses the student hasn't enrolled in (for 5.2)
  const closedCourses = courses.filter(c =>
    c.status !== 'active' &&
    !c.studentIds.map(String).includes(String(studentId)) &&
    (
      (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.category || '').toLowerCase().includes(search.toLowerCase())
    )
  )

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleEnrollClick = (course) => {
    // Flujo alternativo 5.2: course no está activo
    if (course.status !== 'active') {
      showToast('Este curso no está disponible para inscripción', 'info')
      return
    }
    // Flujo alternativo 5.1: ya inscrito
    if (course.studentIds.map(String).includes(String(studentId))) {
      showToast('Ya estás inscrito en este curso', 'info')
      return
    }
    // Flujo normal: pedir confirmación
    setConfirmCourse(course)
  }

  const handleConfirmEnroll = async () => {
    if (!confirmCourse) return
    setEnrollLoading(true)
    const courseId = confirmCourse.id || confirmCourse._id
    const result = await enrollStudent(courseId, studentId)
    setEnrollLoading(false)
    setConfirmCourse(null)

    if (result?.alreadyEnrolled) {
      showToast('Ya estás inscrito en este curso', 'info')
    } else if (result?.success) {
      showToast('¡Inscripción exitosa! Ahora tienes acceso al curso 🎉', 'success')
      setTab('my')
    } else {
      showToast(result?.error || 'Error al inscribirse', 'error')
    }
  }

  const handleUnenroll = async (courseId) => {
    setUnenrollLoading(courseId)
    const result = await unenrollStudent(courseId, studentId)
    setUnenrollLoading(null)
    if (result?.success) {
      showToast('Saliste del curso correctamente', 'info')
    } else {
      showToast(result?.error || 'Error al salir del curso', 'error')
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <Toast toast={toast} onClose={() => setToast(null)} />
      <ConfirmModal
        course={confirmCourse}
        onConfirm={handleConfirmEnroll}
        onCancel={() => setConfirmCourse(null)}
        loading={enrollLoading}
      />

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
            { label: 'Mis Cursos',        value: myCourses.length,      icon: '📚', bg: '#EDE9FE', color: '#7C3AED' },
            { label: 'Clases Activas',    value: myActiveClasses.length, icon: '🔴', bg: '#FEF2F2', color: '#DC2626' },
            { label: 'Clases Guardadas',  value: classes.filter(cl => cl.attendance.some(a => String(a.userId) === String(studentId)) && cl.savedTranscription).length, icon: '💾', bg: '#ECFDF5', color: '#059669' },
            { label: 'Cursos Disponibles',value: explored.length,        icon: '🔍', bg: '#EFF6FF', color: '#2563EB' },
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
                const course  = courses.find(c => (c.id || c._id) === cl.courseId)
                const teacher = users.find(u => (u.id || u._id) === course?.teacherId)
                return (
                  <div key={cl.id || cl._id} className="lobby-card">
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
                    <button className="btn btn-primary" onClick={() => enterClass(cl.id || cl._id)}>→ Unirme</button>
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
                const cId          = c.id || c._id
                const teacher      = users.find(u => (u.id || u._id) === c.teacherId)
                const courseClasses = classes.filter(cl => cl.courseId === cId)
                const hasActive    = courseClasses.some(cl => cl.isActive)
                const myAttended   = courseClasses.filter(cl => cl.attendance.some(a => String(a.userId) === String(studentId)))
                const isLeaving    = unenrollLoading === cId
                return (
                  <div key={cId} className="course-card">
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
                        <button
                          className="btn btn-sm btn-danger"
                          disabled={isLeaving}
                          onClick={() => handleUnenroll(cId)}
                        >
                          {isLeaving ? 'Saliendo...' : 'Salir'}
                        </button>
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
              <input
                className="form-input"
                placeholder="Buscar cursos disponibles..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* Flujo alternativo 2.1: no hay cursos activos disponibles */}
            {explored.length === 0 && closedCourses.length === 0 ? (
              <div className="empty-state">
                <span className="empty-state-icon">🔍</span>
                <div className="empty-state-title">No hay cursos disponibles en este momento</div>
                <div className="empty-state-desc">Pronto habrá nuevos cursos publicados por los profesores.</div>
              </div>
            ) : (
              <>
                {/* Cursos activos / disponibles */}
                {explored.length > 0 && (
                  <div className="course-grid">
                    {explored.map(c => {
                      const cId    = c.id || c._id
                      const teacher = users.find(u => (u.id || u._id) === c.teacherId)
                      return (
                        <div key={cId} className="course-card">
                          <div className="course-card-thumb" style={{ background: 'var(--primary-bg)' }}>
                            {THUMB[c.category] || '📖'}
                          </div>
                          <div className="course-card-body">
                            <div className="course-card-cat">{c.category}</div>
                            <div className="course-card-name">{c.name}</div>
                            <div className="course-card-desc">{c.description}</div>
                            <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                              <span className="badge badge-success">✅ Disponible</span>
                              <span className="badge badge-gray">👥 {c.studentIds?.length || 0} inscritos</span>
                            </div>
                            <div className="course-card-footer">
                              <div className="course-card-teacher">
                                {teacher && <Avatar user={teacher} size="sm" />}
                                <span>{teacher?.name || 'Sin profesor'}</span>
                              </div>
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() => handleEnrollClick(c)}
                              >
                                + Inscribirme
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Flujo alternativo 5.2: cursos cerrados/inactivos */}
                {closedCourses.length > 0 && (
                  <>
                    <div style={{ margin: '24px 0 12px', fontWeight: 700, color: 'var(--text-muted)', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>
                      Cursos cerrados
                    </div>
                    <div className="course-grid">
                      {closedCourses.map(c => {
                        const cId    = c.id || c._id
                        const teacher = users.find(u => (u.id || u._id) === c.teacherId)
                        return (
                          <div key={cId} className="course-card" style={{ opacity: 0.7 }}>
                            <div className="course-card-thumb" style={{ background: '#F3F4F6' }}>
                              {THUMB[c.category] || '📖'}
                            </div>
                            <div className="course-card-body">
                              <div className="course-card-cat">{c.category}</div>
                              <div className="course-card-name">{c.name}</div>
                              <div className="course-card-desc">{c.description}</div>
                              <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                                <span className="badge badge-gray">🔒 Cerrado</span>
                              </div>
                              <div className="course-card-footer">
                                <div className="course-card-teacher">
                                  {teacher && <Avatar user={teacher} size="sm" />}
                                  <span>{teacher?.name || 'Sin profesor'}</span>
                                </div>
                                {/* Flujo alternativo 5.2: botón deshabilitado */}
                                <button className="btn btn-sm" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                                  No disponible
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
              </>
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
                  {classes.filter(cl => cl.attendance.some(a => String(a.userId) === String(studentId))).length === 0 ? (
                    <tr><td colSpan={5}><div className="empty-state"><span className="empty-state-icon">📋</span><div className="empty-state-title">Aún no has asistido a ninguna clase</div></div></td></tr>
                  ) : classes.filter(cl => cl.attendance.some(a => String(a.userId) === String(studentId))).map(cl => {
                    const course = courses.find(c => (c.id || c._id) === cl.courseId)
                    return (
                      <tr key={cl.id || cl._id}>
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
