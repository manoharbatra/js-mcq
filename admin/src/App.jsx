import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { apiRequest, encodeQuery } from './api.js'

const navigation = [
  { id: 'overview', label: 'Overview', icon: '◫' },
  { id: 'topics', label: 'Topics & subtopics', icon: '▤' },
  { id: 'questions', label: 'MCQ library', icon: '☷' },
]

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function ErrorNotice({ children, onDismiss }) {
  if (!children) return null
  return (
    <div className="notice notice-error" role="alert">
      <span>{children}</span>
      {onDismiss && <button className="notice-close" type="button" onClick={onDismiss} aria-label="Dismiss">×</button>}
    </div>
  )
}

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await onLogin(email, password)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="login-shell">
      <section className="login-card">
        <div className="login-mark">JS</div>
        <p className="eyebrow">CONTENT CONTROL CENTER</p>
        <h1>Welcome back</h1>
        <p className="login-copy">Sign in with your provisioned administrator account.</p>
        <ErrorNotice>{error}</ErrorNotice>
        <form className="stack-form" onSubmit={submit}>
          <label className="field">
            <span>Email address</span>
            <input autoComplete="username" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label className="field">
            <span>Password</span>
            <input autoComplete="current-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>
          <button className="button button-primary button-wide" type="submit" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="login-footnote"><span className="secure-dot" /> Protected administrator access</p>
      </section>
    </main>
  )
}

function Overview({ topics, questions, onNavigate }) {
  const subtopicCount = topics.reduce((sum, topic) => sum + (topic.subtopics?.length ?? 0), 0)
  const resourceCount = questions.filter((question) => question.mediumUrl || question.compilerUrl).length
  const recentQuestions = [...questions].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5)

  return (
    <>
      <div className="page-heading">
        <div><p className="eyebrow">YOUR WORKSPACE</p><h1>Overview</h1><p className="page-subtitle">Manage your learning content from one place.</p></div>
        <button className="button button-primary" type="button" onClick={() => onNavigate('questions', true)}>＋ Create question</button>
      </div>
      <div className="stats-grid">
        <article className="stat-card"><span className="stat-icon icon-violet">▤</span><span className="stat-label">Topics</span><strong>{topics.length}</strong><span className="stat-note">Learning categories</span></article>
        <article className="stat-card"><span className="stat-icon icon-blue">⌘</span><span className="stat-label">Subtopics</span><strong>{subtopicCount}</strong><span className="stat-note">Organized concepts</span></article>
        <article className="stat-card"><span className="stat-icon icon-gold">☷</span><span className="stat-label">Questions</span><strong>{questions.length}</strong><span className="stat-note">MCQs in your library</span></article>
        <article className="stat-card"><span className="stat-icon icon-green">↗</span><span className="stat-label">With resources</span><strong>{resourceCount}</strong><span className="stat-note">Questions with useful links</span></article>
      </div>
      <section className="panel recent-panel">
        <div className="panel-heading"><div><h2>Recently updated questions</h2><p>Your latest edits across the library</p></div><button className="text-button" type="button" onClick={() => onNavigate('questions')}>View all <span>→</span></button></div>
        {recentQuestions.length === 0 ? <EmptyState title="No questions yet" detail="Create a topic structure, then add your first MCQ." /> : (
          <div className="table-wrap"><table><thead><tr><th>Question</th><th>Topic</th><th>Subtopic</th><th>Updated</th></tr></thead><tbody>
            {recentQuestions.map((question) => <tr key={question._id}><td className="question-cell">{question.title}</td><td>{topicName(topics, question.topic)}</td><td>{subtopicName(topics, question.subtopic)}</td><td>{new Date(question.updatedAt).toLocaleDateString()}</td></tr>)}
          </tbody></table></div>
        )}
      </section>
    </>
  )
}

function EmptyState({ title, detail }) {
  return <div className="empty-state"><span className="empty-icon">◇</span><strong>{title}</strong><p>{detail}</p></div>
}

