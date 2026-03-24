import { useState } from 'react'
import { useApp } from '../context/AppContext'

export default function LoginPage() {
  const { login, setActivePage } = useApp()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(form.email, form.password)
    if (!result.success) setError(result.error)
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-icon-wrap">🎓</div>
        <h1 className="auth-title">Bienvenido de vuelta</h1>
        <p className="auth-subtitle">Accede a tu portal académico</p>

        <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Correo electrónico</label>
            <div className="input-with-icon">
              <span className="input-icon">✉️</span>
              <input
                className="form-input"
                type="email"
                placeholder="correo@dominio.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <div className="input-with-icon" style={{ position: 'relative' }}>
              <span className="input-icon">🔑</span>
              <input
                className="form-input"
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                autoComplete="current-password"
                required
              />
              <button type="button" className="input-toggle-pw" onClick={() => setShowPw(!showPw)}>
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ background: 'var(--danger-bg)', border: '1px solid #FECACA', borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: 13, color: 'var(--danger)', display: 'flex', gap: 6 }}>
              ⚠️ {error}
            </div>
          )}

          <button className="btn btn-primary btn-lg w-full" type="submit" disabled={loading}>
            {loading ? <><span className="spinner" /> Verificando...</> : <>Ingresar al Portal →</>}
          </button>
        </form>

        <div className="auth-footer" style={{ marginTop: 24 }}>
          ¿Nuevo estudiante?{' '}
          <span className="auth-link" onClick={() => setActivePage('register')}>
            Solicitar acceso
          </span>
        </div>
      </div>

      <div style={{ marginTop: 24, display: 'flex', gap: 20, fontSize: 12, color: 'var(--text-muted)' }}>
        <span>🔒 Cifrado seguro</span>
        <span>🏛️ Portal académico</span>
        <span>✅ Accesible</span>
      </div>
    </div>
  )
}
