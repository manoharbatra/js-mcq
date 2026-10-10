import { useState } from 'react'
import { Check, Eye, EyeOff } from 'lucide-react'
import { Prompt } from './PromptBlocks.jsx'

export function QuestionPanel({ question, number, total }) {
  const [isAnswerVisible, setIsAnswerVisible] = useState(false)
  const answerId = `answer-${question.id}`
  const titleId = `question-title-${question.id}`

  return (
    <article className="card question-card" id={`q-${number}`} data-number={number} aria-labelledby={titleId}>
      <div className="question-meta">
        <span>Question <strong>{number}</strong> of {total}</span>
        {question.label && <span className="question-tag">{question.label}</span>}
      </div>

      <h2 className="question-title" id={titleId}>{question.title}</h2>
      <Prompt content={question.content} />

      {!isAnswerVisible && (
        <button
          className="button button-primary reveal-button"
          type="button"
          aria-expanded="false"
          aria-controls={answerId}
          onClick={() => setIsAnswerVisible(true)}
        >
          <Eye size={18} /> Show Answer
        </button>
      )}
      <section id={answerId} className="answer-panel" aria-label="Answer" hidden={!isAnswerVisible}>
        <header className="answer-panel-header">
          <h3><span className="answer-check"><Check size={14} strokeWidth={3} /></span>Answer</h3>
          <button
            className="button button-secondary button-sm"
            type="button"
            aria-expanded="true"
            aria-controls={answerId}
            onClick={() => setIsAnswerVisible(false)}
          >
            <EyeOff size={16} /> Hide Answer
          </button>
        </header>
        <div className="answer-body">{question.answer}</div>
      </section>
    </article>
  )
}
