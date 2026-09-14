import { useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!email.endsWith('@thapar.edu')) {
      setError('Use your institutional @thapar.edu email to continue.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)

    if (error) {
      setError('Invalid email or password.')
      return
    }
    navigate('/feed')
  }

  return (
    <div className="page page--narrow">
      <div className="login-card">
        <p className="eyebrow">TIET LostLink</p>
        <h1 className="title">Report it. Search it. Get it back.</h1>
        <p className="lede">
          Log in with your institute email to report a lost or found item, search active
          reports, and track claims.
        </p>

        <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
          <div className="field">
            <label htmlFor="email">Institutional email</label>
            <input
              id="email"
              className="input"
              type="email"
              placeholder="yourname@thapar.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="field" style={{ marginTop: 14 }}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <p style={{ color: 'var(--lost)', fontSize: 13, marginTop: 10 }}>{error}</p>
          )}
          <button type="submit" className="btn btn--primary btn--block" style={{ marginTop: 18 }} disabled={loading}>
            {loading ? 'Signing in…' : 'Continue'}
          </button>
        </form>
        <p className="divider-note">
          Only verified TIET students can report or claim items. New here?{' '}
          <Link to="/register" style={{ color: 'inherit', textDecoration: 'underline' }}>
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}
