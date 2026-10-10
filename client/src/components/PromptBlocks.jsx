import { useMemo, useState } from 'react'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('json', json)

function CodeFrame({ label, language, code: rawCode, error, action }) {
  const code = rawCode.trimEnd()
  const highlightedCode = useMemo(
    () => hljs.highlight(code, { language, ignoreIllegals: true }).value,
    [code, language],
  )
  const lineNumbers = code.split('\n').map((_, index) => index + 1).join('\n')

  return (
    <figure className="code-frame">
      <figcaption className="code-frame-header">
        <span className="code-frame-label">{label}</span>
        <span className="code-frame-actions">
          {error && <span className="code-frame-error" role="status" title={error}>{error}</span>}
          {action}
        </span>
      </figcaption>
      <div className="code-frame-body">
        <pre className="code-gutter" aria-hidden="true">{lineNumbers}</pre>
        <pre className="code-content"><code dangerouslySetInnerHTML={{ __html: highlightedCode }} /></pre>
      </div>
    </figure>
  )
}

function JsonBlock({ value }) {
  const [jsonText, setJsonText] = useState(() => typeof value === 'string' ? value : JSON.stringify(value))
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
    <CodeFrame
      label="JSON"
      language="json"
      code={jsonText}
      error={hasFormatError ? 'Invalid JSON' : ''}
      action={<button className="code-frame-button" type="button" onClick={formatJson}>Format</button>}
    />
  )
}

function CodeBlock({ value }) {
  const [codeText, setCodeText] = useState(value)
  const [formatError, setFormatError] = useState('')
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
        semi: true,
        singleQuote: true,
      })
      setCodeText(formattedCode.trimEnd())
      setFormatError('')
    } catch {
      setFormatError('Unable to format code')
    } finally {
      setIsFormatting(false)
    }
  }

  return (
    <CodeFrame
      label="JavaScript"
      language="javascript"
      code={codeText}
      error={formatError}
      action={(
        <button className="code-frame-button" type="button" onClick={formatCode} disabled={isFormatting}>
          {isFormatting ? 'Formatting…' : 'Format'}
        </button>
      )}
    />
  )
}

export function Prompt({ content }) {
  if (!content?.length) return null
  return (
    <div className="prompt-parts">
      {content.map((part, index) => part.kind === 'text'
        ? <p className="prompt-text" key={index}>{part.value}</p>
        : part.kind === 'json'
          ? <JsonBlock key={index} value={part.value} />
          : <CodeBlock key={index} value={String(part.value)} />)}
    </div>
  )
}
