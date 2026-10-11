import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router'
import { ArrowDown, ArrowUp, Code2, FileQuestion, GripVertical, Link2, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { apiRequest } from '../api.js'
import { indexCatalog, nameOf } from '../catalog.js'
import { EmptyState, PageHeader, Pill } from '../components/ui.jsx'
import { useConfirm } from '../components/ConfirmProvider.jsx'
import { questionsPath, useWorkspace } from '../workspace.js'

export function QuestionsPage() {
  const { technologies, questions, isLoaded, refresh, notify } = useWorkspace()
  const navigate = useNavigate()
  const location = useLocation()
  // Filters live in the URL (?technologyId=…&sectionId=…&topicId=…) so they survive reloads and back/forward.
  const [searchParams, setSearchParams] = useSearchParams()
  const technologyFilter = searchParams.get('technologyId') ?? ''
  const sectionFilter = searchParams.get('sectionId') ?? ''
  const topicFilter = searchParams.get('topicId') ?? ''
  const [search, setSearch] = useState('')
  const [orderOverride, setOrderOverride] = useState(null)
  const [draggedQuestionId, setDraggedQuestionId] = useState(null)
  const [dragOverQuestionId, setDragOverQuestionId] = useState(null)
  const [isReordering, setIsReordering] = useState(false)
  const draggedQuestionRef = useRef(null)
  const confirm = useConfirm()

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

  function setFilters(filter) {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(filter)) if (value) params.set(key, value)
    setSearchParams(params, { replace: true })
  }

  // Drop filters that point at records that no longer exist (deleted, or a stale link).
  useEffect(() => {
    if (!isLoaded) return
    const technologyId = catalogIndex.technologyById.has(technologyFilter) ? technologyFilter : ''
    const sectionId = technologyId && catalogIndex.sectionById.has(sectionFilter) ? sectionFilter : ''
    const topicId = sectionId && catalogIndex.topicById.has(topicFilter) ? topicFilter : ''
    if (technologyId !== technologyFilter || sectionId !== sectionFilter || topicId !== topicFilter) {
      setFilters({ technologyId, sectionId, topicId })
    }
  }, [isLoaded, catalogIndex, technologyFilter, sectionFilter, topicFilter])

  const currentFilter = { technologyId: technologyFilter, sectionId: sectionFilter, topicId: topicFilter }
  const startNew = () => navigate(questionsPath(currentFilter, '/questions/new'))
  // The editor returns to this exact library view (filters included) when it closes.
  const startEdit = (question) => navigate(`/questions/${question._id}/edit`, { state: { returnTo: `${location.pathname}${location.search}` } })

  async function deleteQuestion(question) {
    const confirmed = await confirm({
      title: 'Delete this question?',
      message: `“${question.title}” will be permanently removed from the library. This can’t be undone.`,
      confirmLabel: 'Delete question',
    })
    if (!confirmed) return
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
      <PageHeader
        eyebrow="Question bank"
        title="Question library"
        description="Create, edit and order the questions learners practice."
        actions={(
          <button className="button button-primary" type="button" onClick={startNew} disabled={!hasTopics} title={hasTopics ? undefined : 'Create a topic first'}>
            <Plus size={17} /> New question
          </button>
        )}
      />

      <section className="panel">
        <div className="toolbar">
          <label className="search-field">
            <Search size={17} aria-hidden="true" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search questions…" aria-label="Search questions" />
          </label>
          <select aria-label="Filter by technology" value={technologyFilter} onChange={(event) => setFilters({ technologyId: event.target.value })}>
            <option value="">All technologies</option>
            {technologies.map((technology) => <option value={technology._id} key={technology._id}>{technology.name}</option>)}
          </select>
          <select aria-label="Filter by section" value={sectionFilter} onChange={(event) => setFilters({ technologyId: technologyFilter, sectionId: event.target.value })} disabled={!availableSections.length}>
            <option value="">All sections</option>
            {availableSections.map((section) => <option value={section._id} key={section._id}>{section.name}</option>)}
          </select>
          <select aria-label="Filter by topic" value={topicFilter} onChange={(event) => setFilters({ technologyId: technologyFilter, sectionId: sectionFilter, topicId: event.target.value })} disabled={!availableTopics.length}>
            <option value="">All topics</option>
            {availableTopics.map((topic) => <option value={topic._id} key={topic._id}>{topic.name}</option>)}
          </select>
        </div>
        <div className={`toolbar-hint ${canReorder ? 'is-active' : ''}`} role="status">
          <GripVertical size={16} />
          {canReorder
            ? 'Drag rows, or use the arrow buttons, to set the order learners see.'
            : 'Choose a technology, section and topic (and clear search) to reorder questions.'}
          {isReordering && <strong> Saving order…</strong>}
        </div>

        {displayedQuestions.length === 0 ? (
          <EmptyState
            icon={FileQuestion}
            title={questions.length ? 'No matching questions' : 'Your question library is empty'}
            detail={questions.length ? 'Try a different search or filter.' : 'Create a technology, section and topic, then write your first question.'}
          />
        ) : (
          <div className="table-wrap">
            <table className="data-table questions-table">
              <thead>
                <tr>
                  {canReorder && <th className="order-col">Order</th>}
                  <th>Question</th>
                  <th>Placement</th>
                  <th>Resources</th>
                  <th>Updated</th>
                  <th className="actions-col"><span className="visually-hidden">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {displayedQuestions.map((question, index) => (
                  <tr
                    key={question._id}
                    className={`${canReorder ? 'is-draggable' : ''} ${dragOverQuestionId === question._id ? 'is-drag-over' : ''}`}
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
                    {canReorder && (
                      <td className="order-col">
                        <span className="order-controls">
                          <GripVertical size={18} className={`drag-handle ${draggedQuestionId === question._id ? 'is-dragging' : ''}`} aria-hidden="true" />
                          <span className="order-number">{index + 1}</span>
                          <span className="order-buttons">
                            <button type="button" aria-label={`Move ${question.title} up`} title="Move up" disabled={index === 0 || isReordering} onClick={() => moveQuestion(question._id, -1)}><ArrowUp size={14} /></button>
                            <button type="button" aria-label={`Move ${question.title} down`} title="Move down" disabled={index === displayedQuestions.length - 1 || isReordering} onClick={() => moveQuestion(question._id, 1)}><ArrowDown size={14} /></button>
                          </span>
                        </span>
                      </td>
                    )}
                    <td className="question-col">
                      <span className="cell-title">{question.title}</span>
                      {question.label && <Pill tone="accent">{question.label}</Pill>}
                    </td>
                    <td>
                      <span className="cell-title">{nameOf(catalogIndex.topicById, question.topicId)}</span>
                      <span className="cell-sub">{nameOf(catalogIndex.technologyById, question.technologyId)} › {nameOf(catalogIndex.sectionById, question.sectionId)}</span>
                    </td>
                    <td>
                      <span className="resource-icons">
                        {question.mediumUrl && <span title="Medium article"><Link2 size={16} /></span>}
                        {question.compilerUrl && <span title="Compiler link"><Code2 size={16} /></span>}
                        {!question.mediumUrl && !question.compilerUrl && <span className="cell-sub">—</span>}
                      </span>
                    </td>
                    <td className="cell-sub nowrap">{new Date(question.updatedAt).toLocaleDateString()}</td>
                    <td className="actions-col">
                      <span className="row-actions">
                        <button className="icon-button" type="button" onClick={() => startEdit(question)} aria-label={`Edit ${question.title}`} title="Edit"><Pencil size={16} /></button>
                        <button className="icon-button icon-button-danger" type="button" onClick={() => deleteQuestion(question)} aria-label={`Delete ${question.title}`} title="Delete"><Trash2 size={16} /></button>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="table-footer">Showing {displayedQuestions.length} of {questions.length} questions</div>
      </section>
    </>
  )
}
