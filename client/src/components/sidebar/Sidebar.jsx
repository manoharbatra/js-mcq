import { useState } from "react";
import { buildPath } from "../../paths.js";
import { ChevronDown, House } from "lucide-react";
import { Link, NavLink } from "react-router";
import "./Sidebar.css";

const pageLinks = [{ to: "/", label: "Home", icon: House, end: true }];

export function Sidebar({ catalogState, activeTechnologySlug, activeSectionSlug, isOpen, onClose }) {
    const [expandedTechnologies, setExpandedTechnologies] = useState({});
    const { status, technologies } = catalogState;

    return (
        <aside id="site-nav" className={`sidebar ${isOpen ? "is-open" : ""}`} aria-label="Study navigation">
            <div className="sidebar-head">
                <Link className="brand" to="/" onClick={onClose}>
                    <span className="brand-mark">JS</span>
                    <span className="brand-text">
                        <strong>Dev Buddy</strong>
                        <small>by Manohar Batra</small>
                    </span>
                </Link>
            </div>

            <nav className="sidebar-nav">
                <ul className="nav-pages">
                    {pageLinks.map(({ to, label, icon: Icon, end }) => (
                        <li key={to}>
                            <NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} to={to} end={end} onClick={onClose}>
                                <Icon size={20} />
                                {label}
                            </NavLink>
                        </li>
                    ))}
                </ul>

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
