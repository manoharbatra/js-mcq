import { useCatalog } from '../catalogContext.js'
import { SectionPage } from '../components/sectionPage'

export function SectionRoute() {
  const { technology, section } = useCatalog()
  return <SectionPage technology={technology} section={section} />
}
