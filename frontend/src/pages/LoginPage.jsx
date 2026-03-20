import { useState } from 'react'
import { useApp } from '../context/AppContext'

export default function LoginPage() {
  const { login, setActivePage } = useApp()
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(form.username, form.password)
    if (!result.success) setError(result.error)
    setLoading(false)
  }

  const fill = (username, password) => setForm({ username, password })

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-icon-wrap">🎓</div>
        <h1 className="auth-title">Bienvenido de vuelta</h1>
        <p className="auth-subtitle">Accede a tu portal académico</p>

        <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Usuario</label>
            <div className="input-with-icon">
              <span className="input-icon">✉️</span>
              <input
                className="form-input"
                placeholder="nombre@classai.edu"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label className="form-label">Contraseña</label>
            </div>
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

        <div className="auth-divider">cuentas de prueba</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { label: '🛡️ Administrador', u: 'admin', p: 'admin123' },
            { label: '👨‍🏫 Profesor (Carlos)', u: 'prof1', p: 'prof123' },
            { label: '👨‍🎓 Estudiante (Kevin)', u: 'est1', p: 'est123' },
          ].map(acc => (
            <button
              key={acc.u}
              type="button"
              className="btn btn-secondary w-full"
              style={{ justifyContent: 'space-between', fontSize: 12 }}
              onClick={() => fill(acc.u, acc.p)}
            >
              <span>{acc.label}</span>
              <span style={{ color: 'var(--text-muted)' }}>{acc.u} / {acc.p}</span>
            </button>
          ))}
        </div>

        <div className="auth-footer">
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
