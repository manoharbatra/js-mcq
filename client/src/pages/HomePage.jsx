import { certifications, collegeVisits, corporateAppreciations } from '../data/siteContent.js'
import { AboutSection } from '../components/home/aboutSection'
import { CommunityStrip } from '../components/home/communityStrip'
import { FeedbackWall } from '../components/home/feedbackWall'
import { GallerySection } from '../components/home/gallerySection'
import { HeroSection } from '../components/home/heroSection'
import { PeopleCarousel } from '../components/home/peopleCarousel'
import '../site.css'

// Landing page shown at `/`, section by section, inside the app shell.
export function HomePage() {
  return (
    <div className="site">
      <HeroSection />
      <CommunityStrip />
      <h2 className="site-page-title home-trust-title">Trusted by 150K+ learners worldwide. 🚀</h2>
      <PeopleCarousel />
      <GallerySection title="College Visits" items={collegeVisits} showCaptions cardWidth={280} />
      <GallerySection
        title="Corporate Appreciations & Awards"
        items={corporateAppreciations}
        filterLabel="Filter by organisation"
        zoomable
        cardWidth={300}
        imageFit="contain"
      />
      <GallerySection
        title="Certifications"
        items={certifications}
        filterLabel="Filter by issuer"
        zoomable
        cardWidth={300}
        imageFit="contain"
      />
      <FeedbackWall />
      <AboutSection />
    </div>
  )
}
