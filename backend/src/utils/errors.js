export class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

export function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next)
}

export function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Route not found' })
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    next(error)
    return
  }

  if (error?.name === 'ZodError') {
    res.status(400).json({ error: 'Invalid request', details: error.issues })
    return
  }
  if (error?.name === 'CastError') {
    res.status(400).json({ error: 'Invalid identifier' })
    return
  }
  if (error?.code === 11000) {
    res.status(409).json({ error: 'A record with that name or slug already exists' })
    return
  }
  if (error?.name === 'ValidationError') {
    res.status(400).json({ error: 'Invalid record', details: Object.values(error.errors).map(({ message }) => message) })
    return
  }

  const status = Number.isInteger(error?.status) ? error.status : 500
  if (status >= 500) console.error(error)
  res.status(status).json({ error: status >= 500 ? 'Internal server error' : error.message })
}
