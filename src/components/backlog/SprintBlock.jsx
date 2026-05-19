import React, { useState } from 'react';
import StoryRow from './StoryRow';

export default function SprintBlock({ sprint, sprintTasks }) {
    const [isExpanded, setIsExpanded] = useState(true);

    // status badge
    let badgeClass = 'b-planned';
    let statusLabel = 'Planifié';
    if (sprint.status === 'active') {
        badgeClass = 'b-active';
        statusLabel = 'Actif';
    } else if (sprint.status === 'done') {
        badgeClass = 'b-done';
        statusLabel = 'Terminé';
    }

    // LOGIQUE DES POINTS ET DE LA CAPACITÉ
    // 1. Somme des Story Points affectes a ce sprint
    const totalPoints = sprintTasks.reduce((sum, task) => sum + (task.points || 0), 0);

    // 2. Sommer les Story Points des tâches terminées uniquement
    const donePoints = sprintTasks
        .filter(task => task.status === 'done')
        .reduce((sum, task) => sum + (task.points || 0), 0);

    // 3. Remplir en pourcentage pour la jauge CSS
    const progressPercent = totalPoints === 0 ? 0 : Math.round((donePoints / totalPoints) * 100);

    return (
        <div className="sprint-block">

            {/* EN-TÊTE DU BLOC SPRINT */}
            <div className="sprint-head">
        <span
            className="chevron"
            onClick={() => setIsExpanded(!isExpanded)}
            style={{ transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)', display: 'inline-block' }}
        >
          ▼
        </span>

                <span className="sprint-title">{sprint.name}</span>

                {/* Format de date désiré : 11 mai -> 17 mai 2026 */}
                {sprint.startDate && sprint.endDate && (
                    <span className="sprint-dates">{sprint.startDate} -> {sprint.endDate}</span>
                )}

                {/* Masquer le badge if conteneur de Backlog général */}
                {sprint.id !== 'backlog' && <span className={`badge ${badgeClass}`}>{statusLabel}</span>}

                {/* Affichage de la capacité au format souhaité (ex: 8/18 pts) */}
                <div className="sprint-stats">
                    <span className="stat"><span>{donePoints}</span>/{totalPoints} pts</span>
                    <div className="pbar-wrap">
                        <div className="pbar-bg">
                            <div className="pbar-fill" style={{ width: `${progressPercent}%` }}></div>
                        </div>
                    </div>
                </div>

                <div className="sprint-actions">
                    {sprint.status === 'planned' && (
                        <button className="btn-xs blue">Démarrer le sprint</button>
                    )}
                    {sprint.status === 'active' && (
                        <button className="btn-xs">Terminer le sprint</button>
                    )}
                    <button className="btn-xs">•••</button>
                </div>
            </div>

            {/* LISTE DES TICKETS INTERNES */}
            {isExpanded && (
                <div className="sprint-content">
                    {sprintTasks.length > 0 ? (
                        sprintTasks.map(task => (
                            <StoryRow key={task.id} task={task} />
                        ))
                    ) : (
                        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '12px' }}>
                            Aucun ticket planifié dans ce bloc.
                        </div>
                    )}

                    <div className="add-story">
                        <span style={{ fontSize: '14px', fontWeight: 'bold' }}>+</span> Créer un ticket
                    </div>
                </div>
            )}

        </div>
    );
}