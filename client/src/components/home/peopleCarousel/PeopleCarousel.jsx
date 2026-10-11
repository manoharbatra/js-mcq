import { peopleMet } from '../../../data/siteContent.js'
import { useRevealOnScroll } from '../../../hooks/useRevealOnScroll.js'
import { Carousel } from '../../carousel'
import './PeopleCarousel.css'

// Sliding cards of creators and industry leaders: photo, name, short description and (optionally) company logo.
export function PeopleCarousel() {
  const revealRef = useRevealOnScroll()

  return (
    <section className="site-section people-carousel reveal" ref={revealRef} aria-label="Creators and industry leaders">
      <Carousel label="Creators and industry leaders">
        {peopleMet.map((person) => (
          <li key={person.image} className="person-card">
            <img className="person-photo" src={person.image} alt={person.name} loading="lazy" draggable="false" />
            <p className="person-name">{person.name}</p>
            <p className="person-description">{person.description}</p>
            {person.logo && <img className="person-logo" src={person.logo} alt={person.company} loading="lazy" draggable="false" />}
          </li>
        ))}
      </Carousel>
    </section>
  )
}