function topicName(topics, id) {
  return topics.find((topic) => topic._id === id || topic._id === id?.toString())?.name ?? '—'
}

function subtopicName(topics, id) {
  for (const topic of topics) {
    const match = topic.subtopics?.find((item) => item._id === id || item._id === id?.toString())
    if (match) return match.name
  }
  return '—'
}

function TopicsPage({ topics, refresh, notify }) {
  const [selectedId, setSelectedId] = useState('')
  const [topicEditing, setTopicEditing] = useState(null)
  const [subtopicEditing, setSubtopicEditing] = useState(null)
  const [topicForm, setTopicForm] = useState(emptyTopic)
  const [subtopicForm, setSubtopicForm] = useState(emptySubtopic)
  const [savingTopic, setSavingTopic] = useState(false)
  const [savingSubtopic, setSavingSubtopic] = useState(false)

  const selectedTopic = topics.find((topic) => topic._id === selectedId) ?? topics[0] ?? null
  useEffect(() => {
    if (!selectedTopic) {
      setSelectedId('')
      return
    }
    if (selectedId !== selectedTopic._id) setSelectedId(selectedTopic._id)
  }, [selectedId, selectedTopic])

  function beginTopicEdit(topic) {
    setTopicEditing(topic?._id ?? 'new')
    setTopicForm(topic ? {
      name: topic.name,
      slug: topic.slug,
      description: topic.description ?? '',
    } : emptyTopic())
  }

  function beginSubtopicEdit(subtopic) {
    setSubtopicEditing(subtopic?._id ?? 'new')
    setSubtopicForm(subtopic ? {
      name: subtopic.name,
      slug: subtopic.slug,
      description: subtopic.description ?? '',
    } : emptySubtopic())
  }

  async function saveTopic(event) {
    event.preventDefault()
    setSavingTopic(true)
    try {
      const editing = topicEditing !== 'new'
      const result = await apiRequest(editing ? `/admin/topics/${topicEditing}` : '/admin/topics', {
        method: editing ? 'PATCH' : 'POST',
        body: topicForm,
      })
      await refresh()
      setSelectedId(result.topic._id)
      setTopicEditing(null)
      notify(editing ? 'Topic updated.' : 'Topic created.')
    } catch (error) {
      notify(error.message, 'error')
    } finally {
      setSavingTopic(false)
    }
  }

  async function saveSubtopic(event) {
    event.preventDefault()
    if (!selectedTopic) return
    setSavingSubtopic(true)
    try {
      const editing = subtopicEditing !== 'new'
      await apiRequest(
        editing ? `/admin/subtopics/${subtopicEditing}` : `/admin/topics/${selectedTopic._id}/subtopics`,
        { method: editing ? 'PATCH' : 'POST', body: subtopicForm },
      )
      await refresh()
      setSubtopicEditing(null)
      notify(editing ? 'Subtopic updated.' : 'Subtopic created.')
    } catch (error) {
      notify(error.message, 'error')
    } finally {
      setSavingSubtopic(false)
    }
  }

  async function deleteTopic(topic) {
    if (!window.confirm(`Delete “${topic.name}”? Topics with subtopics or questions cannot be deleted.`)) return
    try {
      await apiRequest(`/admin/topics/${topic._id}`, { method: 'DELETE' })
      if (topic._id === selectedTopic?._id) setSelectedId('')
      await refresh()
      notify('Topic deleted.')
    } catch (error) {
      notify(error.message, 'error')
    }
  }

  async function deleteSubtopic(subtopic) {
    if (!window.confirm(`Delete “${subtopic.name}”? Subtopics with questions cannot be deleted.`)) return
    try {
      await apiRequest(`/admin/subtopics/${subtopic._id}`, { method: 'DELETE' })
      await refresh()
      notify('Subtopic deleted.')
    } catch (error) {
      notify(error.message, 'error')
    }
  }

  return (
    <>
      <div className="page-heading"><div><p className="eyebrow">CONTENT STRUCTURE</p><h1>Topics & subtopics</h1><p className="page-subtitle">Organize your question library into clear learning paths.</p></div><button className="button button-primary" type="button" onClick={() => beginTopicEdit(null)}>＋ New topic</button></div>
      <div className="topics-layout">
        <section className="panel topic-list-panel">
          <div className="panel-heading"><div><h2>Topics</h2><p>{topics.length} {topics.length === 1 ? 'category' : 'categories'}</p></div></div>
          {topics.length === 0 ? <EmptyState title="No topics created" detail="Add a topic to start organizing your MCQs." /> : (
            <div className="topic-list">{topics.map((topic) => (
              <button className={`topic-select ${selectedTopic?._id === topic._id ? 'selected' : ''}`} key={topic._id} type="button" onClick={() => { setSelectedId(topic._id); setTopicEditing(null); setSubtopicEditing(null) }}>
                <span className="topic-select-mark">#</span>
                <span className="topic-select-copy"><strong>{topic.name}</strong><small>{topic.subtopics?.length ?? 0} subtopics</small></span>
              </button>
            ))}</div>
          )}
        </section>
        <div className="topic-detail-column">
          {topicEditing !== null ? (
            <TopicForm
              form={topicForm}
              setForm={setTopicForm}
              isNew={topicEditing === 'new'}
              busy={savingTopic}
              onCancel={() => setTopicEditing(null)}
              onSubmit={saveTopic}
            />
          ) : selectedTopic ? (
            <>
              <section className="panel topic-summary">
                <div className="topic-summary-head"><div><span className="topic-summary-icon">#</span><div><p className="eyebrow">TOPIC</p><h2>{selectedTopic.name}</h2></div></div><div className="inline-actions"><button className="button button-secondary button-small" type="button" onClick={() => beginTopicEdit(selectedTopic)}>Edit</button><button className="button button-danger button-small" type="button" onClick={() => deleteTopic(selectedTopic)}>Delete</button></div></div>
                <p className="topic-description">{selectedTopic.description || 'No description added.'}</p>
                <div className="topic-meta"><span>/{selectedTopic.slug}</span></div>
              </section>
              <section className="panel subtopic-panel">
                <div className="panel-heading"><div><h2>Subtopics</h2><p>Concepts grouped under {selectedTopic.name}</p></div><button className="button button-secondary button-small" type="button" onClick={() => beginSubtopicEdit(null)}>＋ Add subtopic</button></div>
                {subtopicEditing !== null ? (
                  <SubtopicForm form={subtopicForm} setForm={setSubtopicForm} isNew={subtopicEditing === 'new'} busy={savingSubtopic} onCancel={() => setSubtopicEditing(null)} onSubmit={saveSubtopic} />
                ) : selectedTopic.subtopics?.length ? (
                  <div className="subtopic-list">{selectedTopic.subtopics.map((subtopic) => (
                    <article className="subtopic-row" key={subtopic._id}>
                      <span className="subtopic-mark">↳</span><div className="subtopic-copy"><strong>{subtopic.name}</strong><small>/{subtopic.slug}{subtopic.description ? ` · ${subtopic.description}` : ''}</small></div>
                      <button className="icon-button" type="button" aria-label={`Edit ${subtopic.name}`} onClick={() => beginSubtopicEdit(subtopic)}>✎</button>
                      <button className="icon-button icon-button-danger" type="button" aria-label={`Delete ${subtopic.name}`} onClick={() => deleteSubtopic(subtopic)}>×</button>
                    </article>
                  ))}</div>
                ) : <EmptyState title="No subtopics yet" detail="Create a subtopic to start adding questions under this topic." />}
              </section>
            </>
          ) : <section className="panel"><EmptyState title="Select a topic" detail="Choose a topic from the list, or create a new one." /></section>}
        </div>
      </div>
    </>
  )
}

