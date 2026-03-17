import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { Avatar } from '../../components/Sidebar'

export default function ReportsPage() {
  const { users, courses, classes } = useApp()
  const [tab, setTab] = useState('students')

  const teachers  = users.filter(u => u.role === 'teacher')
  const students  = users.filter(u => u.role === 'student')

  // Report: students per course
  const studentsPerCourse = courses.map(c => ({
    course: c,
    teacher: users.find(u => u.id === c.teacherId),
    students: students.filter(s => c.studentIds.includes(s.id)),
    classes: classes.filter(cl => cl.courseId === c.id),
  }))

  // Report: classes per teacher
  const classesPerTeacher = teachers.map(t => {
    const myCourses  = courses.filter(c => c.teacherId === t.id)
    const myClasses  = classes.filter(cl => myCourses.some(c => c.id === cl.courseId))
    const totalAttend = myClasses.reduce((acc, cl) => acc + cl.attendance.length, 0)
    return { teacher: t, courses: myCourses, classes: myClasses, totalAttend }
  })

  // Report: attendance per class
  const attendance = classes.map(cl => ({
    class: cl,
    course: courses.find(c => c.id === cl.courseId),
    attendees: cl.attendance.map(a => users.find(u => u.id === a.userId)).filter(Boolean),
    questions: cl.questions.length,
  }))

  const downloadCSV = () => {
    let csv = ''
    if (tab === 'students') {
      csv = 'Curso,Estudiantes Inscritos,Profesor\n'
      studentsPerCourse.forEach(r => {
        csv += `"${r.course.name}",${r.students.length},"${r.teacher?.name || 'Sin asignar'}"\n`
      })
    } else if (tab === 'classes') {
      csv = 'Profesor,Cursos Asignados,Clases Dictadas,Total Asistentes\n'
      classesPerTeacher.forEach(r => {
        csv += `"${r.teacher.name}",${r.courses.length},${r.classes.length},${r.totalAttend}\n`
      })
    } else {
      csv = 'Clase,Curso,Fecha,Asistentes,Preguntas\n'
      attendance.forEach(r => {
        csv += `"${r.class.title}","${r.course?.name || ''}","${r.class.date}",${r.attendees.length},${r.questions}\n`
      })
    }
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `reporte_${tab}_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <div className="topbar">
        <div>
          <div className="topbar-title">📊 Reportes y Estadísticas</div>
          <div className="topbar-subtitle">Análisis general del sistema</div>
        </div>
        <div className="topbar-right">
          <button className="btn btn-success" onClick={downloadCSV}>⬇️ Exportar CSV</button>
        </div>
      </div>

      <div className="page-content fade-in">
        {/* Summary cards */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {[
            { label: 'Estudiantes', value: students.length, icon: '👨‍🎓', bg: '#EDE9FE', color: '#7C3AED' },
            { label: 'Profesores',  value: teachers.length, icon: '👨‍🏫', bg: '#EFF6FF', color: '#2563EB' },
            { label: 'Cursos',      value: courses.length,  icon: '📚', bg: '#ECFDF5', color: '#059669' },
            { label: 'Clases',      value: classes.length,  icon: '🎓', bg: '#FFFBEB', color: '#D97706' },
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

        <div className="card">
          <div className="card-header">
            <div className="card-title">Reportes Detallados</div>
          </div>
          <div className="card-body">
            <div className="tabs">
              {[
                { id: 'students', label: `Estudiantes por Curso (${studentsPerCourse.length})` },
                { id: 'classes',  label: `Clases por Profesor (${classesPerTeacher.length})` },
                { id: 'attendance',label: `Asistencia por Clase (${attendance.length})` },
              ].map(t => (
                <button key={t.id} className={`tab-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Students per Course */}
            {tab === 'students' && (
              <table className="data-table">
                <thead>
                  <tr><th>Curso</th><th>Categoría</th><th>Profesor</th><th>Estudiantes</th><th>Clases</th></tr>
                </thead>
                <tbody>
                  {studentsPerCourse.map(r => (
                    <tr key={r.course.id}>
                      <td><div style={{ fontWeight: 600 }}>{r.course.name}</div></td>
                      <td><span className="badge badge-primary">{r.course.category}</span></td>
                      <td>
                        {r.teacher ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Avatar user={r.teacher} size="sm" />
                            <span style={{ fontSize: 12 }}>{r.teacher.name}</span>
                          </div>
                        ) : <span className="badge badge-warning">Sin asignar</span>}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{r.students.length}</span>
                          <div className="progress-bar" style={{ flex: 1, maxWidth: 80 }}>
                            <div className="progress-fill" style={{ width: `${Math.min(r.students.length * 20, 100)}%` }} />
                          </div>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
                          {r.students.map(s => s.name).join(', ') || 'Sin estudiantes'}
                        </div>
                      </td>
                      <td><span className="badge badge-gray">{r.classes.length}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Classes per Teacher */}
            {tab === 'classes' && (
              <table className="data-table">
                <thead>
                  <tr><th>Profesor</th><th>Cursos Asignados</th><th>Clases Dictadas</th><th>Total Asistentes</th></tr>
                </thead>
                <tbody>
                  {classesPerTeacher.length === 0 ? (
                    <tr><td colSpan={4}><div className="empty-state"><span>👨‍🏫</span> Sin profesores</div></td></tr>
                  ) : classesPerTeacher.map(r => (
                    <tr key={r.teacher.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Avatar user={r.teacher} size="sm" />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{r.teacher.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.teacher.email}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="badge badge-info">{r.courses.length} cursos</span></td>
                      <td><span className="badge badge-primary">{r.classes.length} clases</span></td>
                      <td><span className="badge badge-success">{r.totalAttend} 👥</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Attendance */}
            {tab === 'attendance' && (
              <table className="data-table">
                <thead>
                  <tr><th>Clase</th><th>Curso</th><th>Fecha</th><th>Estado</th><th>Asistentes</th><th>Preguntas</th></tr>
                </thead>
                <tbody>
                  {attendance.length === 0 ? (
                    <tr><td colSpan={6}><div className="empty-state"><span className="empty-state-icon">📋</span><div className="empty-state-title">Sin clases registradas</div></div></td></tr>
                  ) : attendance.map(r => (
                    <tr key={r.class.id}>
                      <td><div style={{ fontWeight: 600 }}>{r.class.title}</div></td>
                      <td style={{ fontSize: 12 }}>{r.course?.name || '—'}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.class.date}</td>
                      <td>
                        <span className={`badge ${r.class.isActive ? 'badge-live' : r.class.savedTranscription ? 'badge-success' : 'badge-gray'}`}>
                          {r.class.isActive ? '🔴 En Vivo' : r.class.savedTranscription ? '✅ Guardada' : 'Sin iniciar'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 3 }}>
                          {r.attendees.slice(0, 4).map(u => <Avatar key={u.id} user={u} size="sm" />)}
                          {r.attendees.length > 4 && <span style={{ fontSize: 11, color: 'var(--text-muted)', alignSelf: 'center' }}>+{r.attendees.length - 4}</span>}
                          {r.attendees.length === 0 && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Sin asistentes</span>}
                        </div>
                      </td>
                      <td><span className="badge badge-warning">{r.questions} ❓</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
