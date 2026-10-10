import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { apiRequest, encodeQuery } from './api.js'
import { useTheme } from './useTheme.js'

const CodeEditor = lazy(() => import('./CodeEditor.jsx'))

const navigation = [
  { id: 'overview', label: 'Overview', icon: '◫' },
  { id: 'catalog', label: 'Content structure', icon: '▤' },
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

function Login({ onLogin, theme, toggleTheme }) {
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
      <button className="theme-toggle login-theme-toggle" type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>{theme === 'dark' ? '☀' : '☾'}</button>
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

function Overview({ technologies, questions, onNavigate }) {
  const { sectionById, topicById, technologyById } = indexCatalog(technologies)
  const resourceCount = questions.filter((question) => question.mediumUrl || question.compilerUrl).length
  const recentQuestions = [...questions].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5)

  return (
    <>
      <div className="page-heading">
        <div><p className="eyebrow">YOUR WORKSPACE</p><h1>Overview</h1><p className="page-subtitle">Manage your learning content from one place.</p></div>
        <button className="button button-primary" type="button" onClick={() => onNavigate('questions', true)}>＋ Create question</button>
      </div>
      <div className="stats-grid">
        <article className="stat-card"><span className="stat-icon icon-violet">▤</span><span className="stat-label">Technologies</span><strong>{technologyById.size}</strong><span className="stat-note">{sectionById.size} sections</span></article>
        <article className="stat-card"><span className="stat-icon icon-blue">⌘</span><span className="stat-label">Topics</span><strong>{topicById.size}</strong><span className="stat-note">Concepts across all sections</span></article>
        <article className="stat-card"><span className="stat-icon icon-gold">☷</span><span className="stat-label">Questions</span><strong>{questions.length}</strong><span className="stat-note">Questions in your library</span></article>
        <article className="stat-card"><span className="stat-icon icon-green">↗</span><span className="stat-label">With resources</span><strong>{resourceCount}</strong><span className="stat-note">Questions with useful links</span></article>
      </div>
      <section className="panel recent-panel">
        <div className="panel-heading"><div><h2>Recently updated questions</h2><p>Your latest edits across the library</p></div><button className="text-button" type="button" onClick={() => onNavigate('questions')}>View all <span>→</span></button></div>
        {recentQuestions.length === 0 ? <EmptyState title="No questions yet" detail="Create a technology, section and topic, then add your first question." /> : (
          <div className="table-wrap"><table><thead><tr><th>Question</th><th>Technology</th><th>Section › Topic</th><th>Updated</th></tr></thead><tbody>
            {recentQuestions.map((question) => <tr key={question._id}><td className="question-cell">{question.title}</td><td>{nameOf(technologyById, question.technologyId)}</td><td>{nameOf(sectionById, question.sectionId)} › {nameOf(topicById, question.topicId)}</td><td>{new Date(question.updatedAt).toLocaleDateString()}</td></tr>)}
          </tbody></table></div>
        )}
      </section>
    </>
  )
}

function EmptyState({ title, detail }) {
  return <div className="empty-state"><span className="empty-icon">◇</span><strong>{title}</strong><p>{detail}</p></div>
}

function indexCatalog(technologies) {
  const technologyById = new Map()
  const sectionById = new Map()
  const topicById = new Map()
  for (const technology of technologies) {
    technologyById.set(technology._id, technology)
    for (const section of technology.sections) {
      sectionById.set(section._id, section)
      for (const topic of section.topics) topicById.set(topic._id, topic)
    }
  }
  return { technologyById, sectionById, topicById }
}

function nameOf(map, id) {
  return map.get(id?.toString())?.name ?? '—'
}

// The first topic matching whichever of technology/section/topic are set.
function firstPlacement(technologies, { technologyId = '', sectionId = '', topicId = '' } = {}) {
  for (const technology of technologies) {
    if (technologyId && technology._id !== technologyId) continue
    for (const section of technology.sections) {
      if (sectionId && section._id !== sectionId) continue
      for (const topic of section.topics) {
        if (topicId && topic._id !== topicId) continue
        return { technologyId: technology._id, sectionId: section._id, topicId: topic._id }
      }
    }
  }
  return { technologyId, sectionId, topicId: '' }
}

const catalogLevels = {
  technology: { singular: 'technology', plural: 'technologies', placeholder: 'e.g. JavaScript' },
  section: { singular: 'section', plural: 'sections', placeholder: 'e.g. Output Based' },
  topic: { singular: 'topic', plural: 'topics', placeholder: 'e.g. Closures' },
}

function emptyCatalogItem(kind) {
  return {
    name: '',
    slug: '',
    ...(kind === 'technology' ? { icon: '' } : {}),
    ...(kind === 'topic' ? { mediumUrl: '' } : {}),
    order: '',
    isActive: true,
  }
}

function CatalogPage({ technologies, refresh, notify }) {
  const [technologyId, setTechnologyId] = useState('')
  const [sectionId, setSectionId] = useState('')
  const technology = technologies.find((item) => item._id === technologyId) ?? technologies[0] ?? null
  const sections = technology?.sections ?? []
  const section = sections.find((item) => item._id === sectionId) ?? sections[0] ?? null

  return (
    <>
      <div className="page-heading"><div><p className="eyebrow">CONTENT STRUCTURE</p><h1>Technologies, sections & topics</h1><p className="page-subtitle">Technology › Section › Topic. Questions are added to a topic.</p></div></div>
      <div className="catalog-layout">
        <CatalogLevel
          kind="technology"
          title="Technologies"
          items={technologies}
          selectedId={technology?._id}
          onSelect={(id) => { setTechnologyId(id); setSectionId('') }}
          createPath="/admin/technologies"
          basePath="/admin/technologies"
          describe={(item) => `${item.sections.length} sections`}
          emptyDetail="Add a technology such as JavaScript, React or System Design."
          refresh={refresh}
          notify={notify}
        />
        <CatalogLevel
          key={`sections-${technology?._id}`}
          kind="section"
          title={technology ? `Sections in ${technology.name}` : 'Sections'}
          items={sections}
          selectedId={section?._id}
          onSelect={setSectionId}
          createPath={technology ? `/admin/technologies/${technology._id}/sections` : ''}
          basePath="/admin/sections"
          describe={(item) => `${item.topics.length} topics`}
          emptyDetail={technology ? 'Add a section such as Output Based or Concepts.' : 'Create a technology first.'}
          refresh={refresh}
          notify={notify}
        />
        <CatalogLevel
          key={`topics-${section?._id}`}
          kind="topic"
          title={section ? `Topics in ${section.name}` : 'Topics'}
          items={section?.topics ?? []}
          createPath={section ? `/admin/sections/${section._id}/topics` : ''}
          basePath="/admin/topics"
          describe={(item) => `${item.questionCount} questions`}
          emptyDetail={section ? 'Add a topic such as Closures or Promises.' : 'Create a section first.'}
          refresh={refresh}
          notify={notify}
        />
      </div>
    </>
  )
}

function CatalogLevel({ kind, title, items, selectedId, onSelect, createPath, basePath, describe, emptyDetail, refresh, notify }) {
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(() => emptyCatalogItem(kind))
  const [busy, setBusy] = useState(false)
  const { singular, plural, placeholder } = catalogLevels[kind]
  const label = singular[0].toUpperCase() + singular.slice(1)

  function beginEdit(item) {
    setEditingId(item?._id ?? 'new')
    setForm(item ? {
      name: item.name,
      slug: item.slug,
      ...(kind === 'technology' ? { icon: item.icon ?? '' } : {}),
      ...(kind === 'topic' ? { mediumUrl: item.mediumUrl ?? '' } : {}),
      order: String(item.order ?? ''),
      isActive: item.isActive !== false,
    } : emptyCatalogItem(kind))
  }

  async function save(event) {
    event.preventDefault()
    const isNew = editingId === 'new'
    setBusy(true)
    try {
      await apiRequest(isNew ? createPath : `${basePath}/${editingId}`, {
        method: isNew ? 'POST' : 'PATCH',
        body: { ...form, order: form.order === '' ? undefined : Number(form.order) },
      })
      await refresh()
      setEditingId(null)
      notify(`${label} ${isNew ? 'created' : 'updated'}.`)
    } catch (error) {
      notify(error.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  async function remove(item) {
    if (!window.confirm(`Delete “${item.name}”? A ${singular} that still has content cannot be deleted.`)) return
    try {
      await apiRequest(`${basePath}/${item._id}`, { method: 'DELETE' })
      await refresh()
      notify(`${label} deleted.`)
    } catch (error) {
      notify(error.message, 'error')
    }
  }

  return (
    <section className="panel catalog-panel">
      <div className="panel-heading">
        <div><h2>{title}</h2><p>{items.length} {items.length === 1 ? singular : plural}</p></div>
        <button className="button button-secondary button-small" type="button" onClick={() => beginEdit(null)} disabled={!createPath}>＋ Add</button>
      </div>
      {editingId !== null && (
        <form className="subtopic-form" onSubmit={save}>
          <div className="subtopic-form-heading"><div><p className="eyebrow">{editingId === 'new' ? `NEW ${singular.toUpperCase()}` : `EDIT ${singular.toUpperCase()}`}</p></div></div>
          <div className="form-grid">
            <label className="field field-full"><span>Name</span><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value, ...(editingId === 'new' ? { slug: slugify(event.target.value) } : {}) })} maxLength={100} required placeholder={placeholder} /></label>
            <label className="field field-full"><span>Slug <small>Used in the learner URL</small></span><input value={form.slug} onChange={(event) => setForm({ ...form, slug: slugify(event.target.value) })} maxLength={100} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required /></label>
            {kind === 'technology' && <label className="field"><span>Icon <small>Optional key</small></span><input value={form.icon} onChange={(event) => setForm({ ...form, icon: slugify(event.target.value) })} maxLength={50} placeholder="javascript" /></label>}
            {kind === 'topic' && <label className="field field-full"><span>Medium article URL <small>Optional</small></span><input type="url" value={form.mediumUrl} onChange={(event) => setForm({ ...form, mediumUrl: event.target.value })} maxLength={2048} placeholder="https://medium.com/…" /></label>}
            <label className="field"><span>Order <small>Optional</small></span><input type="number" min="0" step="1" value={form.order} onChange={(event) => setForm({ ...form, order: event.target.value })} placeholder="Last" /></label>
            <label className="checkbox-field field-full"><input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} /><span>Visible to learners</span></label>
          </div>
          <div className="form-actions"><button className="button button-secondary button-small" type="button" onClick={() => setEditingId(null)}>Cancel</button><button className="button button-primary button-small" type="submit" disabled={busy}>{busy ? 'Saving…' : editingId === 'new' ? `Add ${singular}` : 'Save'}</button></div>
        </form>
      )}
      {items.length ? (
        <div className="catalog-list">{items.map((item) => {
          const copy = <>
            <span className="topic-select-mark">{item.order}</span>
            <span className="topic-select-copy"><strong>{item.name}</strong><small>/{item.slug} · {describe(item)}</small></span>
            {item.isActive === false && <span className="catalog-badge">Hidden</span>}
          </>
          return (
            <div className={`catalog-row ${item._id === selectedId ? 'selected' : ''}`} key={item._id}>
              {onSelect
                ? <button className="catalog-select" type="button" onClick={() => onSelect(item._id)} aria-pressed={item._id === selectedId}>{copy}</button>
                : <div className="catalog-select">{copy}</div>}
              <button className="icon-button" type="button" aria-label={`Edit ${item.name}`} onClick={() => beginEdit(item)}>✎</button>
              <button className="icon-button icon-button-danger" type="button" aria-label={`Delete ${item.name}`} onClick={() => remove(item)}>×</button>
            </div>
          )
        })}</div>
      ) : <EmptyState title={`No ${plural} yet`} detail={emptyDetail} />}
    </section>
  )
}

