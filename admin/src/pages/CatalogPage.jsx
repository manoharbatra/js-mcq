import { useState } from 'react'
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd'
import { BookOpen, ChevronRight, EyeOff, FolderTree, GripVertical, Layers, Link2, ListChecks, Pencil, Plus, Trash2 } from 'lucide-react'
import { apiRequest } from '../api.js'
import { countLabel } from '../catalog.js'
import { EmptyState, Modal, PageHeader, Pill, Switch } from '../components/ui.jsx'
import { useConfirm } from '../components/ConfirmProvider.jsx'

const levels = {
  technology: {
    label: 'Technology',
    plural: 'technologies',
    icon: FolderTree,
    placeholder: 'e.g. JavaScript',
    basePath: '/admin/technologies',
    createPath: () => '/admin/technologies',
  },
  section: {
    label: 'Section',
    plural: 'sections',
    icon: Layers,
    placeholder: 'e.g. Output Based',
    basePath: '/admin/sections',
    createPath: (parentId) => `/admin/technologies/${parentId}/sections`,
  },
  topic: {
    label: 'Topic',
    plural: 'topics',
    icon: BookOpen,
    placeholder: 'e.g. Closures',
    basePath: '/admin/topics',
    createPath: (parentId) => `/admin/sections/${parentId}/topics`,
  },
}

function formFor(kind, item) {
  return {
    name: item?.name ?? '',
    ...(kind === 'topic' ? { mediumUrl: item?.mediumUrl ?? '', isPaid: item?.isPaid === true } : {}),
    ...(kind === 'section' ? { membershipUrl: item?.membershipUrl ?? '' } : {}),
    order: item ? String(item.order ?? '') : '',
    isActive: item ? item.isActive !== false : true,
  }
}

