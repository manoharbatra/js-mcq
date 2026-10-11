// Practice URLs: `/:technologySlug`, `/:technologySlug/:sectionSlug` and `/:technologySlug/:sectionSlug/:topicSlug`.
export function buildPath(...slugs) {
  return `/${slugs.filter(Boolean).map(encodeURIComponent).join('/')}`
}
