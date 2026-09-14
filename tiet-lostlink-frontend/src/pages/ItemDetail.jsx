import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api.js'
import { toViewItem, findMatches } from '../data/mockItems.js'
import StampBadge from '../components/StampBadge.jsx'

function scoreTier(score) {
  if (score >= 75) return { kind: '', label: 'High-likelihood' }
  if (score >= 50) return { kind: 'mid', label: 'Possible' }
  return { kind: 'low', label: 'Weak' }
}

export default function ItemDetail() {
  const { id } = useParams()
  const [item, setItem] = useState(null)
  const [allItems, setAllItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setLoadError('')

    // Fetch the full active feed once, find the one matching this report
    // code, and reuse the rest for the client-side match calculation.
    api
      .get('/reports')
      .then((res) => {
        if (cancelled) return
        const viewItems = res.data.reports.map(toViewItem)
        setAllItems(viewItems)
        setItem(viewItems.find((i) => i.id === id) || null)
      })
      .catch((err) => {
        if (cancelled) return
        setLoadError(err.response?.data?.error || 'Failed to load report.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return (
      <div className="page">
        <div className="empty-state">Loading…</div>
      </div>
    )
  }

  if (loadError || !item) {
    return (
      <div className="page">
        <div className="empty-state">
          <p className="section-label" style={{ marginTop: 0 }}>
            {loadError || 'Report not found'}
          </p>
          <Link to="/feed" className="btn btn--ghost">Back to feed</Link>
        </div>
      </div>
    )
  }

  const matches = findMatches(item, allItems)
  const statusKind = item.status === 'active' ? item.type : item.status

  return (
    <div className="page">
      <Link to="/feed" style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
        ← Back to feed
      </Link>

      <div className="detail-layout" style={{ marginTop: 18 }}>
        <div>
          <div className="detail-photo">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              'Photo not uploaded'
            )}
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
            <StampBadge kind={statusKind} />
            <span className="tag-card__id">{item.id}</span>
          </div>
          <h1 className="title" style={{ fontSize: 26 }}>{item.title}</h1>
          <p className="lede">{item.description}</p>

          <dl className="kv-grid">
            <div>
              <dt>Category</dt>
              <dd>{item.category}</dd>
            </div>
            <div>
              <dt>Location</dt>
              <dd>{item.location}</dd>
            </div>
            <div>
              <dt>Brand</dt>
              <dd>{item.brand}</dd>
            </div>
            <div>
              <dt>Colour</dt>
              <dd>{item.colour}</dd>
            </div>
            <div>
              <dt>Date</dt>
              <dd>{new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</dd>
            </div>
          </dl>

          {item.status === 'active' && (
            <button className="btn btn--primary" style={{ marginTop: 6 }}>
              {item.type === 'lost' ? 'This is mine — start a claim' : 'I think this is mine'}
            </button>
          )}
        </div>
      </div>

      <p className="section-label">
        Possible matches from {item.type === 'lost' ? 'found' : 'lost'} reports
      </p>
      <p className="lede" style={{ marginBottom: 4 }}>
        Ranked using the weighted match score — category, brand, colour, location, date and
        description overlap. These suggestions assist review; they don't prove ownership.
      </p>

      {matches.length === 0 ? (
        <div className="empty-state">No matching reports in this category yet.</div>
      ) : (
        <div>
          {matches.map(({ item: m, score }) => {
            const tier = scoreTier(score)
            return (
              <Link to={`/item/${m.id}`} key={m.id} className="match-row">
                <div className={`match-score${tier.kind ? ` match-score--${tier.kind}` : ''}`}>{score}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                    <strong style={{ fontSize: 14 }}>{m.title}</strong>
                    <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{tier.label}</span>
                  </div>
                  <div className="bar">
                    <div
                      className="bar__fill"
                      style={{
                        width: `${score}%`,
                        background:
                          tier.kind === 'low' ? 'var(--ink-soft)' : tier.kind === 'mid' ? 'var(--claim)' : 'var(--found)',
                      }}
                    />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