function emptyTopic() {
  return { name: '', slug: '', description: '' }
}

function emptySubtopic() {
  return { name: '', slug: '', description: '' }
}

function TopicForm({ form, setForm, isNew, busy, onCancel, onSubmit }) {
  return <section className="panel edit-panel"><div className="panel-heading"><div><p className="eyebrow">TOPIC DETAILS</p><h2>{isNew ? 'Create topic' : 'Edit topic'}</h2></div></div>
    <form className="stack-form" onSubmit={onSubmit}>
      <label className="field"><span>Name</span><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value, ...(isNew ? { slug: slugify(event.target.value) } : {}) })} maxLength={100} required placeholder="e.g. JavaScript Basics" /></label>
      <label className="field"><span>Slug <small>URL-friendly identifier</small></span><input value={form.slug} onChange={(event) => setForm({ ...form, slug: slugify(event.target.value) })} maxLength={100} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required placeholder="javascript-basics" /></label>
      <label className="field"><span>Description <small>Optional</small></span><textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} maxLength={500} rows={3} placeholder="A short introduction to this topic…" /></label>
      <div className="form-actions"><button className="button button-secondary" type="button" onClick={onCancel}>Cancel</button><button className="button button-primary" type="submit" disabled={busy}>{busy ? 'Saving…' : isNew ? 'Create topic' : 'Save changes'}</button></div>
    </form>
  </section>
}

