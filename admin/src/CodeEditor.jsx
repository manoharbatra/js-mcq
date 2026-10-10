import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'

function CodeEditor({ value, onChange, theme, className, ...props }) {
  return (
    <CodeMirror
      {...props}
      className={className}
      value={value}
      theme={theme}
      height="180px"
      extensions={[javascript({ jsx: true })]}
      onChange={onChange}
      basicSetup={{ lineNumbers: true, foldGutter: true, tabSize: 2 }}
    />
  )
}

export default CodeEditor
