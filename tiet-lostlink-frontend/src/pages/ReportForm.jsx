import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CATEGORIES, CATEGORY_VALUE, LOCATIONS } from '../data/mockItems.js'
import { supabase } from '../supabaseClient.js'
import api from '../api.js'

export default function ReportForm({ type }) {
  const navigate = useNavigate()
  const isLost = type === 'lost'

  const [form, setForm] = useState({
    category: '',
    brand: '',
    colour: '',
    location: '',
    date: '',
    description: '',
    privateDetail: '',
  })
  const [photoFile, setPhotoFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  async function uploadPhotoIfPresent() {
    if (!photoFile) return null
    const fileExt = photoFile.name.split('.').pop()
    const fileName = `${crypto.randomUUID()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('item-photos')
      .upload(fileName, photoFile, { cacheControl: '3600', upsert: false })

    if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`)

    const { data } = supabase.storage.from('item-photos').getPublicUrl(fileName)
    return data.publicUrl
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.category || !form.colour || !form.location || !form.date || !form.description) {
      setError('Please fill in every required field.')
      return
    }

    setSubmitting(true)
    try {
      const image_url = await uploadPhotoIfPresent()

      await api.post('/reports', {
        report_type: type,
        category: CATEGORY_VALUE[form.category],
        title: form.description.slice(0, 60),
        public_description: form.description,
        private_detail: form.privateDetail || null,
        colour: form.colour,
        brand: form.brand || null,
        campus_location: form.location,
        event_date: form.date,
        image_url,
      })

      setSubmitted(true)
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to submit report.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="page page--narrow">
        <div className="form-card" style={{ textAlign: 'center' }}>
          <span className={`stamp stamp--${type}`} style={{ marginBottom: 14 }}>
            {isLost ? 'Lost' : 'Found'}
          </span>
          <h1 className="title" style={{ fontSize: 24 }}>Report submitted</h1>
          <p className="lede" style={{ margin: '0 auto 20px' }}>
            Your report has been added to the feed with a new report ID. We'll surface possible
            matches from the opposite list automatically.
          </p>
          <button className="btn btn--primary" onClick={() => navigate('/feed')}>
            View the feed
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page page--narrow">
      <p className="eyebrow">{isLost ? 'Lost-item report' : 'Found-item report'}</p>
      <h1 className="title" style={{ fontSize: 26 }}>
        {isLost ? 'Tell us what you lost' : 'Tell us what you found'}
      </h1>
      <p className="lede" style={{ marginBottom: 22 }}>
        {isLost
          ? 'Structured details help the matching algorithm rank possible finds accurately.'
          : "Keep one distinguishing detail private below — it's used later to verify the real owner's claim."}
      </p>

      {error && <p style={{ color: 'var(--lost)', fontSize: 13, marginBottom: 14 }}>{error}</p>}

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="field field--full">
            <label htmlFor="category">Item category</label>
            <select
              id="category"
              className="select"
              required
              value={form.category}
              onChange={update('category')}
            >
              <option value="" disabled>
                Select a category
              </option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="brand">Brand (if known)</label>
            <input
              id="brand"
              className="input"
              placeholder="e.g. Sony, Wildcraft"
              value={form.brand}
              onChange={update('brand')}
            />
          </div>
          <div className="field">
            <label htmlFor="colour">Colour</label>
            <input
              id="colour"
              className="input"
              placeholder="e.g. Black"
              required
              value={form.colour}
              onChange={update('colour')}
            />
          </div>

          <div className="field">
            <label htmlFor="location">{isLost ? 'Last seen location' : 'Found location'}</label>
            <select
              id="location"
              className="select"
              required
              value={form.location}
              onChange={update('location')}
            >
              <option value="" disabled>
                Select a location
              </option>
              {LOCATIONS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="date">Date</label>
            <input
              id="date"
              className="input"
              type="date"
              required
              value={form.date}
              onChange={update('date')}
            />
          </div>

          <div className="field field--full">
            <label htmlFor="description">
              {isLost ? 'Public description' : 'Public description (keep one detail private below)'}
            </label>
            <textarea
              id="description"
              className="input"
              rows={4}
              placeholder="Describe the item — visible marks, stickers, size, anything a stranger could notice."
              required
              value={form.description}
              onChange={update('description')}
            />
          </div>

          {!isLost && (
            <div className="field field--full">
              <label htmlFor="private-detail">Private verification detail</label>
              <textarea
                id="private-detail"
                className="input"
                rows={2}
                placeholder="A hidden scratch, the bag's contents, a device name — shown only to you and the admin, never posted publicly."
                value={form.privateDetail}
                onChange={update('privateDetail')}
              />
            </div>
          )}

          <div className="field field--full">
            <label htmlFor="photo">Photo (optional)</label>
            <label className="upload-well" htmlFor="photo">
              {preview ? <img src={preview} alt="Item preview" /> : 'Click to upload a photo'}
            </label>
            <input id="photo" type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn--ghost" onClick={() => navigate(-1)} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className={`btn btn--${type}`} disabled={submitting}>
            {submitting ? 'Submitting…' : `Submit ${isLost ? 'lost' : 'found'} report`}
          </button>
        </div>
      </form>
    </div>
  )
}
