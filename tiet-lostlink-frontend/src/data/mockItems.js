// Display labels shown in the UI (unchanged from the original design).
export const CATEGORIES = [
  'Backpacks & bags',
  'Water bottles & tumblers',
  'Wallets & purses',
  'Earbuds & headphone cases',
  'Keys & keychains',
  'Books & notebooks',
]

// Maps each display label to the enum value the backend/database expects.
export const CATEGORY_VALUE = {
  'Backpacks & bags': 'backpacks_bags',
  'Water bottles & tumblers': 'water_bottles',
  'Wallets & purses': 'wallets_purses',
  'Earbuds & headphone cases': 'earbuds_headphones',
  'Keys & keychains': 'keys_keychains',
  'Books & notebooks': 'books_notebooks',
}

// Reverse lookup: backend enum value -> display label.
export const CATEGORY_LABEL = Object.fromEntries(
  Object.entries(CATEGORY_VALUE).map(([label, value]) => [value, label])
)

export const LOCATIONS = [
  'LT Complex',
  'Central Library',
  'Hostel J',
  'Hostel A',
  'Sports Complex',
  'Cafeteria',
  'Academic Block 2',
]

/**
 * Converts a raw report row from the backend (snake_case, enum category,
 * event_date) into the shape the existing UI components (TagCard,
 * ItemDetail, Feed) already expect (id, type, category label, date, etc).
 */
export function toViewItem(report) {
  return {
    id: report.report_code,
    reportId: report.id,
    type: report.report_type,
    status: report.status,
    category: CATEGORY_LABEL[report.category] || report.category,
    title: report.title,
    description: report.public_description,
    brand: report.brand || '—',
    colour: report.colour || '—',
    location: report.campus_location || '—',
    date: report.event_date,
    imageUrl: report.image_url || null,
  }
}

// Rough client-side stand-in for the weighted match algorithm in the
// proposal (category 30 / brand 15 / colour 15 / location 15 / date 15 / description 10)
export function scoreMatch(a, b) {
  let score = 0
  if (a.category === b.category) score += 30
  if (a.brand !== '—' && a.brand === b.brand) score += 15
  if (a.colour === b.colour) score += 15
  if (a.location === b.location) score += 15
  const days = Math.abs(new Date(a.date) - new Date(b.date)) / 86400000
  if (days <= 3) score += 15
  const wordsA = new Set(a.description.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/))
  const wordsB = new Set(b.description.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/))
  const shared = [...wordsA].filter((w) => wordsB.has(w) && w.length > 3)
  score += Math.min(10, shared.length * 3)
  return score
}

/**
 * Finds and ranks possible matches for `item` against `allItems`
 * (both already converted via toViewItem). Used on the item detail page.
 */
export function findMatches(item, allItems) {
  const oppositeType = item.type === 'lost' ? 'found' : 'lost'
  return allItems
    .filter((i) => i.type === oppositeType && i.category === item.category && i.id !== item.id)
    .map((i) => ({ item: i, score: scoreMatch(item, i) }))
    .sort((a, b) => b.score - a.score)
}
