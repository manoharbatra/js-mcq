import { learnerFeedback } from '../../../data/siteContent.js'
import { useRevealOnScroll } from '../../../hooks/useRevealOnScroll.js'
import './FeedbackWall.css'

// "What People Say": screenshots of learner messages in three independently stacked columns.
export function FeedbackWall() {
  const revealRef = useRevealOnScroll()

  return (
    <section className="site-section feedback-wall reveal" ref={revealRef} aria-labelledby="feedback-title">
      <div className="site-container">
        <h2 className="site-section-title" id="feedback-title">What People Say</h2>
        <div className="feedback-scroller" tabIndex={0} aria-label="Messages from learners">
          {learnerFeedback.map((column, columnIndex) => (
            <ul className="feedback-column" key={columnIndex}>
              {column.map((message) => (
                <li key={message.image}>
                  <img src={message.image} alt={`Message from a learner on ${message.source}`} loading="lazy" />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  )
}
