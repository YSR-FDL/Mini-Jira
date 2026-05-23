import React from 'react';
import '../../styles/BoardControlBar.css';

function BoardControlBar({ 
  search, 
  onSearch, 
  assignees, 
  activeAssignees, 
  onToggleAssignee, 
  onClearFilters,
  sprint, 
  onCompleteSprint 
}) {
  return (
    <div className="board-control-bar">
      {/* GAUCHE : RECHERCHE ET FILTRES */}
      <div className="board-controls-left">
        <input
          type="text"
          className="search-local"
          placeholder="Rechercher dans le board..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />

        {assignees && assignees.length > 0 && (
          <div className="board-filters-avatars">
            {assignees.map((assignee, index) => {
              const isActive = activeAssignees.includes(assignee.name);
              const hasActiveFilters = activeAssignees.length > 0;
              // Si des filtres sont actifs et que cet avatar n'est pas dedans, on le grise
              const statusClass = hasActiveFilters ? (isActive ? 'active' : 'inactive') : '';
              
              return (
                <div
                  key={`${assignee.name}-${index}`}
                  className={`board-filter-avatar ${statusClass}`}
                  style={{
                    background: assignee.bgColor || '#e6f1fb',
                    color: assignee.textColor || '#185fa5',
                  }}
                  title={`Filtrer par ${assignee.name}`}
                  onClick={() => onToggleAssignee(assignee.name)}
                >
                  {assignee.initials}
                </div>
              );
            })}
          </div>
        )}

        {/* Bouton pour réinitialiser les filtres si certains sont actifs */}
        {(search || activeAssignees.length > 0) && (
          <button className="board-clear-filters" onClick={onClearFilters}>
            Effacer les filtres
          </button>
        )}
      </div>

      {/* DROITE : INFOS SPRINT ET ACTION */}
      <div className="board-controls-right">
        {sprint && (
          <div className="sprint-info">
            <span className="sprint-info-name">{sprint.name}</span>
            <div className="sprint-info-dates">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{sprint.startDate} - {sprint.endDate || 'En cours'}</span>
            </div>
          </div>
        )}
        <button className="btn-complete-sprint" onClick={onCompleteSprint}>
          Complete Sprint
        </button>
      </div>
    </div>
  );
}

export default BoardControlBar;