function QuestionsPage({ technologies, questions, refresh, notify, createOnLoad, theme }) {
  const [technologyFilter, setTechnologyFilter] = useState('')
  const [sectionFilter, setSectionFilter] = useState('')
  const [topicFilter, setTopicFilter] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyQuestion)
  const [busy, setBusy] = useState(false)
  const [search, setSearch] = useState('')
  const [orderOverride, setOrderOverride] = useState(null)
  const [draggedQuestionId, setDraggedQuestionId] = useState(null)
  const [dragOverQuestionId, setDragOverQuestionId] = useState(null)
  const [isReordering, setIsReordering] = useState(false)
  const draggedQuestionRef = useRef(null)
  const catalogIndex = useMemo(() => indexCatalog(technologies), [technologies])
  const availableSections = catalogIndex.technologyById.get(technologyFilter)?.sections ?? []
  const availableTopics = catalogIndex.sectionById.get(sectionFilter)?.topics ?? []
  const hasTopics = catalogIndex.topicById.size > 0
  const filteredQuestions = useMemo(() => {
    const searchText = search.trim().toLowerCase()
    return questions.filter((question) => (
      (!technologyFilter || question.technologyId === technologyFilter)
      && (!sectionFilter || question.sectionId === sectionFilter)
      && (!topicFilter || question.topicId === topicFilter)
      && (!searchText || question.title.toLowerCase().includes(searchText))
    ))
  }, [questions, search, technologyFilter, sectionFilter, topicFilter])
  const canReorder = Boolean(topicFilter) && !search.trim()
  const displayedQuestions = useMemo(() => {
    if (orderOverride?.topicId !== topicFilter) return filteredQuestions
    const order = new Map(orderOverride.ids.map((id, index) => [id, index]))
    return [...filteredQuestions].sort((a, b) => (order.get(a._id) ?? Infinity) - (order.get(b._id) ?? Infinity))
  }, [filteredQuestions, orderOverride, topicFilter])

  // Drop filters that point at records deleted since they were chosen.
  useEffect(() => {
    if (technologyFilter && !catalogIndex.technologyById.has(technologyFilter)) setTechnologyFilter('')
    if (sectionFilter && !catalogIndex.sectionById.has(sectionFilter)) setSectionFilter('')
    if (topicFilter && !catalogIndex.topicById.has(topicFilter)) setTopicFilter('')
  }, [catalogIndex, technologyFilter, sectionFilter, topicFilter])

  function startNew() {
    setEditingId('new')
    setForm({
      ...emptyQuestion(),
      ...firstPlacement(technologies, { technologyId: technologyFilter, sectionId: sectionFilter, topicId: topicFilter }),
    })
  }

  useEffect(() => {
    if (createOnLoad && technologies.length) startNew()
  }, [createOnLoad, technologies.length])

  function startEdit(question) {
    setEditingId(question._id)
    setForm({
      technologyId: question.technologyId,
      sectionId: question.sectionId,
      topicId: question.topicId,
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
      // Technology and section only drive the pickers; the API derives them from the topic.
      const { technologyId: _technologyId, sectionId: _sectionId, ...body } = form
      await apiRequest(isNew ? '/admin/questions' : `/admin/questions/${editingId}`, {
        method: isNew ? 'POST' : 'PATCH',
        body,
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

  async function saveQuestionOrder(orderedQuestions) {
    const questionIds = orderedQuestions.map((question) => question._id)
    setOrderOverride({ topicId: topicFilter, ids: questionIds })
    setIsReordering(true)
    try {
      await apiRequest('/admin/questions/reorder', {
        method: 'PATCH',
        body: { topicId: topicFilter, questionIds },
      })
      await refresh()
      setOrderOverride(null)
      notify('Question order saved.')
    } catch (error) {
      setOrderOverride(null)
      try {
        await refresh()
      } catch (refreshError) {
        notify(`${error.message} Questions could not be refreshed: ${refreshError.message}`, 'error')
        return
      }
      notify(error.message, 'error')
    } finally {
      setIsReordering(false)
      draggedQuestionRef.current = null
      setDraggedQuestionId(null)
      setDragOverQuestionId(null)
    }
  }

  function dropQuestion(targetId) {
    const sourceId = draggedQuestionRef.current
    if (!sourceId || sourceId === targetId || !canReorder || isReordering) return
    const reordered = [...displayedQuestions]
    const sourceIndex = reordered.findIndex((question) => question._id === sourceId)
    const targetIndex = reordered.findIndex((question) => question._id === targetId)
    if (sourceIndex < 0 || targetIndex < 0) return
    const [question] = reordered.splice(sourceIndex, 1)
    reordered.splice(targetIndex, 0, question)
    void saveQuestionOrder(reordered)
  }

  function moveQuestion(questionId, offset) {
    const index = displayedQuestions.findIndex((question) => question._id === questionId)
    const targetIndex = index + offset
    if (index < 0 || targetIndex < 0 || targetIndex >= displayedQuestions.length || isReordering) return
    const reordered = [...displayedQuestions]
    const [question] = reordered.splice(index, 1)
    reordered.splice(targetIndex, 0, question)
    void saveQuestionOrder(reordered)
  }

  return (
    <>
      <div className="page-heading"><div><p className="eyebrow">QUESTION BANK</p><h1>Question library</h1><p className="page-subtitle">Create and manage short-answer questions.</p></div><button className="button button-primary" type="button" onClick={startNew} disabled={!hasTopics}>＋ Create question</button></div>
      {editingId !== null && <QuestionForm
        form={form}
        setForm={setForm}
        technologies={technologies}
        theme={theme}
        busy={busy}
        isNew={editingId === 'new'}
        onCancel={() => setEditingId(null)}
        onSubmit={saveQuestion}
      />}
      <section className="panel question-library">
        <div className="filter-row">
          <label className="search-field"><span aria-hidden="true">⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search questions…" /></label>
          <select aria-label="Filter by technology" value={technologyFilter} onChange={(event) => { setTechnologyFilter(event.target.value); setSectionFilter(''); setTopicFilter('') }}><option value="">All technologies</option>{technologies.map((technology) => <option value={technology._id} key={technology._id}>{technology.name}</option>)}</select>
          <select aria-label="Filter by section" value={sectionFilter} onChange={(event) => { setSectionFilter(event.target.value); setTopicFilter('') }} disabled={!availableSections.length}><option value="">All sections</option>{availableSections.map((section) => <option value={section._id} key={section._id}>{section.name}</option>)}</select>
          <select aria-label="Filter by topic" value={topicFilter} onChange={(event) => setTopicFilter(event.target.value)} disabled={!availableTopics.length}><option value="">All topics</option>{availableTopics.map((topic) => <option value={topic._id} key={topic._id}>{topic.name}</option>)}</select>
        </div>
        <div className="question-order-hint" role="status">{canReorder ? 'Drag questions to set their display order. Use the arrow buttons to move a question with the keyboard.' : 'Choose a technology, section and topic, and clear search to reorder questions.'}{isReordering && <span> Saving order…</span>}</div>
        {displayedQuestions.length === 0 ? <EmptyState title={questions.length ? 'No matching questions' : 'Your question library is empty'} detail={questions.length ? 'Try changing the search or filters.' : 'Create a technology, section and topic, then write your first question.'} /> : (
          <div className="table-wrap"><table><thead><tr>{canReorder && <th className="order-heading">Order</th>}<th>Question</th><th>Technology / topic</th><th>Resources</th><th className="actions-heading">Actions</th></tr></thead><tbody>
            {displayedQuestions.map((question, index) => <tr
              key={question._id}
              className={`${canReorder ? 'question-order-row' : ''} ${dragOverQuestionId === question._id ? 'drag-over' : ''}`}
              draggable={canReorder && !isReordering}
              onDragStart={(event) => {
                draggedQuestionRef.current = question._id
                setDraggedQuestionId(question._id)
                event.dataTransfer.effectAllowed = 'move'
                event.dataTransfer.setData('text/plain', question._id)
              }}
              onDragOver={(event) => {
                if (!canReorder || isReordering) return
                event.preventDefault()
                event.dataTransfer.dropEffect = 'move'
                setDragOverQuestionId(question._id)
              }}
              onDrop={(event) => {
                event.preventDefault()
                dropQuestion(question._id)
              }}
              onDragEnd={() => {
                draggedQuestionRef.current = null
                setDraggedQuestionId(null)
                setDragOverQuestionId(null)
              }}
            >
              {canReorder && <td className="order-cell">
                <span className={`drag-handle ${draggedQuestionId === question._id ? 'is-dragging' : ''}`} aria-hidden="true" title="Drag to reorder">⠿</span>
                <span className="order-buttons">
                  <button type="button" aria-label={`Move ${question.title} up`} title="Move up" disabled={index === 0 || isReordering} onClick={() => moveQuestion(question._id, -1)}>↑</button>
                  <button type="button" aria-label={`Move ${question.title} down`} title="Move down" disabled={index === displayedQuestions.length - 1 || isReordering} onClick={() => moveQuestion(question._id, 1)}>↓</button>
                </span>
              </td>}
              <td className="question-cell"><strong>{question.title}</strong><small>Short answer · {question.label}</small></td>
              <td>{nameOf(catalogIndex.technologyById, question.technologyId)}<small className="table-secondary">{nameOf(catalogIndex.sectionById, question.sectionId)} › {nameOf(catalogIndex.topicById, question.topicId)}</small></td>
              <td>{[question.mediumUrl, question.compilerUrl].filter(Boolean).length || '—'}</td>
              <td className="actions-cell"><button className="button button-secondary button-small" type="button" onClick={() => startEdit(question)}>Edit</button><button className="button button-danger button-small" type="button" onClick={() => deleteQuestion(question)}>Delete</button></td>
            </tr>)}
          </tbody></table></div>
        )}
        <div className="table-footer">Showing {displayedQuestions.length} of {questions.length} questions</div>
      </section>
    </>
  )
}

function emptyQuestion() {
  return {
    technologyId: '',
    sectionId: '',
    topicId: '',
    title: '',
    label: 'SHORT ANSWER',
    content: [],
    answer: '',
    mediumUrl: '',
    compilerUrl: '',
  }
}

function QuestionForm({ form, setForm, technologies, theme, busy, isNew, onCancel, onSubmit }) {
  const sections = technologies.find((technology) => technology._id === form.technologyId)?.sections ?? []
  const topics = sections.find((section) => section._id === form.sectionId)?.topics ?? []
  const [formattingIndex, setFormattingIndex] = useState(null)
  const [formatError, setFormatError] = useState('')

  function updateContent(index, key, value) {
    setFormatError('')
    setForm((currentForm) => ({
      ...currentForm,
      content: currentForm.content.map((part, partIndex) => partIndex === index ? { ...part, [key]: value } : part),
    }))
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
        semi: true,
        singleQuote: true,
      })
      updateContent(index, 'value', formattedCode)
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Unknown formatting error.'
      setFormatError(`Unable to format code block ${index + 1}: ${reason}`)
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
        <label className="field"><span>Technology</span><select value={form.technologyId} onChange={(event) => setForm({ ...form, ...firstPlacement(technologies, { technologyId: event.target.value }) })} required><option value="">Choose a technology</option>{technologies.map((technology) => <option value={technology._id} key={technology._id}>{technology.name}</option>)}</select></label>
        <label className="field"><span>Section</span><select value={form.sectionId} onChange={(event) => setForm({ ...form, ...firstPlacement(technologies, { technologyId: form.technologyId, sectionId: event.target.value }) })} required disabled={!sections.length}><option value="">Choose a section</option>{sections.map((section) => <option value={section._id} key={section._id}>{section.name}</option>)}</select></label>
        <label className="field"><span>Topic</span><select value={form.topicId} onChange={(event) => setForm({ ...form, topicId: event.target.value })} required disabled={!topics.length}><option value="">Choose a topic</option>{topics.map((topic) => <option value={topic._id} key={topic._id}>{topic.name}</option>)}</select></label>
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
              {part.kind === 'code'
                ? <Suspense fallback={<div className="code-editor-loading">Loading code editor…</div>}>
                    <CodeEditor
                      className="code-editor"
                      aria-label={`Block ${index + 1} content`}
                      value={codeValue}
                      theme={theme}
                      placeholder="Paste JavaScript code here…"
                      onChange={(value) => updateContent(index, 'value', value)}
                    />
                  </Suspense>
                : <textarea aria-label={`Block ${index + 1} content`} value={typeof part.value === 'string' ? part.value : JSON.stringify(part.value, null, 2)} onChange={(event) => updateContent(index, 'value', event.target.value)} rows={part.kind === 'text' ? 2 : 8} placeholder={part.kind === 'json' ? 'Paste JSON here…' : 'Add context for the question…'} />}
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
      <div className="form-actions"><button className="button button-secondary" type="button" onClick={onCancel}>Cancel</button><button className="button button-primary" type="submit" disabled={busy || !topics.length}>{busy ? 'Saving…' : isNew ? 'Create question' : 'Save changes'}</button></div>
    </form>
  </section>
}

function App() {
  const [theme, toggleTheme] = useTheme()
  const [admin, setAdmin] = useState(null)
  const [checkingSession, setCheckingSession] = useState(true)
  const [activePage, setActivePage] = useState('overview')
  const [technologies, setTechnologies] = useState([])
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
      const [catalogData, questionData] = await Promise.all([
        apiRequest('/admin/catalog'),
        apiRequest('/admin/questions'),
      ])
      setTechnologies(catalogData.technologies)
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
      setTechnologies([])
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
  if (!admin) return <Login onLogin={login} theme={theme} toggleTheme={toggleTheme} />

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
        <header className="topbar"><div className="crumb"><span>Workspace</span><span className="crumb-slash">/</span><strong>{navigation.find((item) => item.id === activePage)?.label}</strong></div><div className="topbar-right"><button className="theme-toggle" type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>{theme === 'dark' ? '☀' : '☾'}</button><span className="admin-tag">ADMIN</span><span className="topbar-avatar">{admin.email.slice(0, 1).toUpperCase()}</span></div></header>
        <div className="content-area">
          {notice && <div className={`toast ${notice.type === 'error' ? 'toast-error' : ''}`} role={notice.type === 'error' ? 'alert' : 'status'}><span>{notice.type === 'error' ? '!' : '✓'}</span>{notice.message}<button type="button" onClick={() => setNotice(null)} aria-label="Dismiss notification">×</button></div>}
          {loading && <div className="loading-line"><span /> Syncing content…</div>}
          {activePage === 'overview' && <Overview technologies={technologies} questions={questions} onNavigate={navigate} />}
          {activePage === 'catalog' && <CatalogPage technologies={technologies} refresh={refresh} notify={notify} />}
          {activePage === 'questions' && <QuestionsPage technologies={technologies} questions={questions} refresh={refresh} notify={notify} createOnLoad={createQuestionOnLoad} theme={theme} />}
        </div>
      </main>
    </div>
  )
}

export default App
