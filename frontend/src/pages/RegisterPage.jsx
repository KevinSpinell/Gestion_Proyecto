import { useState } from 'react'
import { useApp } from '../context/AppContext'

export default function RegisterPage() {
  const { registerStudent, login, setActivePage } = useApp()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ name: '', email: '', username: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('Las contraseñas no coinciden'); return }
    if (form.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    const result = registerStudent(form)
    if (!result.success) { setError(result.error); setLoading(false); return }
    login(form.username, form.password)
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 480 }}>
        <div className="auth-icon-wrap">📚</div>
        <h1 className="auth-title">Crear cuenta</h1>
        <p className="auth-subtitle">Regístrate como estudiante en ClassAI</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Nombre completo</label>
            <input className="form-input" placeholder="Juan Pérez" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>

          <div className="form-group">
            <label className="form-label">Correo electrónico</label>
            <input className="form-input" type="email" placeholder="juan@universidad.edu"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>

          <div className="form-group">
            <label className="form-label">Nombre de usuario</label>
            <input className="form-input" placeholder="juanperez123" value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value.toLowerCase().replace(/\s/g, '') })} required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input className="form-input" type="password" placeholder="••••••••"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Confirmar</label>
              <input className="form-input" type="password" placeholder="••••••••"
                value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} required />
            </div>
          </div>

          {error && (
            <div style={{ background: 'var(--danger-bg)', border: '1px solid #FECACA', borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: 13, color: 'var(--danger)' }}>
              ⚠️ {error}
            </div>
          )}

          <button className="btn btn-primary btn-lg w-full" type="submit" disabled={loading}>
            {loading ? <><span className="spinner" /> Creando cuenta...</> : 'Crear mi cuenta →'}
          </button>
        </form>

        <div className="auth-footer" style={{ marginTop: 16 }}>
          ¿Ya tienes cuenta?{' '}
          <span className="auth-link" onClick={() => setActivePage('dashboard')}>
            Iniciar sesión
          </span>
        </div>
      </div>
    </div>
  )
}
