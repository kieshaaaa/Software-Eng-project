import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!email.endsWith('@thapar.edu')) {
      setError('Use your institutional @thapar.edu email to continue.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    // 1. Create the Supabase Auth user.
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError) {
      setLoading(false)
      setError(signUpError.message)
      return
    }

    const authUser = signUpData.user

    // 2. Row Level Security requires an authenticated session for the
    // profile insert below (auth.uid() must match the row's id). If
    // "Confirm email" is off, signUp() usually returns a session
    // immediately — but if it doesn't, sign in explicitly so the
    // insert has a valid session to work with.
    if (!signUpData.session) {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) {
        setLoading(false)
        setError(
          'Account created, but email confirmation is required before you can log in. ' +
          'Check your inbox, or ask your admin to disable "Confirm email" in Supabase for testing.'
        )
        return
      }
    }

    // 3. Create the matching profile row in public.users.
    if (authUser) {
      const { error: profileError } = await supabase
        .from('users')
        .insert({ id: authUser.id, name, email })

      if (profileError) {
        setLoading(false)
        setError(`Account created but profile setup failed: ${profileError.message}`)
        return
      }
    }

    setLoading(false)
    setSuccess('Account created. You can log in now.')
    setTimeout(() => navigate('/login'), 1500)
  }

  return (
    <div className="page page--narrow">
      <div className="login-card">
        <p className="eyebrow">TIET LostLink</p>
        <h1 className="title">Create your account</h1>
        <p className="lede">
          Use your institutional email — it's how we confirm you're part of the TIET campus
          community.
        </p>

        <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
          <div className="field">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              className="input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="field" style={{ marginTop: 14 }}>
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
          <div className="field" style={{ marginTop: 14 }}>
            <label htmlFor="confirmPassword">Confirm password</label>
            <input
              id="confirmPassword"
              className="input"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          {error && <p style={{ color: 'var(--lost)', fontSize: 13, marginTop: 10 }}>{error}</p>}
          {success && <p style={{ color: 'var(--found)', fontSize: 13, marginTop: 10 }}>{success}</p>}
          <button
            type="submit"
            className="btn btn--primary btn--block"
            style={{ marginTop: 18 }}
            disabled={loading}
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p className="divider-note">
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'inherit', textDecoration: 'underline' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}