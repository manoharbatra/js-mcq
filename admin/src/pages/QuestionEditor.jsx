import { lazy, Suspense, useState } from 'react'
import { ArrowLeft, Braces, Code2, Trash2, Type, WandSparkles } from 'lucide-react'
import { firstPlacement } from '../catalog.js'
import { Switch } from '../components/ui.jsx'

const CodeEditor = lazy(() => import('../CodeEditor.jsx'))

const blockTypes = [
  { kind: 'text', label: 'Text', icon: Type },
  { kind: 'code', label: 'Code', icon: Code2 },
  { kind: 'json', label: 'JSON', icon: Braces },
]

export function QuestionEditor({ form, setForm, technologies, theme, busy, isNew, onCancel, onSubmit }) {
  const sections = technologies.find((technology) => technology._id === form.technologyId)?.sections ?? []
  const topics = sections.find((section) => section._id === form.sectionId)?.topics ?? []
  const [formattingIndex, setFormattingIndex] = useState(null)
  const [formatError, setFormatError] = useState('')
  const hasBlocks = form.content.length > 0

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

  // Sits under the last block once there is one, so the next block is always added right below it.
  const addBlockButtons = (
    <div className="block-buttons">
      {blockTypes.map(({ kind, label, icon: IconComponent }) => (
        <button key={kind} className="button button-secondary button-sm" type="button" onClick={() => addContentBlock(kind)} disabled={form.content.length >= 20}>
          <IconComponent size={15} /> {label}
        </button>
      ))}
    </div>
  )

  return (
    <form className="editor" onSubmit={onSubmit}>
      <header className="editor-header">
        <button className="button button-ghost" type="button" onClick={onCancel}><ArrowLeft size={17} /> Back to library</button>
        <div className="editor-header-actions">
          <button className="button button-secondary" type="button" onClick={onCancel}>Cancel</button>
          <button className="button button-primary" type="submit" disabled={busy || !topics.length}>
            {busy ? 'Saving…' : isNew ? 'Create question' : 'Save changes'}
          </button>
        </div>
      </header>

      <div className="editor-layout">
        <div className="editor-main">
          <section className="panel panel-padded">
            <p className="eyebrow">{isNew ? 'New question' : 'Edit question'}</p>
            <label className="field">
              <span className="field-label">Question</span>
              <textarea className="title-input" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} maxLength={300} rows={2} required placeholder="e.g. What is logged when counter() is called three times?" />
            </label>
          </section>

          <section className="panel panel-padded">
            <div className="section-heading">
              <div>
                <h2>Question content <span className="optional-tag">Optional</span></h2>
                <p>Add context, a code snippet or a JSON example. Blocks render in this order.</p>
              </div>
              {!hasBlocks && addBlockButtons}
            </div>
            {formatError && <div className="alert alert-error" role="alert">{formatError}</div>}
            {form.content.length > 0 ? (
              <div className="content-blocks">
                {form.content.map((part, index) => {
                  const codeValue = typeof part.value === 'string' ? part.value : ''
                  return (
                    <div className="content-block" key={index}>
                      <div className="content-block-toolbar">
                        <span className="content-block-index">{index + 1}</span>
                        <select aria-label={`Block ${index + 1} type`} value={part.kind} onChange={(event) => updateContent(index, 'kind', event.target.value)}>
                          <option value="text">Text</option>
                          <option value="code">Code</option>
                          <option value="json">JSON</option>
                        </select>
                        {part.kind === 'code' && (
                          <button className="button button-ghost button-sm" type="button" disabled={formattingIndex === index || !codeValue.trim()} onClick={() => formatCode(index, codeValue)}>
                            <WandSparkles size={15} /> {formattingIndex === index ? 'Formatting…' : 'Format'}
                          </button>
                        )}
                        <button
                          className="icon-button icon-button-danger content-block-remove"
                          type="button"
                          aria-label={`Remove block ${index + 1}`}
                          title="Remove block"
                          onClick={() => setForm({ ...form, content: form.content.filter((_, partIndex) => partIndex !== index) })}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      {part.kind === 'code' ? (
                        <Suspense fallback={<div className="code-editor-loading">Loading code editor…</div>}>
                          <CodeEditor
                            className="code-editor"
                            aria-label={`Block ${index + 1} content`}
                            value={codeValue}
                            theme={theme}
                            placeholder="Paste JavaScript code here…"
                            onChange={(value) => updateContent(index, 'value', value)}
                          />
                        </Suspense>
                      ) : (
                        <textarea
                          className={part.kind === 'json' ? 'mono' : ''}
                          aria-label={`Block ${index + 1} content`}
                          value={typeof part.value === 'string' ? part.value : JSON.stringify(part.value, null, 2)}
                          onChange={(event) => updateContent(index, 'value', event.target.value)}
                          rows={part.kind === 'text' ? 3 : 8}
                          placeholder={part.kind === 'json' ? 'Paste JSON here…' : 'Add context for the question…'}
                        />
                      )}
                    </div>
                  )
                })}
                {addBlockButtons}
              </div>
            ) : (
              <p className="muted-note">No content blocks. The question title is shown on its own.</p>
            )}
          </section>

          <section className="panel panel-padded">
            <label className="field">
              <span className="field-label">Answer</span>
              <textarea value={form.answer} onChange={(event) => setForm({ ...form, answer: event.target.value })} maxLength={10000} rows={7} required placeholder="Write the answer learners reveal, with a short explanation…" />
            </label>
          </section>
        </div>

        <aside className="editor-side">
          <section className="panel panel-padded form-stack">
            <h2 className="side-title">Placement</h2>
            <label className="field">
              <span className="field-label">Technology</span>
              <select value={form.technologyId} onChange={(event) => setForm({ ...form, ...firstPlacement(technologies, { technologyId: event.target.value }) })} required>
                <option value="">Choose a technology</option>
                {technologies.map((technology) => <option value={technology._id} key={technology._id}>{technology.name}</option>)}
              </select>
            </label>
            <label className="field">
              <span className="field-label">Section</span>
              <select value={form.sectionId} onChange={(event) => setForm({ ...form, ...firstPlacement(technologies, { technologyId: form.technologyId, sectionId: event.target.value }) })} required disabled={!sections.length}>
                <option value="">Choose a section</option>
                {sections.map((section) => <option value={section._id} key={section._id}>{section.name}</option>)}
              </select>
            </label>
            <label className="field">
              <span className="field-label">Topic</span>
              <select value={form.topicId} onChange={(event) => setForm({ ...form, topicId: event.target.value })} required disabled={!topics.length}>
                <option value="">Choose a topic</option>
                {topics.map((topic) => <option value={topic._id} key={topic._id}>{topic.name}</option>)}
              </select>
            </label>
            <label className="field">
              <span className="field-label">Label <small>Optional</small></span>
              <input value={form.label} onChange={(event) => setForm({ ...form, label: event.target.value })} maxLength={60} placeholder="SHORT ANSWER" />
            </label>
          </section>

          <section className="panel panel-padded form-stack">
            <h2 className="side-title">Resources</h2>
            <label className="field">
              <span className="field-label">Medium article URL <small>Optional</small></span>
              <input type="url" value={form.mediumUrl} onChange={(event) => setForm({ ...form, mediumUrl: event.target.value })} maxLength={2048} placeholder="https://medium.com/…" />
            </label>
            <label className="field">
              <span className="field-label">Online compiler URL <small>Optional</small></span>
              <input type="url" value={form.compilerUrl} onChange={(event) => setForm({ ...form, compilerUrl: event.target.value })} maxLength={2048} placeholder="https://…" />
            </label>
            <Switch
              checked={form.isPaid}
              onChange={(isPaid) => setForm({ ...form, isPaid })}
              label="Paid"
              description="On: premium. The Medium link is disabled and learners see a membership prompt."
            />
          </section>
        </aside>
      </div>
    </form>
  )
}
