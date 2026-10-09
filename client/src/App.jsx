import { useEffect, useState } from 'react'
import './App.css'

async function getPublicData(path) {
  const apiBase = import.meta.env.VITE_API_BASE_URL ?? '/api'
  const response = await fetch(`${apiBase}/public${path}`)
  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.error ?? `Unable to load content (${response.status})`)
  }

  return data
}

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
  if (!question.content?.length) return null
  return <div className="prompt-parts">{question.content.map((part, index) => part.kind === 'text'
    ? <p className="prompt-text" key={index}>{part.value}</p>
    : part.kind === 'json'
      ? <JsonBlock key={index} value={part.value} />
      : <CodeBlock key={index} value={part.value} />)}</div>
}

function QuestionCard({ question, index, total }) {
  const [isAnswerVisible, setIsAnswerVisible] = useState(false)
  const answerId = `answer-${question.id}`

  return (
    <article className="question-card">
      <div className="question-meta"><span>QUESTION <strong>{String(index + 1).padStart(2, '0')}</strong> <span className="meta-divider">/</span> {String(total).padStart(2, '0')}</span><span className="question-tag">{question.label}</span></div>
      <div className="progress-track" role="progressbar" aria-label={`Question ${index + 1} progress`} aria-valuenow={index + 1} aria-valuemin={1} aria-valuemax={total}><span style={{ width: `${((index + 1) / total) * 100}%` }} /></div>
      <h2 className="question-title">{question.title}</h2>
      <Prompt question={question} />
      {(question.mediumUrl || question.compilerUrl) && <div className="question-resources">
        {question.mediumUrl && <a href={question.mediumUrl} target="_blank" rel="noopener noreferrer">Read article <span aria-hidden="true">↗</span></a>}
        {question.compilerUrl && <a href={question.compilerUrl} target="_blank" rel="noopener noreferrer">Practice in compiler <span aria-hidden="true">↗</span></a>}
      </div>}
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
  const [topics, setTopics] = useState([])
  const [activeTopicId, setActiveTopicId] = useState('')
  const [activeSubtopicId, setActiveSubtopicId] = useState('')
  const [questions, setQuestions] = useState([])
  const [isTopicsLoading, setIsTopicsLoading] = useState(true)
  const [isQuestionsLoading, setIsQuestionsLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    let isCurrent = true
    setIsTopicsLoading(true)
    setLoadError('')

    getPublicData('/topics')
      .then(({ topics: loadedTopics }) => {
        if (!isCurrent) return
        setTopics(loadedTopics)
        const firstTopic = loadedTopics[0]
        setActiveTopicId((currentId) => loadedTopics.some((topic) => topic.id === currentId)
          ? currentId
          : firstTopic?.id ?? '')
      })
      .catch((error) => {
        if (!isCurrent) return
        setLoadError(error.message)
      })
      .finally(() => {
        if (isCurrent) setIsTopicsLoading(false)
      })

    return () => { isCurrent = false }
  }, [retryKey])

  const selectedTopic = topics.find((topic) => topic.id === activeTopicId) ?? null
  const subtopics = selectedTopic?.subtopics ?? []

  useEffect(() => {
    if (!subtopics.length) {
      setActiveSubtopicId('')
      return
    }
    if (!subtopics.some((subtopic) => subtopic.id === activeSubtopicId)) {
      setActiveSubtopicId(subtopics[0].id)
    }
  }, [activeSubtopicId, subtopics])

  const selectedSubtopic = subtopics.find((subtopic) => subtopic.id === activeSubtopicId) ?? null

  useEffect(() => {
    if (!selectedTopic || !selectedSubtopic) {
      setQuestions([])
      setIsQuestionsLoading(false)
      return
    }

    let isCurrent = true
    setIsQuestionsLoading(true)
    setLoadError('')
    setQuestions([])
    const path = `/topics/${encodeURIComponent(selectedTopic.slug)}/subtopics/${encodeURIComponent(selectedSubtopic.slug)}/questions`

    getPublicData(path)
      .then(({ questions: loadedQuestions }) => {
        if (isCurrent) setQuestions(loadedQuestions)
      })
      .catch((error) => {
        if (isCurrent) setLoadError(error.message)
      })
      .finally(() => {
        if (isCurrent) setIsQuestionsLoading(false)
      })

    return () => { isCurrent = false }
  }, [selectedSubtopic, selectedTopic, retryKey])

  return (
    <div className="study-app">
      <aside className="sidebar">
        <a className="brand" href="#top" aria-label="JS MCQ Practice home"><span className="brand-mark">JS</span><span>JS MCQ Practice</span></a>
        <nav className="topic-nav" aria-label="Topics">
          <div className="nav-section"><span className="nav-section-icon">⌘</span><span>Study topics</span><span className="chevron">⌃</span></div>
          {isTopicsLoading ? <p className="nav-message">Loading topics…</p> : topics.length ? (
            <ul className="topic-list">
              {topics.map((topic) => <li className="topic-nav-entry" key={topic.id}>
                <button className={`topic-item ${topic.id === activeTopicId ? 'active' : ''}`} type="button" onClick={() => setActiveTopicId(topic.id)}>
                  <span className="topic-marker" />{topic.name}<span className="topic-count">{topic.subtopics.length}</span>
                </button>
                {topic.id === activeTopicId && topic.subtopics.length > 0 && (
                  <ul className="subtopic-list" aria-label={`${topic.name} subtopics`}>
                    {topic.subtopics.map((subtopic) => <li key={subtopic.id}>
                      <button className={`subtopic-item ${subtopic.id === activeSubtopicId ? 'active' : ''}`} type="button" onClick={() => setActiveSubtopicId(subtopic.id)}>
                        <span className="subtopic-marker" />{subtopic.name}
                      </button>
                    </li>)}
                  </ul>
                )}
              </li>)}
            </ul>
          ) : !loadError && <p className="nav-message">No topics yet.</p>}
        </nav>
        <div className="sidebar-foot"><span className="status-dot" /> Learning by doing</div>
      </aside>

      <main className="main-content" id="top">
        <header className="topbar"><div className="breadcrumbs"><span>Study topics</span>{selectedTopic && <><span className="crumb-divider">/</span><span>{selectedTopic.name}</span></>}{selectedSubtopic && <><span className="crumb-divider">/</span><span>{selectedSubtopic.name}</span></>}</div><span className="topbar-note">SHORT ANSWER <span>·</span></span></header>
        <section className="workspace">
          {loadError ? (
            <div className="client-state client-error" role="alert">
              <strong>Couldn't load practice content</strong>
              <p>{loadError}</p>
              <button className="client-retry" type="button" onClick={() => setRetryKey((key) => key + 1)}>Try again</button>
            </div>
          ) : isTopicsLoading || isQuestionsLoading ? (
            <div className="client-state" role="status"><span className="loading-indicator" />Loading practice content…</div>
          ) : !topics.length ? (
            <div className="client-state"><strong>No topics available yet</strong><p>Practice topics will appear here once created.</p></div>
          ) : !subtopics.length ? (
            <div className="client-state"><strong>No subtopics available yet</strong><p>Subtopics for this topic will appear here once created.</p></div>
          ) : !questions.length ? (
            <div className="client-state"><strong>No questions in this subtopic yet</strong><p>Questions will appear here once added.</p></div>
          ) : (
            questions.map((question, index) => (
              <QuestionCard key={question.id} question={question} index={index} total={questions.length} />
            ))
          )}
          <footer className="workspace-footer"><span>Keep going. Every question makes the concepts clearer.</span><span>JS MCQ <i>·</i> LEARNING BY DOING</span></footer>
        </section>
      </main>
    </div>
  )
}

export default App
