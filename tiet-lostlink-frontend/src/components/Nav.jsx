import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Nav() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const name = user?.email ? user.email.split('@')[0].replace(/[._]/g, ' ') : ''
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <header className="nav">
      <div className="nav__inner">
        <NavLink to="/feed" className="nav__brand" style={{ color: 'inherit' }}>
          <span className="nav__punch" />
          LostLink
        </NavLink>
        <nav className="nav__links">
          <NavLink to="/feed" className={({ isActive }) => `nav__link${isActive ? ' is-active' : ''}`}>
            Feed
          </NavLink>
          <NavLink to="/report/lost" className={({ isActive }) => `nav__link${isActive ? ' is-active' : ''}`}>
            Report lost
          </NavLink>
          <NavLink to="/report/found" className={({ isActive }) => `nav__link${isActive ? ' is-active' : ''}`}>
            Report found
          </NavLink>
        </nav>
        <div className="nav__user">
          <span>{name.replace(/\b\w/g, (c) => c.toUpperCase())}</span>
          <span className="nav__avatar">{initials}</span>
          <button
            onClick={handleSignOut}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--ink-soft)' }}
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  )
}
