import { useState } from 'react'
import './index.css'

const initialProjects = [
  {
    id: 1,
    name: 'NeoTaxi Mobile App',
    description: 'Aplicación móvil de taxi con IA y reconocimiento facial',
    status: 'En progreso',
    priority: 'Alta',
    progress: 72,
    deadline: '2026-04-15',
    team: ['KN', 'AM', 'JR'],
    teamColors: ['#3b82f6', '#8b5cf6', '#14b8a6'],
    tasks: 24,
    doneTasks: 17,
  },
  {
    id: 2,
    name: 'Panel Administrativo',
    description: 'Dashboard web para gestión y monitoreo en tiempo real',
    status: 'En revisión',
    priority: 'Media',
    progress: 89,
    deadline: '2026-03-28',
    team: ['KN', 'LM'],
    teamColors: ['#3b82f6', '#f97316'],
    tasks: 18,
    doneTasks: 16,
  },
  {
    id: 3,
    name: 'API Backend v2',
    description: 'Migración y optimización del servidor REST con Node.js',
    status: 'Completado',
    priority: 'Alta',
    progress: 100,
    deadline: '2026-03-10',
    team: ['JR', 'AM'],
    teamColors: ['#14b8a6', '#8b5cf6'],
    tasks: 31,
    doneTasks: 31,
  },
  {
    id: 4,
    name: 'Módulo de Pagos',
    description: 'Integración con pasarela de pagos y facturación automática',
    status: 'Por iniciar',
    priority: 'Baja',
    progress: 0,
    deadline: '2026-05-20',
    team: ['KN'],
    teamColors: ['#3b82f6'],
    tasks: 12,
    doneTasks: 0,
  },
]

const initialTasks = [
  { id: 1, text: 'Revisar diseño de login con reconocimiento facial', done: true },
  { id: 2, text: 'Configurar CI/CD pipeline para producción', done: true },
  { id: 3, text: 'Implementar notificaciones push en tiempo real', done: false },
  { id: 4, text: 'Optimizar queries de base de datos MongoDB', done: false },
  { id: 5, text: 'Documentar API endpoints con Swagger', done: false },
]

const activities = [
  { id: 1, icon: '🚀', iconBg: 'rgba(59,130,246,0.15)', text: <><strong>Kevin N.</strong> desplegó la versión 2.1.0 del backend a producción</>, time: 'hace 15 min' },
  { id: 2, icon: '✅', iconBg: 'rgba(34,197,94,0.15)', text: <><strong>Ana M.</strong> completó la tarea "Pruebas de estrés API"</>, time: 'hace 1 hora' },
  { id: 3, icon: '💬', iconBg: 'rgba(139,92,246,0.15)', text: <><strong>Jorge R.</strong> comentó en el proyecto Panel Administrativo</>, time: 'hace 2 horas' },
  { id: 4, icon: '📎', iconBg: 'rgba(249,115,22,0.15)', text: <><strong>Kevin N.</strong> adjuntó 3 archivos al proyecto NeoTaxi</>, time: 'hace 4 horas' },
  { id: 5, icon: '🐛', iconBg: 'rgba(239,68,68,0.15)', text: <><strong>Jorge R.</strong> reportó un bug crítico en el módulo de autenticación</>, time: 'ayer' },
]

const priorityBadge = {
  'Alta': { class: 'badge-danger', dot: '🔴' },
  'Media': { class: 'badge-warning', dot: '🟡' },
  'Baja': { class: 'badge-teal', dot: '🟢' },
}

const statusBadge = {
  'En progreso': 'badge-blue',
  'En revisión': 'badge-purple',
  'Completado': 'badge-success',
  'Por iniciar': 'badge-orange',
}

const progressColor = {
  'En progreso': 'var(--accent-blue)',
  'En revisión': 'var(--accent-purple)',
  'Completado': 'var(--success)',
  'Por iniciar': 'var(--text-muted)',
}

const navItems = [
  { icon: '🏠', label: 'Inicio', id: 'dashboard', badge: null },
  { icon: '📁', label: 'Proyectos', id: 'projects', badge: '4' },
  { icon: '✅', label: 'Tareas', id: 'tasks', badge: '3' },
  { icon: '👥', label: 'Equipo', id: 'team', badge: null },
  { icon: '📊', label: 'Estadísticas', id: 'stats', badge: null },
]

const navItemsBottom = [
  { icon: '⚙️', label: 'Configuración', id: 'settings' },
]

