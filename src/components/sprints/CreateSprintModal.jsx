import React, { useState, useEffect, useRef } from 'react';
import '../../styles/sprints/CreateSprintModal.css';
import { FiX, FiCalendar, FiFlag, FiFileText, FiZap } from 'react-icons/fi';

const DURATION_PRESETS = [
  { label: '1 semaine', days: 7 },
  { label: '2 semaines', days: 14 },
  { label: '3 semaines', days: 21 },
  { label: '1 mois', days: 30 },
];

const formatDateInput = (date) => {
  return date.toISOString().split('T')[0];
};

const addDays = (dateStr, days) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return formatDateInput(d);
};

const CreateSprintModal = ({ onClose, onSave, sprintCount = 1 }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [errors, setErrors] = useState({});

  const today = formatDateInput(new Date());

  const [form, setForm] = useState({
    name: `Sprint ${sprintCount}`,
    goal: '',
    startDate: today,
    endDate: addDays(today, 14),
    capacity: '',
  });

  const nameRef = useRef(null);

  useEffect(() => {
    if (nameRef.current) {
      nameRef.current.focus();
      nameRef.current.select();
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => onClose(), 200);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) handleClose();
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const applyPreset = (days) => {
    const end = addDays(form.startDate, days);
    setForm((prev) => ({ ...prev, endDate: end }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Le nom du sprint est requis.';
    if (!form.startDate) newErrors.startDate = 'Date de début requise.';
    if (!form.endDate) newErrors.endDate = 'Date de fin requise.';
    if (form.startDate && form.endDate && form.endDate <= form.startDate) {
      newErrors.endDate = 'La date de fin doit être après la date de début.';
    }
    if (form.capacity && (isNaN(form.capacity) || Number(form.capacity) < 0)) {
      newErrors.capacity = 'Capacité invalide.';
    }
    return newErrors;
  };

  const handleSubmit = () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const sprint = {
      id: `sprint-${Date.now()}`,
      name: form.name.trim(),
      goal: form.goal.trim(),
      startDate: form.startDate,
      endDate: form.endDate,
      capacity: form.capacity ? parseInt(form.capacity) : null,
      status: 'upcoming',
      issues: [],
    };

    if (onSave) onSave(sprint);
    handleClose();
  };

  return (
    <div
      className={`csm-overlay ${isClosing ? 'csm-fade-out' : 'csm-fade-in'}`}
      onClick={handleOverlayClick}
    >
      <div className={`csm-modal ${isClosing ? 'csm-slide-down' : 'csm-slide-up'}`}>

        {/* HEADER */}
        <div className="csm-header">
          <div className="csm-header-left">
            <div className="csm-icon-wrap">
              <FiZap size={16} />
            </div>
            <h2 className="csm-title">Créer un sprint</h2>
          </div>
          <button className="csm-close-btn" onClick={handleClose} title="Fermer (Esc)">
            <FiX size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="csm-body">

          {/* Nom */}
          <div className="csm-field">
            <label className="csm-label">
              Nom du sprint <span className="csm-required">*</span>
            </label>
            <input
              ref={nameRef}
              type="text"
              className={`csm-input ${errors.name ? 'csm-input-error' : ''}`}
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="ex: Sprint 3"
            />
            {errors.name && <span className="csm-error-msg">{errors.name}</span>}
          </div>

          {/* Objectif */}
          <div className="csm-field">
            <label className="csm-label">
              <FiFlag size={13} style={{ marginRight: '6px', verticalAlign: '-2px' }} />
              Objectif du sprint
            </label>
            <textarea
              className="csm-textarea"
              value={form.goal}
              onChange={(e) => handleChange('goal', e.target.value)}
              placeholder="Quel est le but principal de ce sprint ?"
              rows={3}
            />
          </div>

          {/* Dates */}
          <div className="csm-field">
            <label className="csm-label">
              <FiCalendar size={13} style={{ marginRight: '6px', verticalAlign: '-2px' }} />
              Durée <span className="csm-required">*</span>
            </label>

            {/* Presets */}
            <div className="csm-presets">
              {DURATION_PRESETS.map((p) => (
                <button
                  key={p.days}
                  type="button"
                  className="csm-preset-btn"
                  onClick={() => applyPreset(p.days)}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="csm-date-row">
              <div className="csm-date-field">
                <span className="csm-date-label">Début</span>
                <input
                  type="date"
                  className={`csm-input ${errors.startDate ? 'csm-input-error' : ''}`}
                  value={form.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                />
                {errors.startDate && <span className="csm-error-msg">{errors.startDate}</span>}
              </div>
              <span className="csm-date-arrow">→</span>
              <div className="csm-date-field">
                <span className="csm-date-label">Fin</span>
                <input
                  type="date"
                  className={`csm-input ${errors.endDate ? 'csm-input-error' : ''}`}
                  value={form.endDate}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                />
                {errors.endDate && <span className="csm-error-msg">{errors.endDate}</span>}
              </div>
            </div>
          </div>

          {/* Capacité */}
          <div className="csm-field">
            <label className="csm-label">
              <FiFileText size={13} style={{ marginRight: '6px', verticalAlign: '-2px' }} />
              Capacité de l'équipe
              <span className="csm-hint"> (story points)</span>
            </label>
            <input
              type="number"
              min="0"
              className={`csm-input csm-input-sm ${errors.capacity ? 'csm-input-error' : ''}`}
              value={form.capacity}
              onChange={(e) => handleChange('capacity', e.target.value)}
              placeholder="ex: 40"
            />
            {errors.capacity && <span className="csm-error-msg">{errors.capacity}</span>}
          </div>

        </div>

        {/* FOOTER */}
        <div className="csm-footer">
          <button className="csm-btn-ghost" onClick={handleClose}>
            Annuler
          </button>
          <button className="csm-btn-primary" onClick={handleSubmit}>
            Créer le sprint
          </button>
        </div>

      </div>
    </div>
  );
};

export default CreateSprintModal;
