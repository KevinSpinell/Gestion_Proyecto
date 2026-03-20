import { useApp } from '../../context/AppContext'
import { Avatar } from '../../components/Sidebar'

export default function AdminDashboard() {
  const { users, courses, classes, getActiveClasses } = useApp()

  const teachers  = users.filter(u => u.role === 'teacher')
  const students  = users.filter(u => u.role === 'student')
  const active    = getActiveClasses()
  const totalQ    = classes.reduce((acc, cl) => acc + cl.questions.length, 0)

  const stats = [
    { label: 'Total Usuarios',    value: users.length,     icon: '👥', color: '#7C3AED', bg: '#EDE9FE', change: `${students.length} estudiantes`, dir: 'up' },
    { label: 'Profesores',        value: teachers.length,  icon: '👨‍🏫', color: '#2563EB', bg: '#EFF6FF', change: 'registrados', dir: 'up' },
    { label: 'Cursos Activos',    value: courses.filter(c => c.status === 'active').length, icon: '📚', color: '#059669', bg: '#ECFDF5', change: `${courses.length} en total`, dir: 'up' },
    { label: 'Clases en Vivo',    value: active.length,    icon: '🔴', color: '#DC2626', bg: '#FEF2F2', change: 'ahora mismo', dir: active.length > 0 ? 'up' : 'neutral' },
  ]

  const recentActivity = [
    ...classes.slice(-5).reverse().map(cl => ({
      id: cl.id, icon: cl.isActive ? '🔴' : '📋',
      text: `Clase "${cl.title}" ${cl.isActive ? 'activa' : 'finalizada'}`,
      sub: cl.date,
    })),
  ]

  return (
    <>
      <div className="topbar">
        <div>
          <div className="topbar-title">🏠 Panel Administrador</div>
          <div className="topbar-subtitle">{new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
        <div className="topbar-right">
          <span className="badge badge-primary">Admin</span>
        </div>
      </div>

      <div className="page-content fade-in">
        {/* Stats */}
        <div className="stats-grid">
          {stats.map(s => (
            <div className="stat-card" key={s.label}>
              <div className="stat-card-top">
                <div className="stat-card-label">{s.label}</div>
                <div className="stat-card-icon" style={{ background: s.bg, color: s.color, fontSize: 20 }}>{s.icon}</div>
              </div>
              <div className="stat-card-value">{s.value}</div>
              <div className={`stat-card-change ${s.dir}`}>↑ {s.change}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
          {/* Recent Classes */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Clases Recientes</div>
                <div className="card-subtitle">Últimas clases en el sistema</div>
              </div>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Clase</th>
                    <th>Curso</th>
                    <th>Profesor</th>
                    <th>Estado</th>
                    <th>Asistentes</th>
                  </tr>
                </thead>
                <tbody>
                  {classes.length === 0 ? (
                    <tr><td colSpan={5}><div className="empty-state"><span className="empty-state-icon">📭</span><div className="empty-state-title">Sin clases aún</div></div></td></tr>
                  ) : classes.slice().reverse().map(cl => {
                    const course = courses.find(c => c.id === cl.courseId)
                    const teacher = users.find(u => u.id === course?.teacherId)
                    return (
                      <tr key={cl.id}>
                        <td><div style={{ fontWeight: 600 }}>{cl.title}</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{cl.date}</div></td>
                        <td style={{ fontSize: 12 }}>{course?.name || '—'}</td>
                        <td>
                          {teacher ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <Avatar user={teacher} size="sm" />
                              <span style={{ fontSize: 12 }}>{teacher.name}</span>
                            </div>
                          ) : '—'}
                        </td>
                        <td>
                          <span className={`badge ${cl.isActive ? 'badge-live' : 'badge-gray'}`}>
                            {cl.isActive ? '🔴 En Vivo' : 'Finalizada'}
                          </span>
                        </td>
                        <td><span className="badge badge-primary">{cl.attendance.length}</span></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Team quick view */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Profesores</div>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {teachers.length === 0 ? (
                  <div className="empty-state"><span className="empty-state-icon">👤</span><div className="empty-state-title">Sin profesores</div></div>
                ) : teachers.map(t => {
                  const myCourses = courses.filter(c => c.teacherId === t.id)
                  return (
                    <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Avatar user={t} size="md" />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{t.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{myCourses.length} curso{myCourses.length !== 1 ? 's' : ''} asignado{myCourses.length !== 1 ? 's' : ''}</div>
                      </div>
                      <span className="badge badge-primary">{myCourses.length}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
