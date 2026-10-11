import { ArrowUpRight } from 'lucide-react'
import { courseCategories } from '../data/siteContent.js'
import '../site.css'
import './CoursesPage.css'

export function CoursesPage() {
  return (
    <div className="site courses-page">
      <div className="site-container">
        <h1 className="site-page-title">Trusted by 150K+ learners worldwide. 🚀</h1>

        {courseCategories.map((category, categoryIndex) => (
          <section className="course-category" key={category.title} aria-labelledby={`course-category-${categoryIndex}`}>
            <ul className="course-grid">
              {category.courses.map((course) => (
                <li className="course-card" key={course.href}>
                  <img className="course-card-image" src={course.image} alt="" loading="lazy" />
                  <div className="course-card-body">
                    <h3>{course.title}</h3>
                    <p>{course.description}</p>
                    <span className="course-card-meta">{course.meta}</span>
                    <a className="site-button course-card-cta" href={course.href} target="_blank" rel="noopener noreferrer">
                      Click Here <ArrowUpRight size={17} aria-hidden="true" />
                      <span className="visually-hidden"> to open {course.title} (opens in a new tab)</span>
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
