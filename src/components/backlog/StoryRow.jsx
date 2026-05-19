import React from 'react';

const PRIORITY_CONFIG = {
    critical: { dotClass: 'prio-dot p-critical', badgeClass: 'priority-badge priority-critical-badge', label: 'CRITICAL' },
    high:     { dotClass: 'prio-dot p-high',     badgeClass: 'priority-badge priority-high-badge',     label: 'HIGH' },
    medium:   { dotClass: 'prio-dot p-med',      badgeClass: 'priority-badge priority-medium-badge',   label: 'MEDIUM' },
    low:      { dotClass: 'prio-dot p-low',      badgeClass: 'priority-badge priority-low-badge',      label: 'LOW' },
};

const STATUS_CONFIG = {
    'in-progress': { className: 'story-status s-prog', label: 'En cours' },
    'todo':        { className: 'story-status s-todo', label: 'À faire' },
    'done':        { className: 'story-status s-done', label: 'Terminé' },
    'review':      { className: 'story-status s-rev',  label: 'En revue' },
};

const TAG_CONFIG = {
    feature: { className: 'tag t-feat', label: 'Feature' },
    bug:     { className: 'tag t-bug',  label: 'Bug' },
    tech:    { className: 'tag t-tech', label: 'Tech' },
};

function StoryRow({ task }) {
    if (!task) return null;

    const { id, title, priority, status, tags = [], points, assignee } = task;

    const prio = PRIORITY_CONFIG[priority?.toLowerCase()] ?? PRIORITY_CONFIG.low;
    const stat = STATUS_CONFIG[status?.toLowerCase()] ?? STATUS_CONFIG['todo'];

    const getInitials = (name) => name ? name.substring(0, 2).toUpperCase() : '—';

    return (
        <div className="story-row">
            <span className="drag-handle">⠿</span>
            <div className={prio.dotClass} />
            <span className="story-id">{id}</span>
            <span className={prio.badgeClass}>{prio.label}</span>
            <span className="story-title">{title}</span>

            <div className="story-tags">
                {tags.map((tag) => {
                    const t = TAG_CONFIG[tag.toLowerCase()] ?? { className: 'tag', label: tag };
                    return <span key={tag} className={t.className}>{t.label}</span>;
                })}
            </div>

            <span className={stat.className}>{stat.label}</span>
            <span className="story-pts">{points ? `${points} pts` : '-'}</span>

            {assignee ? (
                <div
                    className="story-av"
                    style={{
                        background: assignee.bgColor || '#e6f1fb',
                        color: assignee.textColor || '#185fa5'
                    }}
                    title={assignee.name || assignee}
                >
                    {assignee.initials || getInitials(assignee.name || assignee)}
                </div>
            ) : (
                <div
                    className="story-av"
                    style={{ background: '#f4f5f7', color: '#8993a4' }}
                >
                    —
                </div>
            )}
        </div>
    );
}

export default StoryRow;