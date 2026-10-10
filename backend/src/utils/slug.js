const maxSlugLength = 80

// "CI/CD" → "ci-cd", "C++" → "c-plus-plus", "Café & Co" → "cafe-and-co".
export function slugify(value) {
  return value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/\+/g, ' plus ')
    .replace(/#/g, ' sharp ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, maxSlugLength)
    .replace(/-+$/g, '')
}

// Returns a slug for `name` that no other record in `scope` uses, adding -2, -3… when needed.
export async function uniqueSlug(Model, name, scope, excludeId, fallback) {
  const base = slugify(name) || fallback
  const filter = { ...scope, slug: new RegExp(`^${base}(?:-\\d+)?$`) }
  if (excludeId) filter._id = { $ne: excludeId }
  const taken = new Set((await Model.find(filter).select('slug').lean()).map(({ slug }) => slug))
  if (!taken.has(base)) return base
  let suffix = 2
  while (taken.has(`${base}-${suffix}`)) suffix += 1
  return `${base}-${suffix}`
}

export function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