export default function App() {
  const [activePage, setActivePage] = useState('dashboard')
  const [projects, setProjects] = useState(initialProjects)
  const [tasks, setTasks] = useState(initialTasks)
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [newProject, setNewProject] = useState({ name: '', description: '', priority: 'Media', deadline: '' })

  const totalProjects = projects.length
  const activeProjects = projects.filter(p => p.status === 'En progreso').length
  const completedProjects = projects.filter(p => p.status === 'Completado').length
  const pendingTasks = tasks.filter(t => !t.done).length

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  const addProject = () => {
    if (!newProject.name.trim()) return
    const proj = {
      id: projects.length + 1,
      name: newProject.name,
      description: newProject.description || 'Sin descripción',
      status: 'Por iniciar',
      priority: newProject.priority,
      progress: 0,
      deadline: newProject.deadline || '2026-12-31',
      team: ['KN'],
      teamColors: ['#3b82f6'],
      tasks: 0,
      doneTasks: 0,
    }
    setProjects([...projects, proj])
    setNewProject({ name: '', description: '', priority: 'Media', deadline: '' })
    setShowModal(false)
  }

  const removeProject = (id) => {
    setProjects(projects.filter(p => p.id !== id))
  }

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">⚡</div>
          <div>
            <div className="logo-text">GestorPro</div>
            <div className="logo-sub">Gestión de Proyectos</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Principal</div>
          {navItems.map(item => (
            <div
              key={item.id}
              className={`nav-item ${activePage === item.id ? 'active' : ''}`}
              onClick={() => setActivePage(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </div>
          ))}
          <div className="nav-section-label">Sistema</div>
          {navItemsBottom.map(item => (
            <div
              key={item.id}
              className={`nav-item ${activePage === item.id ? 'active' : ''}`}
              onClick={() => setActivePage(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">KN</div>
            <div className="user-info">
              <div className="user-name">Kevin Nalli</div>
              <div className="user-role">Líder de Proyecto</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content">
        <header className="topbar">
          <div>
            <div className="topbar-title">
              {activePage === 'dashboard' && '🏠 Dashboard'}
              {activePage === 'projects' && '📁 Proyectos'}
              {activePage === 'tasks' && '✅ Mis Tareas'}
              {activePage === 'team' && '👥 Equipo'}
              {activePage === 'stats' && '📊 Estadísticas'}
              {activePage === 'settings' && '⚙️ Configuración'}
            </div>
            <div className="topbar-subtitle">
              {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>

          <div className="topbar-actions">
            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Buscar proyectos..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button className="btn btn-icon btn-secondary notif-btn" title="Notificaciones">
              🔔
              <span className="notif-dot"></span>
            </button>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              ＋ Nuevo Proyecto
            </button>
          </div>
        </header>

        <main className="page-content">
          {/* ── DASHBOARD ── */}
          {activePage === 'dashboard' && (
            <>
              {/* Stats */}
              <div className="stats-grid">
                <StatCard
                  label="Total Proyectos" value={totalProjects}
                  icon="📁" iconBg="rgba(59,130,246,0.15)"
                  change="+2 este mes" changeType="up"
                />
                <StatCard
                  label="En Progreso" value={activeProjects}
                  icon="⚡" iconBg="rgba(249,115,22,0.15)"
                  change="activos ahora" changeType="up"
                />
                <StatCard
                  label="Completados" value={completedProjects}
                  icon="✅" iconBg="rgba(34,197,94,0.15)"
                  change="+1 esta semana" changeType="up"
                />
                <StatCard
                  label="Tareas Pendientes" value={pendingTasks}
                  icon="📌" iconBg="rgba(239,68,68,0.15)"
                  change="por completar" changeType="down"
                />
              </div>

              <div className="content-grid">
                {/* Projects table */}
                <div className="card">
                  <div className="card-header">
                    <div>
                      <div className="card-title">Proyectos Recientes</div>
                      <div className="card-subtitle">Últimas actividades del equipo</div>
                    </div>
                    <button className="btn btn-sm btn-secondary" onClick={() => setActivePage('projects')}>Ver todos</button>
                  </div>
                  <div className="card-body">
                    <ProjectTable
                      projects={filteredProjects.slice(0, 4)}
                      onRemove={removeProject}
                    />
                  </div>
                </div>

                {/* Activity */}
                <div className="card">
                  <div className="card-header">
                    <div>
                      <div className="card-title">Actividad Reciente</div>
                      <div className="card-subtitle">Últimas acciones del equipo</div>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="activity-list">
                      {activities.map(a => (
                        <div className="activity-item fade-in" key={a.id}>
                          <div className="activity-dot" style={{ background: a.iconBg }}>{a.icon}</div>
                          <div className="activity-content">
                            <div className="activity-text">{a.text}</div>
                            <div className="activity-time">{a.time}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tasks */}
              <div className="card">
                <div className="card-header">
                  <div>
                    <div className="card-title">Mis Tareas</div>
                    <div className="card-subtitle">{tasks.filter(t => t.done).length} de {tasks.length} completadas</div>
                  </div>
                  <button className="btn btn-sm btn-secondary" onClick={() => setActivePage('tasks')}>Ver todas</button>
                </div>
                <div className="card-body">
                  <TaskList tasks={tasks} onToggle={toggleTask} />
                </div>
              </div>
            </>
          )}

          {/* ── PROYECTOS ── */}
          {activePage === 'projects' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                  {filteredProjects.length} proyecto{filteredProjects.length !== 1 ? 's' : ''} encontrado{filteredProjects.length !== 1 ? 's' : ''}
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>＋ Nuevo Proyecto</button>
              </div>
              <div className="card">
                <div className="card-body">
                  <ProjectTable projects={filteredProjects} onRemove={removeProject} full />
                </div>
              </div>
            </>
          )}

          {/* ── TASKS ── */}
          {activePage === 'tasks' && (
            <div className="content-grid">
              <div className="card">
                <div className="card-header">
                  <div>
                    <div className="card-title">Lista de Tareas</div>
                    <div className="card-subtitle">{tasks.filter(t => !t.done).length} pendientes</div>
                  </div>
                </div>
                <div className="card-body">
                  <TaskList tasks={tasks} onToggle={toggleTask} />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="card">
                  <div className="card-header">
                    <div className="card-title">Progreso del día</div>
                  </div>
                  <div className="card-body">
                    <div style={{ textAlign: 'center', padding: '16px 0' }}>
                      <div style={{ fontSize: 48, fontWeight: 800, background: 'var(--gradient-1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        {Math.round(tasks.filter(t => t.done).length / tasks.length * 100)}%
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>completado</div>
                      <div style={{ marginTop: 16 }}>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${tasks.filter(t => t.done).length / tasks.length * 100}%`, background: 'var(--gradient-1)' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card">
                  <div className="card-header">
                    <div className="card-title">Resumen</div>
                  </div>
                  <div className="card-body">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {[
                        { label: 'Total tareas', value: tasks.length, color: 'var(--accent-blue)' },
                        { label: 'Completadas', value: tasks.filter(t => t.done).length, color: 'var(--success)' },
                        { label: 'Pendientes', value: tasks.filter(t => !t.done).length, color: 'var(--warning)' },
                      ].map(s => (
                        <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.label}</span>
                          <span style={{ fontWeight: 700, color: s.color }}>{s.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TEAM ── */}
          {activePage === 'team' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {[
                { initials: 'KN', name: 'Kevin Nalli', role: 'Líder de Proyecto', color: '#3b82f6', projects: 4, tasks: 12 },
                { initials: 'AM', name: 'Ana Martínez', role: 'Desarrolladora Frontend', color: '#8b5cf6', projects: 2, tasks: 8 },
                { initials: 'JR', name: 'Jorge Ramírez', role: 'Desarrollador Backend', color: '#14b8a6', projects: 3, tasks: 15 },
                { initials: 'LM', name: 'Laura Méndez', role: 'Diseñadora UX/UI', color: '#f97316', projects: 2, tasks: 6 },
              ].map(m => (
                <div key={m.name} className="card fade-in" style={{ cursor: 'pointer', transition: 'var(--transition)' }}>
                  <div className="card-body" style={{ textAlign: 'center', paddingTop: 32 }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, margin: '0 auto 16px', boxShadow: `0 0 24px ${m.color}44` }}>
                      {m.initials}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{m.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4, marginBottom: 16 }}>{m.role}</div>
                    <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                      <span className="badge badge-blue">{m.projects} proyectos</span>
                      <span className="badge badge-purple">{m.tasks} tareas</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── STATS ── */}
          {activePage === 'stats' && (
            <>
              <div className="stats-grid">
                <StatCard label="Total Proyectos" value={totalProjects} icon="📁" iconBg="rgba(59,130,246,0.15)" change="+2 este mes" changeType="up" />
                <StatCard label="Tasa de Completado" value={`${Math.round(completedProjects / totalProjects * 100)}%`} icon="📈" iconBg="rgba(34,197,94,0.15)" change="promedio actual" changeType="up" />
                <StatCard label="Miembros Activos" value="4" icon="👥" iconBg="rgba(139,92,246,0.15)" change="en 2 proyectos" changeType="up" />
                <StatCard label="Horas Estimadas" value="240h" icon="⏱️" iconBg="rgba(249,115,22,0.15)" change="este mes" changeType="up" />
              </div>
              <div className="card">
                <div className="card-header">
                  <div className="card-title">Estado de Proyectos</div>
                </div>
                <div className="card-body">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
                    {[
                      { label: 'Completados', value: completedProjects, total: totalProjects, color: 'var(--success)' },
                      { label: 'En Progreso', value: activeProjects, total: totalProjects, color: 'var(--accent-blue)' },
                      { label: 'Por Iniciar', value: projects.filter(p => p.status === 'Por iniciar').length, total: totalProjects, color: 'var(--text-muted)' },
                      { label: 'En Revisión', value: projects.filter(p => p.status === 'En revisión').length, total: totalProjects, color: 'var(--accent-purple)' },
                    ].map(s => (
                      <div key={s.label}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.label}</span>
                          <span style={{ fontSize: 13, fontWeight: 600, color: s.color }}>{s.value}/{s.total}</span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${s.value / s.total * 100}%`, background: s.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── SETTINGS ── */}
          {activePage === 'settings' && (
            <div className="card" style={{ maxWidth: 600 }}>
              <div className="card-header">
                <div className="card-title">Configuración del Perfil</div>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Nombre completo</label>
                    <input className="form-input" defaultValue="Kevin Nalli" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Correo electrónico</label>
                    <input className="form-input" defaultValue="kevin@neotaxi.app" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Rol</label>
                    <input className="form-input" defaultValue="Líder de Proyecto" />
                  </div>
                  <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Guardar Cambios</button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">✨ Nuevo Proyecto</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Nombre del proyecto *</label>
                <input
                  className="form-input"
                  placeholder="Ej: App de entregas"
                  value={newProject.name}
                  onChange={e => setNewProject({ ...newProject, name: e.target.value })}
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label">Descripción</label>
                <textarea
                  className="form-textarea"
                  placeholder="Descripción breve del proyecto..."
                  value={newProject.description}
                  onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Prioridad</label>
                  <select className="form-select" value={newProject.priority} onChange={e => setNewProject({ ...newProject, priority: e.target.value })}>
                    <option value="Alta">Alta</option>
                    <option value="Media">Media</option>
                    <option value="Baja">Baja</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Fecha límite</label>
                  <input
                    type="date"
                    className="form-input"
                    value={newProject.deadline}
                    onChange={e => setNewProject({ ...newProject, deadline: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={addProject}>Crear Proyecto</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Sub-components ──

function StatCard({ label, value, icon, iconBg, change, changeType }) {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <div className="stat-label">{label}</div>
        <div className="stat-icon" style={{ background: iconBg }}>{icon}</div>
      </div>
      <div className="stat-value">{value}</div>
      <div className={`stat-change ${changeType}`}>
        {changeType === 'up' ? '↑' : '↓'} {change}
      </div>
    </div>
  )
}

function ProjectTable({ projects, onRemove, full }) {
  return (
    <table className="project-table">
      <thead>
        <tr>
          <th>Proyecto</th>
          <th>Estado</th>
          <th>Prioridad</th>
          <th>Progreso</th>
          {full && <th>Equipo</th>}
          {full && <th>Fecha Límite</th>}
          <th></th>
        </tr>
      </thead>
      <tbody>
        {projects.length === 0 ? (
          <tr><td colSpan={full ? 7 : 5}>
            <div className="empty-state">
              <span className="empty-state-icon">📭</span>
              <div className="empty-state-title">No hay proyectos</div>
            </div>
          </td></tr>
        ) : projects.map(p => (
          <tr key={p.id}>
            <td>
              <div className="project-name">{p.name}</div>
              <div className="project-meta">{p.description}</div>
            </td>
            <td>
              <span className={`badge ${statusBadge[p.status]}`}>
                {p.status}
              </span>
            </td>
            <td>
              <span className={`badge ${priorityBadge[p.priority]?.class}`}>
                {p.priority}
              </span>
            </td>
            <td style={{ minWidth: 120 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="progress-bar" style={{ flex: 1 }}>
                  <div className="progress-fill" style={{ width: `${p.progress}%`, background: progressColor[p.status] }} />
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 32 }}>{p.progress}%</span>
              </div>
            </td>
            {full && (
              <td>
                <div className="avatar-group">
                  {p.team.map((t, i) => (
                    <div key={t} className="avatar" style={{ background: p.teamColors[i] }}>{t}</div>
                  ))}
                </div>
              </td>
            )}
            {full && (
              <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                {new Date(p.deadline).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
              </td>
            )}
            <td>
              <button className="btn btn-danger btn-sm" onClick={() => onRemove(p.id)}>✕</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function TaskList({ tasks, onToggle }) {
  return (
    <div className="task-list">
      {tasks.map(task => (
        <div className="task-item" key={task.id} onClick={() => onToggle(task.id)}>
          <div className={`task-checkbox ${task.done ? 'done' : ''}`}>
            {task.done && '✓'}
          </div>
          <span className={`task-text ${task.done ? 'done-text' : ''}`}>{task.text}</span>
        </div>
      ))}
    </div>
  )
}
