import { navigate } from '../router.js'

export function Link({ to, onClick, ...props }) {
  function handleClick(event) {
    onClick?.(event)
    if (
      event.defaultPrevented
      || event.button !== 0
      || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
      || props.target
    ) return
    event.preventDefault()
    navigate(to)
  }

  return <a href={to} onClick={handleClick} {...props} />
}