function CatalogEditor({ editing, onClose, onSaved, notify }) {
  const { kind, item, parentId } = editing
  const level = levels[kind]
  const isNew = !item
  const [form, setForm] = useState(() => formFor(kind, item))
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    try {
      await apiRequest(isNew ? level.createPath(parentId) : `${level.basePath}/${item._id}`, {
        method: isNew ? 'POST' : 'PATCH',
        body: { ...form, order: form.order === '' ? undefined : Number(form.order) },
      })
      await onSaved()
      notify(`${level.label} ${isNew ? 'created' : 'updated'}.`)
      onClose()
    } catch (error) {
      notify(error.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      title={isNew ? `New ${level.label.toLowerCase()}` : `Edit ${item.name}`}
      description={isNew ? `Add a ${level.label.toLowerCase()} to the learner catalog.` : `Update this ${level.label.toLowerCase()}’s details.`}
      onClose={onClose}
    >
      <form className="modal-body form-stack" onSubmit={submit}>
        <label className="field">
          <span className="field-label">Name</span>
          <input
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            maxLength={100}
            required
            placeholder={level.placeholder}
            autoFocus
          />
        </label>
        {kind === 'topic' && (
          <label className="field">
            <span className="field-label">Medium article URL <small>Optional</small></span>
            <input type="url" value={form.mediumUrl} onChange={(event) => setForm({ ...form, mediumUrl: event.target.value })} maxLength={2048} placeholder="https://medium.com/…" />
            <span className="field-hint">Shown as “Medium Link” on the section page when set.</span>
          </label>
        )}
        {kind === 'section' && (
          <label className="field">
            <span className="field-label">Membership URL <small>Optional</small></span>
            <input type="url" value={form.membershipUrl} onChange={(event) => setForm({ ...form, membershipUrl: event.target.value })} maxLength={2048} placeholder="https://…" />
            <span className="field-hint">“Buy Membership” opens this link for every topic in this section.</span>
          </label>
        )}
        <div className="field-row">
          <label className="field">
            <span className="field-label">Order <small>Optional</small></span>
            <input type="number" min="0" step="1" value={form.order} onChange={(event) => setForm({ ...form, order: event.target.value })} placeholder="Add to end" />
          </label>
        </div>
        {kind === 'topic' && (
          <Switch
            checked={form.isPaid}
            onChange={(isPaid) => setForm({ ...form, isPaid })}
            label="Paid"
            description="On: premium. The Medium link is disabled and learners see a membership prompt."
          />
        )}
        <Switch
          checked={form.isActive}
          onChange={(isActive) => setForm({ ...form, isActive })}
          label="Visible to learners"
          description={`Hidden ${level.plural} and everything inside them are not shown in the learner app.`}
        />
        <div className="modal-footer">
          <button className="button button-secondary" type="button" onClick={onClose}>Cancel</button>
          <button className="button button-primary" type="submit" disabled={busy}>
            {busy ? 'Saving…' : isNew ? `Create ${level.label.toLowerCase()}` : 'Save changes'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

function CatalogColumn({ kind, title, subtitle, items, selectedId, onSelect, onAdd, onEdit, onDelete, onReorder, describe, renderExtra, emptyDetail, disabledReason }) {
  const level = levels[kind]
  const LevelIcon = level.icon

  function handleDragEnd({ source, destination }) {
    if (!onReorder || !destination || destination.index === source.index) return
    const reordered = [...items]
    const [moved] = reordered.splice(source.index, 1)
    reordered.splice(destination.index, 0, moved)
    onReorder(reordered.map((item) => item._id))
  }

  return (
    <section className="panel catalog-column" aria-label={title}>
      <div className="catalog-column-header">
        <span className="catalog-column-icon"><LevelIcon size={18} /></span>
        <div className="catalog-column-title">
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <button className="button button-secondary button-sm" type="button" onClick={onAdd} disabled={Boolean(disabledReason)} title={disabledReason}>
          <Plus size={16} /> Add
        </button>
      </div>
      <div className="catalog-column-body">
        {disabledReason ? (
          <EmptyState icon={LevelIcon} title={disabledReason} />
        ) : items.length ? (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId={`catalog-${kind}`} isDropDisabled={!onReorder}>
              {(dropProvided) => (
                <ul className="catalog-list" ref={dropProvided.innerRef} {...dropProvided.droppableProps}>
                  {items.map((item, index) => {
                    const isSelected = item._id === selectedId
                    const content = (
                      <>
                        <span className="catalog-order">{item.order}</span>
                        <span className="catalog-text">
                          <strong>{item.name}</strong>
                          <span className="catalog-meta">
                            <span>/{item.slug}</span>
                            <span aria-hidden="true">·</span>
                            <span>{describe(item)}</span>
                          </span>
                        </span>
                        {item.isActive === false && <Pill tone="muted" icon={EyeOff}>Hidden</Pill>}
                        {renderExtra?.(item)}
                        {onSelect && <ChevronRight size={18} className="catalog-chevron" />}
                      </>
                    )
                    return (
                      <Draggable key={item._id} draggableId={item._id} index={index} isDragDisabled={!onReorder}>
                        {(dragProvided, snapshot) => (
                          <li
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            className={`catalog-item ${isSelected ? 'is-selected' : ''} ${snapshot.isDragging ? 'is-dragging' : ''}`}
                          >
                            {onReorder && (
                              <span className="catalog-drag-handle" {...dragProvided.dragHandleProps} title="Drag to reorder">
                                <GripVertical size={16} />
                              </span>
                            )}
                            {onSelect
                              ? <button className="catalog-item-main" type="button" onClick={() => onSelect(item._id)} aria-pressed={isSelected}>{content}</button>
                              : <div className="catalog-item-main">{content}</div>}
                            <div className="catalog-actions">
                              <button className="icon-button" type="button" onClick={() => onEdit(item)} aria-label={`Edit ${item.name}`} title="Edit"><Pencil size={16} /></button>
                              <button className="icon-button icon-button-danger" type="button" onClick={() => onDelete(item)} aria-label={`Delete ${item.name}`} title="Delete"><Trash2 size={16} /></button>
                            </div>
                          </li>
                        )}
                      </Draggable>
                    )
                  })}
                  {dropProvided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
        ) : (
          <EmptyState icon={LevelIcon} title={`No ${level.plural} yet`} detail={emptyDetail} />
        )}
      </div>
    </section>
  )
}

export function CatalogPage({ technologies, refresh, notify, onOpenQuestions }) {
  const [technologyId, setTechnologyId] = useState('')
  const [sectionId, setSectionId] = useState('')
  const [editing, setEditing] = useState(null)
  const [topicOrder, setTopicOrder] = useState(null)
  const confirm = useConfirm()
  const technology = technologies.find((item) => item._id === technologyId) ?? technologies[0] ?? null
  const sections = technology?.sections ?? []
  const section = sections.find((item) => item._id === sectionId) ?? sections[0] ?? null

  const savedTopics = section?.topics ?? []
  // Show the dropped order immediately while the save request is in flight.
  const topics = topicOrder && topicOrder.sectionId === section?._id
    ? topicOrder.ids.map((id) => savedTopics.find((topic) => topic._id === id)).filter(Boolean)
    : savedTopics

  async function reorderTopics(topicIds) {
    setTopicOrder({ sectionId: section._id, ids: topicIds })
    try {
      await apiRequest('/admin/topics/reorder', { method: 'PATCH', body: { sectionId: section._id, topicIds } })
      await refresh()
      notify('Topic order saved.')
    } catch (error) {
      notify(error.message, 'error')
    } finally {
      setTopicOrder(null)
    }
  }

  // What still has to be removed before this item can be deleted (the API enforces the same rule).
  function blockingChildren(kind, item) {
    if (kind === 'technology' && item.sections.length) return countLabel(item.sections.length, 'section')
    if (kind === 'section' && item.topics.length) return countLabel(item.topics.length, 'topic')
    if (kind === 'topic' && item.questionCount) return countLabel(item.questionCount, 'question')
    return ''
  }

  async function remove(kind, item) {
    const level = levels[kind]
    const children = blockingChildren(kind, item)
    if (children) {
      await confirm({
        blocked: true,
        title: `“${item.name}” can’t be deleted yet`,
        message: `It still contains ${children}. Delete or move ${children.startsWith('1 ') ? 'it' : 'them'} first, then try again.`,
      })
      return
    }
    const confirmed = await confirm({
      title: `Delete ${level.label.toLowerCase()} “${item.name}”?`,
      message: `This permanently removes the ${level.label.toLowerCase()} from the learner catalog. This can’t be undone.`,
      confirmLabel: `Delete ${level.label.toLowerCase()}`,
    })
    if (!confirmed) return
    try {
      await apiRequest(`${level.basePath}/${item._id}`, { method: 'DELETE' })
      await refresh()
      notify(`${level.label} deleted.`)
    } catch (error) {
      notify(error.message, 'error')
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Content structure"
        title="Technologies, sections & topics"
        description="Organise the learner catalog. Questions are added to topics in the question library."
      />

      <nav className="catalog-path" aria-label="Current selection">
        <span>{technology?.name ?? 'No technology'}</span>
        <ChevronRight size={16} />
        <span>{section?.name ?? 'No section'}</span>
        <ChevronRight size={16} />
        <span className="catalog-path-muted">{countLabel(section?.topics.length ?? 0, 'topic')}</span>
      </nav>

      <div className="catalog-columns">
        <CatalogColumn
          kind="technology"
          title="Technologies"
          subtitle={countLabel(technologies.length, 'technology', 'technologies')}
          items={technologies}
          selectedId={technology?._id}
          onSelect={(id) => { setTechnologyId(id); setSectionId('') }}
          onAdd={() => setEditing({ kind: 'technology', item: null })}
          onEdit={(item) => setEditing({ kind: 'technology', item })}
          onDelete={(item) => remove('technology', item)}
          describe={(item) => countLabel(item.sections.length, 'section')}
          emptyDetail="Add a technology such as JavaScript, React or System Design."
        />
        <CatalogColumn
          kind="section"
          title="Sections"
          subtitle={technology ? `In ${technology.name}` : 'Choose a technology'}
          items={sections}
          selectedId={section?._id}
          onSelect={setSectionId}
          onAdd={() => setEditing({ kind: 'section', item: null, parentId: technology._id })}
          onEdit={(item) => setEditing({ kind: 'section', item })}
          onDelete={(item) => remove('section', item)}
          describe={(item) => countLabel(item.topics.length, 'topic')}
          emptyDetail="Add a section such as Output Based or Concepts."
          disabledReason={technology ? '' : 'Create a technology first'}
        />
        <CatalogColumn
          kind="topic"
          title="Topics"
          subtitle={section ? `In ${section.name}` : 'Choose a section'}
          items={topics}
          onReorder={reorderTopics}
          onAdd={() => setEditing({ kind: 'topic', item: null, parentId: section._id })}
          onEdit={(item) => setEditing({ kind: 'topic', item })}
          onDelete={(item) => remove('topic', item)}
          describe={(item) => countLabel(item.questionCount, 'question')}
          renderExtra={(item) => (
            <span className="catalog-extra">
              {item.mediumUrl && <span className="catalog-badge-icon" title="Has a Medium article"><Link2 size={15} /></span>}
              <button
                className="icon-button"
                type="button"
                onClick={() => onOpenQuestions({ technologyId: technology._id, sectionId: section._id, topicId: item._id })}
                aria-label={`Open questions for ${item.name}`}
                title="Open questions"
              >
                <ListChecks size={16} />
              </button>
            </span>
          )}
          emptyDetail="Add a topic such as Closures or Promises."
          disabledReason={section ? '' : 'Create a section first'}
        />
      </div>

      {editing && (
        <CatalogEditor
          key={`${editing.kind}-${editing.item?._id ?? 'new'}`}
          editing={editing}
          onClose={() => setEditing(null)}
          onSaved={refresh}
          notify={notify}
        />
      )}
    </>
  )
}
