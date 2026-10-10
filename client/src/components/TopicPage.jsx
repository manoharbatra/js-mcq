import { useEffect, useRef, useState } from 'react'
import { fetchQuestions } from '../api.js'
import { buildPath } from '../router.js'
import { Icon } from './Icon.jsx'
import { Link } from './Link.jsx'
import { QuestionPanel } from './QuestionPanel.jsx'
import { StatusCard } from './StatusCard.jsx'

function RailCard({ icon, title, children }) {
  return (
    <section className="card rail-card">
      <h2 className="rail-title"><Icon name={icon} size={17} />{title}</h2>
      {children}
    </section>
  )
}

function scrollToQuestion(number, behavior = 'smooth') {
  const card = document.getElementById(`q-${number}`)
  if (!card) return
  card.scrollIntoView({ behavior, block: 'start' })
  window.history.replaceState(null, '', `#q-${number}`)
}

// Rendered with a key per topic, so state starts fresh whenever the topic changes.
export function TopicPage({ technology, section, topic }) {
  const [questionsState, setQuestionsState] = useState({ status: 'loading', questions: [], error: '' })
  const [requestId, setRequestId] = useState(0)
  const [activeNumber, setActiveNumber] = useState(1)
  const listRef = useRef(null)

  useEffect(() => {
    const controller = new AbortController()
    fetchQuestions(technology.slug, section.slug, topic.slug, controller.signal)
      .then((questions) => setQuestionsState({ status: 'ready', questions, error: '' }))
      .catch((error) => {
        if (!controller.signal.aborted) setQuestionsState({ status: 'error', questions: [], error: error.message })
      })
    return () => controller.abort()
  }, [technology.slug, section.slug, topic.slug, requestId])

  const { status, questions, error } = questionsState
  const total = questions.length

  // Honour a `#q-N` deep link once the questions have rendered.
  useEffect(() => {
    if (status !== 'ready') return
    const match = /^#q-(\d+)$/.exec(window.location.hash)
    if (match) scrollToQuestion(Number(match[1]), 'auto')
  }, [status])

  // Track the top-most question in the upper part of the visible area to highlight it in the rail.
  useEffect(() => {
    const list = listRef.current
    if (status !== 'ready' || !list) return
    const visibleNumbers = new Set()
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const number = Number(entry.target.dataset.number)
        if (entry.isIntersecting) visibleNumbers.add(number)
        else visibleNumbers.delete(number)
      }
      if (visibleNumbers.size) setActiveNumber(Math.min(...visibleNumbers))
    }, { rootMargin: '-80px 0px -55% 0px' })
    for (const card of list.querySelectorAll('.question-card')) observer.observe(card)
    return () => observer.disconnect()
  }, [status, total])

  function retry() {
    setQuestionsState({ status: 'loading', questions: [], error: '' })
    setRequestId((id) => id + 1)
  }

  const activeQuestion = questions[Math.min(activeNumber, total) - 1]

  return (
    <div className="question-layout">
      <div className="question-column">
        <header className="page-header">
          <h1>{topic.name}</h1>
          <p>
            {status === 'ready' ? `${total} ${total === 1 ? 'question' : 'questions'} · ` : ''}
            {technology.name} › {section.name}
          </p>
        </header>
        {status === 'loading' ? (
          <StatusCard isLoading message="Loading questions…" />
        ) : status === 'error' ? (
          <StatusCard isError title="Couldn’t load questions" message={error} onRetry={retry} />
        ) : !total ? (
          <StatusCard title="No questions in this topic yet" message="Questions will appear here once they’re added." />
        ) : (
          <div className="question-list" ref={listRef}>
            {questions.map((question, index) => (
              <QuestionPanel key={question.id} question={question} number={index + 1} total={total} />
            ))}
          </div>
        )}
      </div>

      <aside className="rail" aria-label={`${topic.name} navigation`}>
        <RailCard icon="layers" title={`Topics in ${section.name}`}>
          <ul className="rail-list">
            {section.topics.map((item) => {
              const isCurrent = item.slug === topic.slug
              return (
                <li key={item.id}>
                  <Link
                    className={`rail-link ${isCurrent ? 'active' : ''}`}
                    to={buildPath(technology.slug, section.slug, item.slug)}
                    aria-current={isCurrent ? 'page' : undefined}
                  >
                    <span className="rail-dot" />
                    <span className="rail-link-text">{item.name}</span>
                    <span className="rail-count">{isCurrent && status === 'ready' ? total : item.questionCount}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </RailCard>

        {activeQuestion && (activeQuestion.mediumUrl || activeQuestion.compilerUrl) && (
          <RailCard icon="book" title="Concept Resources">
            <ul className="rail-list">
              {activeQuestion.mediumUrl && (
                <li>
                  <a className="resource-link" href={activeQuestion.mediumUrl} target="_blank" rel="noopener noreferrer">
                    <span>Read the concept article</span><Icon name="external" size={16} />
                  </a>
                </li>
              )}
              {activeQuestion.compilerUrl && (
                <li>
                  <a className="resource-link" href={activeQuestion.compilerUrl} target="_blank" rel="noopener noreferrer">
                    <span>Practice in the compiler</span><Icon name="external" size={16} />
                  </a>
                </li>
              )}
            </ul>
          </RailCard>
        )}

        {total > 1 && (
          <RailCard icon="list" title="More Practice">
            <ol className="question-grid">
              {questions.map((item, index) => {
                const number = index + 1
                const isCurrent = number === activeNumber
                return (
                  <li key={item.id}>
                    <a
                      className={`question-chip ${isCurrent ? 'active' : ''}`}
                      href={`#q-${number}`}
                      onClick={(event) => {
                        event.preventDefault()
                        setActiveNumber(number)
                        scrollToQuestion(number)
                      }}
                      aria-current={isCurrent ? 'true' : undefined}
                      aria-label={`Question ${number}: ${item.title}`}
                      title={item.title}
                    >
                      {number}
                    </a>
                  </li>
                )
              })}
            </ol>
          </RailCard>
        )}
      </aside>
    </div>
  )
}
