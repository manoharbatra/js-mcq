import { useState } from "react";
import { buildPath } from "../router.js";
import { ChevronDown, House, X } from "lucide-react";
import { Link } from "./Link.jsx";

export function Sidebar({ catalogState, activeTechnologySlug, activeSectionSlug, isHome, isOpen, onClose }) {
    const [expandedTechnologies, setExpandedTechnologies] = useState({});
    const { status, technologies } = catalogState;

    return (
        <aside id="site-nav" className={`sidebar ${isOpen ? "is-open" : ""}`} aria-label="Study navigation">
            <div className="sidebar-head">
                <Link className="brand" to="/" onClick={onClose}>
                    <span className="brand-mark">JS</span>
                    <span className="brand-text">
                        <strong>JS MCQ Practice</strong>
                        <small>Interview practice</small>
                    </span>
                </Link>
                <button className="icon-button sidebar-close" type="button" onClick={onClose} aria-label="Close navigation">
                    <X size={18} />
                </button>
            </div>

            <nav className="sidebar-nav">
                <Link className={`nav-link ${isHome ? "active" : ""}`} to="/" aria-current={isHome ? "page" : undefined} onClick={onClose}>
                    <House size={20} />
                    Study topics
                </Link>

                <p className="nav-label">Technologies</p>
                {status === "loading" ? (
                    <p className="nav-message">Loading technologies…</p>
                ) : status === "error" ? (
                    <p className="nav-message">Technologies are unavailable right now.</p>
                ) : !technologies.length ? (
                    <p className="nav-message">No technologies yet.</p>
                ) : (
                    <ul className="nav-topics">
                        {technologies.map((technology) => {
                            const isActive = technology.slug === activeTechnologySlug;
                            const isExpanded = expandedTechnologies[technology.slug] ?? isActive;
                            const listId = `nav-sections-${technology.id}`;
                            return (
                                <li key={technology.id}>
                                    <button
                                        className={`nav-topic ${isActive ? "active" : ""}`}
                                        type="button"
                                        aria-expanded={isExpanded}
                                        aria-controls={listId}
                                        onClick={() => setExpandedTechnologies((current) => ({ ...current, [technology.slug]: !isExpanded }))}
                                    >
                                        <span className="nav-topic-name">{technology.name}</span>
                                        <ChevronDown size={16} className="nav-chevron" />
                                    </button>
                                    <ul className="nav-subtopics" id={listId} hidden={!isExpanded}>
                                        {technology.sections.length ? (
                                            technology.sections.map((section) => {
                                                const isCurrent = isActive && section.slug === activeSectionSlug;
                                                return (
                                                    <li key={section.id}>
                                                        <Link
                                                            className={`nav-subtopic ${isCurrent ? "active" : ""}`}
                                                            to={buildPath(technology.slug, section.slug)}
                                                            aria-current={isCurrent ? "page" : undefined}
                                                            onClick={onClose}
                                                        >
                                                            <span className="nav-subtopic-name">{section.name}</span>
                                                            <span className="nav-count">{section.questionCount}</span>
                                                        </Link>
                                                    </li>
                                                );
                                            })
                                        ) : (
                                            <li className="nav-empty">No sections yet</li>
                                        )}
                                    </ul>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </nav>
        </aside>
    );
}
