import { useState } from 'react'
import { questionSets } from './questions'
import './App.css'

function JsonBlock({ value }) {
  const initialJson = typeof value === 'string' ? value : JSON.stringify(value)
  const [jsonText, setJsonText] = useState(initialJson)
  const [hasFormatError, setHasFormatError] = useState(false)

  function formatJson() {
    try {
      setJsonText(JSON.stringify(JSON.parse(jsonText), null, 2))
      setHasFormatError(false)
    } catch {
      setHasFormatError(true)
    }
  }

  return (
    <div className="formatted-prompt">
      <div className="prompt-toolbar">
        {hasFormatError && <span className="prompt-format-error" role="status">Invalid JSON</span>}
        <button className="prompt-format-button" type="button" onClick={formatJson}>Format JSON</button>
      </div>
      <pre className="prompt-json"><code>{jsonText}</code></pre>
    </div>
  )
}

function CodeBlock({ value }) {
  const [codeText, setCodeText] = useState(value)
  const [hasFormatError, setHasFormatError] = useState(false)
  const [isFormatting, setIsFormatting] = useState(false)

  async function formatCode() {
    setIsFormatting(true)
    try {
      const [prettier, babelPlugin, estreePlugin] = await Promise.all([
        import('prettier/standalone'),
        import('prettier/plugins/babel'),
        import('prettier/plugins/estree'),
      ])
      const formattedCode = await prettier.format(codeText, {
        parser: 'babel',
        plugins: [babelPlugin, estreePlugin],
        semi: false,
        singleQuote: true,
      })
      setCodeText(formattedCode)
      setHasFormatError(false)
    } catch {
      setHasFormatError(true)
    } finally {
      setIsFormatting(false)
    }
  }

  return (
    <div className="formatted-prompt">
      <div className="prompt-toolbar">
        {hasFormatError && <span className="prompt-format-error" role="status">Unable to format code</span>}
        <button className="prompt-format-button" type="button" onClick={formatCode} disabled={isFormatting}>
          {isFormatting ? 'Formatting...' : 'Format Code'}
        </button>
      </div>
      <pre className="prompt-code"><code>{codeText}</code></pre>
    </div>
  )
}

function Prompt({ question }) {
  if (question.type === 'code') return <CodeBlock value={question.code} />
  if (question.type === 'text') return <p className="prompt-text">{question.prompt}</p>
  if (question.type === 'json') {
    return <div className="json-question"><p>{question.data.question}</p><JsonBlock key={question.title} value={question.data.choices} /></div>
  }
  return <div className="prompt-parts">{question.parts.map((part, index) => part.kind === 'text'
    ? <p className="prompt-text" key={index}>{part.value}</p>
    : part.kind === 'json'
      ? <JsonBlock key={index} value={part.value} />
      : <CodeBlock key={index} value={part.value} />)}</div>
}

function QuestionCard({ question, index, total }) {
  const [isAnswerVisible, setIsAnswerVisible] = useState(false)
  const answerId = `answer-explanation-${index}`

  return (
    <article className="question-card">
      <div className="question-meta"><span>QUESTION <strong>{String(index + 1).padStart(2, '0')}</strong> <span className="meta-divider">/</span> {String(total).padStart(2, '0')}</span><span className="question-tag">{question.label}</span></div>
      <div className="progress-track" role="progressbar" aria-label={`Question ${index + 1} progress`} aria-valuenow={index + 1} aria-valuemin={1} aria-valuemax={total}><span style={{ width: `${((index + 1) / total) * 100}%` }} /></div>
      {question.eyebrow && <p className="eyebrow">{question.eyebrow}</p>}
      <h2 className="question-title">{question.title}</h2>
      <Prompt question={question} />
      <div className="answer-area">
        <div className="answer-heading">
          <button
            className="reveal-button"
            type="button"
            aria-expanded={isAnswerVisible}
            aria-controls={answerId}
            onClick={() => setIsAnswerVisible(!isAnswerVisible)}
          >
            <span aria-hidden="true">{isAnswerVisible ? '−' : '+'}</span>
            {isAnswerVisible ? 'Hide Answer' : 'Show Answer'}
          </button>
        </div>
        <div id={answerId} className="revealed-answer" hidden={!isAnswerVisible}>
          <p>{question.answer}</p>
        </div>
      </div>
    </article>
  )
}

function App() {
  const [activeTopic, setActiveTopic] = useState('Closures')

  function selectTopic(topic) {
    setActiveTopic(topic)
  }

  const selectedTopic = questionSets.find((topicSet) => topicSet.topic === activeTopic)
  const questionSet = selectedTopic.questions

  return (
    <div className="study-app">
      <aside className="sidebar">
        <a className="brand" href="#top" aria-label="JS MCQ Practice home"><span className="brand-mark">JS</span><span>JS MCQ Practice</span></a>
        <nav className="topic-nav" aria-label="Topics">
          <div className="nav-section"><span className="nav-section-icon">⌘</span><span>JavaScript Basics</span><span className="chevron">⌃</span></div>
          <ul className="topic-list">
            {questionSets.map((topicSet) => <li key={topicSet.topic}>
              <button className={`topic-item ${topicSet.topic === activeTopic ? 'active' : ''}`} onClick={() => selectTopic(topicSet.topic)}>
                <span className="topic-marker" />{topicSet.topic}<span className="topic-count">{topicSet.questions.length}</span>
              </button>
              {topicSet.mediumLink && (
                <a
                  className="topic-medium-link"
                  href={topicSet.mediumLink}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open the Medium article for ${topicSet.topic}`}
                >
                  Medium
                </a>
              )}
            </li>)}
          </ul>
          </nav>
        <div className="sidebar-foot"><span className="status-dot" /> Your progress is saved locally</div>
      </aside>

      <main className="main-content" id="top">
        <header className="topbar"><div className="breadcrumbs"><span>JavaScript Basics</span><span className="crumb-divider">/</span><span>{activeTopic}</span></div><span className="topbar-note">PRACTICE SET <span>01</span></span></header>
        <section className="workspace">
          {questionSet.map((question, index) => (
            <QuestionCard key={`${activeTopic}-${index}`} question={question} index={index} total={questionSet.length} />
          ))}
          <footer className="workspace-footer"><span>Keep going. Every question makes the concepts clearer.</span><span>JS MCQ <i>·</i> LEARNING BY DOING</span></footer>
        </section>
      </main>
    </div>
  )
}

export default App
