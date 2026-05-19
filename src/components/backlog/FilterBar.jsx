import React from 'react';

const TYPE_FILTERS = ['Toutes', 'Feature', 'Bug', 'Tech'];

function FilterBar({ search, onSearch, activeFilter, onFilter }) {
    return (
        <div className="filter-bar">

            <input
                className="search-local"
                placeholder="Rechercher dans le backlog..."
                value={search}
                onChange={(e) => onSearch(e.target.value)}
            />

            {TYPE_FILTERS.map((f) => (
                <span
                    key={f}
                    className={`filter-chip ${activeFilter === f ? 'on' : ''}`}
                    onClick={() => onFilter(f)}
                >
          {f}
        </span>
            ))}

            {/* Boutons de tri */}
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                <span className="filter-chip">Priorité ↕</span>
                <span className="filter-chip">Points ↕</span>
            </div>

        </div>
    );
}

export default FilterBar;