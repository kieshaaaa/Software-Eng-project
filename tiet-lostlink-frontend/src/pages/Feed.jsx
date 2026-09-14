import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import TagCard from '../components/TagCard.jsx'
import api from '../api.js'
import { CATEGORIES, LOCATIONS, toViewItem } from '../data/mockItems.js'

export default function Feed() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [query, setQuery] = useState('')
  const [type, setType] = useState('all')
  const [category, setCategory] = useState('all')
  const [location, setLocation] = useState('all')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setLoadError('')

    api
      .get('/reports')
      .then((res) => {
        if (cancelled) return
        setItems(res.data.reports.map(toViewItem))
      })
      .catch((err) => {
        if (cancelled) return
        setLoadError(err.response?.data?.error || 'Failed to load reports.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (type !== 'all' && item.type !== type) return false
      if (category !== 'all' && item.category !== category) return false
      if (location !== 'all' && item.location !== location) return false
      if (query.trim()) {
        const q = query.toLowerCase()
        const haystack = `${item.title} ${item.description} ${item.brand}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [items, query, type, category, location])

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <p className="eyebrow">Active reports · {items.filter((i) => i.status === 'active').length} open</p>
          <h1 className="title">Campus report feed</h1>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/report/lost" className="btn btn--lost">
            I lost something
          </Link>
          <Link to="/report/found" className="btn btn--found">
            I found something
          </Link>
        </div>
      </div>

      <div className="filter-bar">
        <div className="field search-input">
          <label htmlFor="search">Search</label>
          <input
            id="search"
            className="input"
            placeholder="Brand, colour, keyword…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="category">Category</label>
          <select id="category" className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="location">Location</label>
          <select id="location" className="select" value={location} onChange={(e) => setLocation(e.target.value)}>
            <option value="all">All locations</option>
            {LOCATIONS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div className="chip-row" style={{ alignSelf: 'flex-end', marginBottom: 1 }}>
          {['all', 'lost', 'found'].map((t) => (
            <button key={t} className={`chip${type === t ? ' is-active' : ''}`} onClick={() => setType(t)}>
              {t === 'all' ? 'All' : t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="empty-state">Loading reports…</div>
      ) : loadError ? (
        <div className="empty-state">{loadError}</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <p className="section-label" style={{ marginTop: 0 }}>No reports match those filters</p>
          <p>Try clearing a filter, or be the first to report this item.</p>
        </div>
      ) : (
        <div className="tag-grid">
          {filtered.map((item) => (
            <TagCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
