import { useState } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router'
import { FileQuestion } from 'lucide-react'
import { apiRequest } from '../api.js'
import { firstPlacement } from '../catalog.js'
import { EmptyState, PageLoader } from '../components/ui.jsx'
import { questionsPath, useWorkspace } from '../workspace.js'
import { QuestionEditor } from './QuestionEditor.jsx'

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
    isPaid: false,
  }
}

function formFromQuestion(question) {
  return {
    technologyId: question.technologyId,
    sectionId: question.sectionId,
    topicId: question.topicId,
    title: question.title,
    label: question.label ?? 'SHORT ANSWER',
    content: question.content ?? [],
    answer: question.answer,
    mediumUrl: question.mediumUrl ?? '',
    compilerUrl: question.compilerUrl ?? '',
    isPaid: question.isPaid === true,
  }
}

function EditorForm({ questionId, initialForm, returnTo }) {
  const { technologies, refresh, notify, theme } = useWorkspace()
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [busy, setBusy] = useState(false)
  const isNew = !questionId

  async function save(event) {
    event.preventDefault()
    setBusy(true)
    try {
      // Technology and section only drive the pickers; the API derives them from the topic.
      const { technologyId: _technologyId, sectionId: _sectionId, ...body } = form
      await apiRequest(isNew ? '/admin/questions' : `/admin/questions/${questionId}`, {
        method: isNew ? 'POST' : 'PATCH',
        body,
      })
      await refresh()
      notify(isNew ? 'Question created.' : 'Question updated.')
      navigate(returnTo ?? questionsPath(form))
    } catch (error) {
      notify(error.message, 'error')
      setBusy(false)
    }
  }

  return (
    <QuestionEditor
      form={form}
      setForm={setForm}
      technologies={technologies}
      theme={theme}
      busy={busy}
      isNew={isNew}
      onCancel={() => navigate(returnTo ?? '/questions')}
      onSubmit={save}
    />
  )
}

// /questions/new (optionally ?technologyId=&sectionId=&topicId= to preselect) and /questions/:questionId/edit.
export function QuestionEditorPage() {
  const { questionId } = useParams()
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const { technologies, questions, isLoaded } = useWorkspace()
  const returnTo = location.state?.returnTo

  if (!isLoaded) return <PageLoader />

  if (questionId) {
    const question = questions.find((item) => item._id === questionId)
    if (!question) {
      return (
        <EmptyState
          icon={FileQuestion}
          title="Question not found"
          detail="It may have been deleted, or the link is wrong."
          action={<Link className="button button-secondary" to="/questions">Back to the library</Link>}
        />
      )
    }
    return <EditorForm key={questionId} questionId={questionId} initialForm={formFromQuestion(question)} returnTo={returnTo} />
  }

  const placement = firstPlacement(technologies, {
    technologyId: searchParams.get('technologyId') ?? '',
    sectionId: searchParams.get('sectionId') ?? '',
    topicId: searchParams.get('topicId') ?? '',
  })
  return <EditorForm key="new" initialForm={{ ...emptyQuestion(), ...placement }} returnTo={returnTo} />
}
