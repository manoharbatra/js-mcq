import { useState } from 'react'
import './App.css'
import { questionSets, topics } from './questions'

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

function App() {
  const [activeTopic, setActiveTopic] = useState('Closures')
  const [activeQuestion, setActiveQuestion] = useState(0)
  const [isAnswerVisible, setIsAnswerVisible] = useState(false)

  function selectQuestion(index) {
    setActiveQuestion(index)
    setIsAnswerVisible(false)
  }

  function selectTopic(topic) {
    setActiveTopic(topic)
    setActiveQuestion(0)
    setIsAnswerVisible(false)
  }

  const questionSet = questionSets[activeTopic]
  const question = questionSet[activeQuestion]

  return (
    <div className="study-app">
      <aside className="sidebar">
        <a className="brand" href="#top" aria-label="JS MCQ Practice home"><span className="brand-mark">JS</span><span>JS MCQ Practice</span></a>
        <nav className="topic-nav" aria-label="Topics">
          <div className="nav-section"><span className="nav-section-icon">⌘</span><span>JavaScript Basics</span><span className="chevron">⌃</span></div>
          <ul className="topic-list">
            {topics.map((topic) => <li key={topic}>
              <button className={`topic-item ${topic === activeTopic ? 'active' : ''}`} onClick={() => selectTopic(topic)}>
                <span className="topic-marker" />{topic}<span className="topic-count">{questionSets[topic].length}</span>
              </button>
            </li>)}
          </ul>
          </nav>
        <div className="sidebar-foot"><span className="status-dot" /> Your progress is saved locally</div>
      </aside>

      <main className="main-content" id="top">
        <header className="topbar"><div className="breadcrumbs"><span>JavaScript Basics</span><span className="crumb-divider">/</span><span>{activeTopic}</span></div><span className="topbar-note">PRACTICE SET <span>01</span></span></header>
        <section className="workspace">
          <article className="question-card">
            <div className="question-meta"><span>QUESTION <strong>{String(activeQuestion + 1).padStart(2, '0')}</strong> <span className="meta-divider">/</span> {String(questionSet.length).padStart(2, '0')}</span><span className="question-tag">{question.label}</span></div>
            <div className="progress-track" role="progressbar" aria-label="Question progress" aria-valuenow={activeQuestion + 1} aria-valuemin={1} aria-valuemax={questionSet.length}><span style={{ width: `${((activeQuestion + 1) / questionSet.length) * 100}%` }} /></div>
            <h2 className="question-title">{question.title}</h2>
            <Prompt key={`${activeTopic}-${activeQuestion}`} question={question} />
            <div className="answer-area">
              <div className="answer-heading">
                <button
                  className="reveal-button"
                  type="button"
                  aria-expanded={isAnswerVisible}
                  aria-controls="answer-explanation"
                  onClick={() => setIsAnswerVisible(!isAnswerVisible)}
                >
                  <span aria-hidden="true">{isAnswerVisible ? '−' : '+'}</span>
                  {isAnswerVisible ? 'Hide Answer' : 'Show Answer'}
                </button>
              </div>
              <div id="answer-explanation" className="revealed-answer" hidden={!isAnswerVisible}>
                <p>{question.answer}</p>
              </div>
            </div>
            <div className="card-actions">
              <nav className="pagination" aria-label="Question navigation">
                <button
                  className="previous-button"
                  type="button"
                  onClick={() => selectQuestion(activeQuestion - 1)}
                  disabled={activeQuestion === 0}
                >
                  <svg className="arrow arrow-left" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
                  Previous
                </button>
                <button
                  className="next-button"
                  type="button"
                  onClick={() => selectQuestion(activeQuestion + 1)}
                  disabled={activeQuestion === questionSet.length - 1}
                >
                  Next
                  <svg className="arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
                </button>
              </nav>
            </div>
          </article>
          <footer className="workspace-footer"><span>Keep going. Every question makes the concepts clearer.</span><span>JS MCQ <i>·</i> LEARNING BY DOING</span></footer>
        </section>
      </main>
    </div>
  )
}

export default App