function SubtopicForm({ form, setForm, isNew, busy, onCancel, onSubmit }) {
  return <form className="subtopic-form" onSubmit={onSubmit}>
    <div className="subtopic-form-heading"><div><p className="eyebrow">{isNew ? 'NEW SUBTOPIC' : 'EDIT SUBTOPIC'}</p><h3>{isNew ? 'Add a subtopic' : 'Update subtopic'}</h3></div></div>
    <div className="form-grid">
      <label className="field"><span>Name</span><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value, ...(isNew ? { slug: slugify(event.target.value) } : {}) })} maxLength={100} required placeholder="e.g. Closures" /></label>
      <label className="field"><span>Slug</span><input value={form.slug} onChange={(event) => setForm({ ...form, slug: slugify(event.target.value) })} maxLength={100} required placeholder="closures" /></label>
      <label className="field field-full"><span>Description <small>Optional</small></span><input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} maxLength={500} placeholder="Short description" /></label>
    </div>
    <div className="form-actions"><button className="button button-secondary button-small" type="button" onClick={onCancel}>Cancel</button><button className="button button-primary button-small" type="submit" disabled={busy}>{busy ? 'Saving…' : isNew ? 'Add subtopic' : 'Save subtopic'}</button></div>
  </form>
}

function QuestionsPage({ topics, questions, refresh, notify, createOnLoad }) {
  const [topicFilter, setTopicFilter] = useState('')
  const [subtopicFilter, setSubtopicFilter] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyQuestion)
  const [busy, setBusy] = useState(false)
  const [search, setSearch] = useState('')
  const availableSubtopics = useMemo(() => topics.find((topic) => topic._id === topicFilter)?.subtopics ?? [], [topics, topicFilter])
  const filteredQuestions = useMemo(() => {
    const searchText = search.trim().toLowerCase()
    return questions.filter((question) => (
      (!topicFilter || question.topic === topicFilter)
      && (!subtopicFilter || question.subtopic === subtopicFilter)
      && (!searchText || question.title.toLowerCase().includes(searchText))
    ))
  }, [questions, search, subtopicFilter, topicFilter])

  useEffect(() => {
    if (subtopicFilter && !availableSubtopics.some((subtopic) => subtopic._id === subtopicFilter)) setSubtopicFilter('')
  }, [availableSubtopics, subtopicFilter])

  function startNew() {
    const topic = topics.find((item) => item._id === topicFilter) ?? topics[0]
    const subtopic = topic?.subtopics?.find((item) => item._id === subtopicFilter) ?? topic?.subtopics?.[0]
    setEditingId('new')
    setForm({ ...emptyQuestion(), topic: topic?._id ?? '', subtopic: subtopic?._id ?? '' })
  }

  useEffect(() => {
    if (createOnLoad && topics.length) startNew()
  }, [createOnLoad, topics.length])

  function startEdit(question) {
    setEditingId(question._id)
    setForm({
      topic: question.topic,
      subtopic: question.subtopic,
      title: question.title,
      label: question.label ?? 'SHORT ANSWER',
      content: question.content ?? [],
      answer: question.answer,
      mediumUrl: question.mediumUrl ?? '',
      compilerUrl: question.compilerUrl ?? '',
    })
  }

  async function saveQuestion(event) {
    event.preventDefault()
    setBusy(true)
    try {
      const isNew = editingId === 'new'
      await apiRequest(isNew ? '/admin/questions' : `/admin/questions/${editingId}`, {
        method: isNew ? 'POST' : 'PATCH',
        body: form,
      })
      setEditingId(null)
      await refresh()
      notify(isNew ? 'Question created.' : 'Question updated.')
    } catch (error) {
      notify(error.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  async function deleteQuestion(question) {
    if (!window.confirm(`Delete this question: “${question.title}”?`)) return
    try {
      await apiRequest(`/admin/questions/${question._id}`, { method: 'DELETE' })
      await refresh()
      notify('Question deleted.')
    } catch (error) {
      notify(error.message, 'error')
    }
  }

  return (
    <>
      <div className="page-heading"><div><p className="eyebrow">QUESTION BANK</p><h1>Question library</h1><p className="page-subtitle">Create and manage short-answer questions.</p></div><button className="button button-primary" type="button" onClick={startNew} disabled={!topics.some((topic) => topic.subtopics?.length)}>＋ Create question</button></div>
      {editingId !== null && <QuestionForm
        form={form}
        setForm={setForm}
        topics={topics}
        busy={busy}
        isNew={editingId === 'new'}
        onCancel={() => setEditingId(null)}
        onSubmit={saveQuestion}
      />}
      <section className="panel question-library">
        <div className="filter-row">
          <label className="search-field"><span aria-hidden="true">⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search questions…" /></label>
          <select aria-label="Filter by topic" value={topicFilter} onChange={(event) => { setTopicFilter(event.target.value); setSubtopicFilter('') }}><option value="">All topics</option>{topics.map((topic) => <option value={topic._id} key={topic._id}>{topic.name}</option>)}</select>
          <select aria-label="Filter by subtopic" value={subtopicFilter} onChange={(event) => setSubtopicFilter(event.target.value)} disabled={!availableSubtopics.length}><option value="">All subtopics</option>{availableSubtopics.map((subtopic) => <option value={subtopic._id} key={subtopic._id}>{subtopic.name}</option>)}</select>
        </div>
        {filteredQuestions.length === 0 ? <EmptyState title={questions.length ? 'No matching questions' : 'Your question library is empty'} detail={questions.length ? 'Try changing the search or filters.' : 'Create a topic and subtopic, then write your first MCQ.'} /> : (
          <div className="table-wrap"><table><thead><tr><th>Question</th><th>Topic / subtopic</th><th>Resources</th><th className="actions-heading">Actions</th></tr></thead><tbody>
            {filteredQuestions.map((question) => <tr key={question._id}>
              <td className="question-cell"><strong>{question.title}</strong><small>Short answer · {question.label}</small></td>
              <td>{topicName(topics, question.topic)}<small className="table-secondary">{subtopicName(topics, question.subtopic)}</small></td>
              <td>{[question.mediumUrl, question.compilerUrl].filter(Boolean).length || '—'}</td>
              <td className="actions-cell"><button className="button button-secondary button-small" type="button" onClick={() => startEdit(question)}>Edit</button><button className="button button-danger button-small" type="button" onClick={() => deleteQuestion(question)}>Delete</button></td>
            </tr>)}
          </tbody></table></div>
        )}
        <div className="table-footer">Showing {filteredQuestions.length} of {questions.length} questions</div>
      </section>
    </>
  )
}

function emptyQuestion() {
  return {
    topic: '',
    subtopic: '',
    title: '',
    label: 'SHORT ANSWER',
    content: [],
    answer: '',
    mediumUrl: '',
    compilerUrl: '',
  }
}

function QuestionForm({ form, setForm, topics, busy, isNew, onCancel, onSubmit }) {
  const activeTopic = topics.find((topic) => topic._id === form.topic)
  const subtopics = activeTopic?.subtopics ?? []
  const [formattingIndex, setFormattingIndex] = useState(null)
  const [formatError, setFormatError] = useState('')

  function updateContent(index, key, value) {
    setFormatError('')
    setForm({
      ...form,
      content: form.content.map((part, partIndex) => partIndex === index ? { ...part, [key]: value } : part),
    })
  }

  async function formatCode(index, code) {
    setFormattingIndex(index)
    setFormatError('')
    try {
      const [prettier, babelPlugin, estreePlugin] = await Promise.all([
        import('prettier/standalone'),
        import('prettier/plugins/babel'),
        import('prettier/plugins/estree'),
      ])
      const formattedCode = await prettier.format(code, {
        parser: 'babel',
        plugins: [babelPlugin, estreePlugin],
        semi: false,
        singleQuote: true,
      })
      updateContent(index, 'value', formattedCode)
    } catch {
      setFormatError(`Unable to format code block ${index + 1}. Check that it contains valid JavaScript.`)
    } finally {
      setFormattingIndex(null)
    }
  }

  function addContentBlock(kind) {
    if (form.content.length >= 20) return
    setForm({ ...form, content: [...form.content, { kind, value: '' }] })
  }

  return <section className="panel question-editor">
    <div className="panel-heading"><div><p className="eyebrow">{isNew ? 'NEW QUESTION' : 'EDIT QUESTION'}</p><h2>{isNew ? 'Create a short-answer question' : 'Update question'}</h2></div><button className="icon-button editor-close" type="button" aria-label="Close editor" onClick={onCancel}>×</button></div>
    <form className="stack-form" onSubmit={onSubmit}>
      <div className="form-grid">
        <label className="field"><span>Topic</span><select value={form.topic} onChange={(event) => { const topic = topics.find((item) => item._id === event.target.value); setForm({ ...form, topic: event.target.value, subtopic: topic?.subtopics?.[0]?._id ?? '' }) }} required><option value="">Choose a topic</option>{topics.map((topic) => <option value={topic._id} key={topic._id}>{topic.name}</option>)}</select></label>
        <label className="field"><span>Subtopic</span><select value={form.subtopic} onChange={(event) => setForm({ ...form, subtopic: event.target.value })} required disabled={!subtopics.length}><option value="">Choose a subtopic</option>{subtopics.map((subtopic) => <option value={subtopic._id} key={subtopic._id}>{subtopic.name}</option>)}</select></label>
        <label className="field field-full"><span>Question</span><textarea value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} maxLength={300} rows={2} required placeholder="Write a clear question…" /></label>
        <label className="field"><span>Label <small>Optional</small></span><input value={form.label} onChange={(event) => setForm({ ...form, label: event.target.value })} maxLength={60} placeholder="SHORT ANSWER" /></label>
      </div>
      <div className="editor-section">
        <div className="section-title-row"><div><h3>Question content <span className="optional-tag">Optional</span></h3><p>Add context, a code snippet, or a JSON example for learners.</p></div><div className="content-add-actions"><button className="button button-secondary button-small" type="button" onClick={() => addContentBlock('text')} disabled={form.content.length >= 20}>＋ Text</button><button className="button button-secondary button-small" type="button" onClick={() => addContentBlock('code')} disabled={form.content.length >= 20}>＋ Code</button><button className="button button-secondary button-small" type="button" onClick={() => addContentBlock('json')} disabled={form.content.length >= 20}>＋ JSON</button></div></div>
        {formatError && <div className="format-error" role="alert">{formatError}</div>}
        {form.content.length > 0 && <div className="content-blocks">{form.content.map((part, index) => {
          const codeValue = typeof part.value === 'string' ? part.value : ''
          return <div className="content-block" key={index}>
            <select aria-label={`Block ${index + 1} type`} value={part.kind} onChange={(event) => updateContent(index, 'kind', event.target.value)}><option value="text">Text</option><option value="code">Code</option><option value="json">JSON</option></select>
            <div className="content-block-body">
              {part.kind === 'code' && <div className="code-toolbar"><span>JavaScript</span><button className="prompt-format-button" type="button" disabled={formattingIndex === index || !codeValue.trim()} onClick={() => formatCode(index, codeValue)}>{formattingIndex === index ? 'Formatting…' : 'Format Code'}</button></div>}
              <textarea className={part.kind === 'code' ? 'code-input' : ''} aria-label={`Block ${index + 1} content`} value={typeof part.value === 'string' ? part.value : JSON.stringify(part.value, null, 2)} onChange={(event) => updateContent(index, 'value', event.target.value)} rows={part.kind === 'text' ? 2 : 8} placeholder={part.kind === 'code' ? 'Paste JavaScript code here…' : part.kind === 'json' ? 'Paste JSON here…' : 'Add context for the question…'} />
            </div>
            <button className="icon-button icon-button-danger" type="button" aria-label="Remove content block" onClick={() => setForm({ ...form, content: form.content.filter((_, partIndex) => partIndex !== index) })}>×</button>
          </div>
        })}</div>}
      </div>
      <label className="field"><span>Answer</span><textarea value={form.answer} onChange={(event) => setForm({ ...form, answer: event.target.value })} maxLength={10000} rows={4} required placeholder="Write the short answer learners will reveal…" /></label>
      <div className="form-grid">
        <label className="field"><span>Medium article URL <small>Optional</small></span><input type="url" value={form.mediumUrl} onChange={(event) => setForm({ ...form, mediumUrl: event.target.value })} maxLength={2048} placeholder="https://medium.com/…" /></label>
        <label className="field"><span>Online code compiler URL <small>Optional</small></span><input type="url" value={form.compilerUrl} onChange={(event) => setForm({ ...form, compilerUrl: event.target.value })} maxLength={2048} placeholder="https://…" /></label>
      </div>
      <div className="form-actions"><button className="button button-secondary" type="button" onClick={onCancel}>Cancel</button><button className="button button-primary" type="submit" disabled={busy || !subtopics.length}>{busy ? 'Saving…' : isNew ? 'Create question' : 'Save changes'}</button></div>
    </form>
  </section>
}

function App() {
  const [admin, setAdmin] = useState(null)
  const [checkingSession, setCheckingSession] = useState(true)
  const [activePage, setActivePage] = useState('overview')
  const [topics, setTopics] = useState([])
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState(null)
  const [createQuestionOnLoad, setCreateQuestionOnLoad] = useState(false)
  const noticeTimer = useRef(null)

  const notify = useCallback((message, type = 'success') => {
    setNotice({ message, type })
    window.clearTimeout(noticeTimer.current)
    noticeTimer.current = window.setTimeout(() => setNotice(null), 4500)
  }, [])

  useEffect(() => () => window.clearTimeout(noticeTimer.current), [])

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const [topicData, questionData] = await Promise.all([
        apiRequest('/admin/topics'),
        apiRequest('/admin/questions'),
      ])
      setTopics(topicData.topics)
      setQuestions(questionData.questions)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let mounted = true
    apiRequest('/auth/me')
      .then((data) => { if (mounted) setAdmin(data.admin) })
      .catch((error) => { if (error.message !== 'Authentication required' && error.message !== 'Invalid or expired session') notify(error.message, 'error') })
      .finally(() => { if (mounted) setCheckingSession(false) })
    return () => { mounted = false }
  }, [notify])

  useEffect(() => {
    function expireSession() {
      setAdmin(null)
      notify('Your session expired. Please sign in again.', 'error')
    }
    window.addEventListener('admin-session-expired', expireSession)
    return () => window.removeEventListener('admin-session-expired', expireSession)
  }, [notify])

  useEffect(() => {
    if (admin) refresh().catch((error) => notify(error.message, 'error'))
  }, [admin, refresh, notify])

  async function login(email, password) {
    const data = await apiRequest('/auth/login', { method: 'POST', body: { email, password } })
    setAdmin(data.admin)
    setActivePage('overview')
  }

  async function logout() {
    try {
      await apiRequest('/auth/logout', { method: 'POST' })
      setAdmin(null)
      setTopics([])
      setQuestions([])
      setActivePage('overview')
    } catch (error) {
      notify(error.message, 'error')
    }
  }

  function navigate(page, createQuestion = false) {
    setActivePage(page)
    setCreateQuestionOnLoad(createQuestion)
  }

  if (checkingSession) {
    return <main className="boot-screen"><div className="login-mark">JS</div><span>Opening your workspace…</span></main>
  }
  if (!admin) return <Login onLogin={login} />

  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <a className="brand" href="#overview" onClick={(event) => { event.preventDefault(); navigate('overview') }}>
          <span className="brand-mark">JS</span><span className="brand-copy"><strong>JS MCQ</strong><small>CONTENT STUDIO</small></span>
        </a>
        <div className="sidebar-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Admin sections">
          {navigation.map((item) => <button key={item.id} className={`nav-item ${activePage === item.id ? 'active' : ''}`} type="button" onClick={() => navigate(item.id)}><span className="nav-icon">{item.icon}</span>{item.label}{activePage === item.id && <span className="nav-active-mark" />}</button>)}
        </nav>
        <div className="sidebar-bottom"><div className="sidebar-status"><span className="secure-dot" /><span><strong>API connected</strong><small>Secure admin session</small></span></div><div className="sidebar-user"><span className="avatar">{admin.email.slice(0, 1).toUpperCase()}</span><span className="user-copy"><strong>{admin.email}</strong><small>Administrator</small></span><button className="logout-button" type="button" onClick={logout} aria-label="Sign out" title="Sign out">↗</button></div></div>
      </aside>
      <main className="main-area">
        <header className="topbar"><div className="crumb"><span>Workspace</span><span className="crumb-slash">/</span><strong>{navigation.find((item) => item.id === activePage)?.label}</strong></div><div className="topbar-right"><span className="admin-tag">ADMIN</span><span className="topbar-avatar">{admin.email.slice(0, 1).toUpperCase()}</span></div></header>
        <div className="content-area">
          {notice && <div className={`toast ${notice.type === 'error' ? 'toast-error' : ''}`} role={notice.type === 'error' ? 'alert' : 'status'}><span>{notice.type === 'error' ? '!' : '✓'}</span>{notice.message}<button type="button" onClick={() => setNotice(null)} aria-label="Dismiss notification">×</button></div>}
          {loading && <div className="loading-line"><span /> Syncing content…</div>}
          {activePage === 'overview' && <Overview topics={topics} questions={questions} onNavigate={navigate} />}
          {activePage === 'topics' && <TopicsPage topics={topics} refresh={refresh} notify={notify} />}
          {activePage === 'questions' && <QuestionsPage topics={topics} questions={questions} refresh={refresh} notify={notify} createOnLoad={createQuestionOnLoad} />}
        </div>
      </main>
    </div>
  )
}

export default App
