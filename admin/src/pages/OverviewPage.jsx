import { Link } from 'react-router'
import { FileQuestion, FolderTree, Layers, Link2, Plus } from 'lucide-react'
import { countLabel, indexCatalog, nameOf } from '../catalog.js'
import { EmptyState, PageHeader, Pill } from '../components/ui.jsx'
import { useWorkspace } from '../workspace.js'

function StatCard({ icon: IconComponent, tone, label, value, note }) {
  return (
    <article className="stat-card">
      <span className={`stat-icon stat-icon-${tone}`}><IconComponent size={20} /></span>
      <div>
        <span className="stat-label">{label}</span>
        <strong className="stat-value">{value}</strong>
        <span className="stat-note">{note}</span>
      </div>
    </article>
  )
}

export function OverviewPage() {
  const { technologies, questions } = useWorkspace()
  const { technologyById, sectionById, topicById } = indexCatalog(technologies)
  const resourceCount = questions.filter((question) => question.mediumUrl || question.compilerUrl).length
  const recentQuestions = [...questions].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 6)

  return (
    <>
      <PageHeader
        eyebrow="Workspace"
        title="Overview"
        description="A snapshot of everything learners can practice."
        actions={(
          <>
            <Link className="button button-secondary" to="/catalog">
              <FolderTree size={17} /> Manage structure
            </Link>
            <Link className="button button-primary" to="/questions/new">
              <Plus size={17} /> New question
            </Link>
          </>
        )}
      />

      <div className="stats-grid">
        <StatCard icon={FolderTree} tone="violet" label="Technologies" value={technologyById.size} note={countLabel(sectionById.size, 'section')} />
        <StatCard icon={Layers} tone="blue" label="Topics" value={topicById.size} note="Across all sections" />
        <StatCard icon={FileQuestion} tone="amber" label="Questions" value={questions.length} note="In the library" />
        <StatCard icon={Link2} tone="green" label="With resources" value={resourceCount} note="Article or compiler link" />
      </div>

      <div className="overview-grid">
        <section className="panel">
          <div className="panel-header">
            <div><h2>Content by technology</h2><p>Sections, topics and questions per technology</p></div>
          </div>
          {technologies.length ? (
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Technology</th><th className="num">Sections</th><th className="num">Topics</th><th className="num">Questions</th></tr></thead>
                <tbody>
                  {technologies.map((technology) => {
                    const topics = technology.sections.flatMap((section) => section.topics)
                    const questionTotal = topics.reduce((sum, topic) => sum + topic.questionCount, 0)
                    return (
                      <tr key={technology._id}>
                        <td>
                          <span className="cell-title">{technology.name}</span>
                          {technology.isActive === false && <Pill tone="muted">Hidden</Pill>}
                        </td>
                        <td className="num">{technology.sections.length}</td>
                        <td className="num">{topics.length}</td>
                        <td className="num">{questionTotal}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={FolderTree}
              title="No technologies yet"
              detail="Create a technology, then add sections and topics to it."
              action={<Link className="button button-secondary" to="/catalog">Open content structure</Link>}
            />
          )}
        </section>

        <section className="panel">
          <div className="panel-header">
            <div><h2>Recently updated</h2><p>Your latest question edits</p></div>
            <Link className="button button-ghost button-sm" to="/questions">View all</Link>
          </div>
          {recentQuestions.length ? (
            <ul className="recent-list">
              {recentQuestions.map((question) => (
                <li key={question._id}>
                  <span className="recent-title">{question.title}</span>
                  <span className="recent-meta">
                    {nameOf(technologyById, question.technologyId)} › {nameOf(sectionById, question.sectionId)} › {nameOf(topicById, question.topicId)}
                    <span aria-hidden="true"> · </span>
                    {new Date(question.updatedAt).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={FileQuestion} title="No questions yet" detail="Questions you create will show up here." />
          )}
        </section>
      </div>
    </>
  )
}
