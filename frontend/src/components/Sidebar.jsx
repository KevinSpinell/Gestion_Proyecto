import { useApp } from '../context/AppContext'
import { useState, useEffect } from 'react'

const AVATAR_COLORS = ['#7C3AED', '#2563EB', '#059669', '#DC2626', '#D97706', '#0891B2', '#7C3AED']
const colorForId = (id) => AVATAR_COLORS[id?.charCodeAt(1) % AVATAR_COLORS.length] || '#7C3AED'

export function Avatar({ user, size = 'md', style = {} }) {
  const bg = colorForId(user?.id || user?.name)
  const cls = `avatar avatar-${size}`
  return (
    <div className={cls} style={{ background: bg, ...style }}>
      {user?.avatar || (user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase())}
    </div>
  )
}

export default function Sidebar() {
  const { currentUser, logout, activePage, setActivePage, getActiveClasses } = useApp()
  const [pendingCount, setPendingCount] = useState(0)

  // Fetch pending enrollment count for the admin badge
  useEffect(() => {
    if (currentUser?.role !== 'admin') return
    fetch('http://localhost:3001/api/students/pending')
      .then(r => r.ok ? r.json() : [])
      .then(data => setPendingCount(Array.isArray(data) ? data.length : 0))
      .catch(() => {})
  }, [currentUser?.role, activePage])

  const activeClasses = getActiveClasses()

  const navMap = {
    admin: [
      { id: 'dashboard',  icon: '🏠', label: 'Inicio' },
      { id: 'users',      icon: '👥', label: 'Usuarios' },
      { id: 'courses',    icon: '📚', label: 'Cursos' },
      { id: 'enrollment', icon: '📋', label: 'Solicitudes de Inscripción', badge: pendingCount },
      { id: 'reports',    icon: '📊', label: 'Reportes' },
    ],
    teacher: [
      { id: 'dashboard', icon: '🏠', label: 'Inicio' },
      { id: 'my-courses',icon: '📚', label: 'Mis Cursos' },
      { id: 'history',   icon: '📋', label: 'Historial de clases' },
    ],
    student: [
      { id: 'dashboard', icon: '🏠', label: 'Inicio' },
      { id: 'my-courses',icon: '📚', label: 'Mis Cursos' },
      { id: 'explore',   icon: '🔍', label: 'Explorar Cursos' },
      { id: 'history',   icon: '📋', label: 'Historial' },
    ],
  }

  const roleLabel = { admin: 'Administrador', teacher: 'Profesor', student: 'Estudiante' }
  const navItems = navMap[currentUser?.role] || []

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-mark">🎓</div>
        <div>
          <div className="logo-name">ClassAI</div>
          <div className="logo-tagline">Aulas en tiempo real</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Menú principal</div>
        {navItems.map(item => (
          <div
            key={item.id}
            className={`sidebar-item ${activePage === item.id ? 'active' : ''}`}
            onClick={() => setActivePage(item.id)}
          >
            <span className="item-icon">{item.icon}</span>
            {item.label}
            {item.badge > 0 && <span className="item-badge">{item.badge}</span>}
            {item.id === 'reports' && !item.badge && <span className="item-badge">!</span>}
          </div>
        ))}

        {activeClasses.length > 0 && (
          <>
            <div className="sidebar-section-label">Clases activas</div>
            {activeClasses.map(cl => (
              <div key={cl.id} className="sidebar-item" style={{ fontSize: 12 }}>
                <span className="item-icon">🔴</span>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {cl.title}
                </span>
                <span className="badge badge-live" style={{ fontSize: 9 }}>EN VIVO</span>
              </div>
            ))}
          </>
        )}
      </nav>

      {/* User */}
      <div className="sidebar-footer">
        <div className="user-pill">
          <Avatar user={currentUser} size="sm" />
          <div className="user-info">
            <div className="user-name">{currentUser?.name}</div>
            <div className="user-role">{roleLabel[currentUser?.role]}</div>
          </div>
          <button className="logout-btn" title="Cerrar sesión" onClick={logout}>↩</button>
        </div>
      </div>
    </aside>
  )
}
