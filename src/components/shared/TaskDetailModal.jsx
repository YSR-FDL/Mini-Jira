import React, { useState, useEffect, useRef } from 'react';
import ActionBtn from '../ui/ActionBtn';
import StatusDropdown from '../ui/StatusDropdown';
import '../../styles/Shared/TaskDetailModal.css';
import { 
  FiMoreHorizontal, 
  FiX, 
  FiUser, 
  FiClock, 
  FiTag, 
  FiLink, 
  FiAlignLeft, 
  FiList, 
  FiActivity,
  FiMessageSquare
} from 'react-icons/fi';
import { FaBug, FaTasks, FaBookmark, FaExclamationCircle } from 'react-icons/fa';

const TYPE_OPTIONS = [
  { value: 'task', label: 'Tâche', icon: <FaTasks color="#4BCE97" style={{ marginRight: '8px' }}/> },
  { value: 'bug', label: 'Bug', icon: <FaBug color="#F15B50" style={{ marginRight: '8px' }}/> },
  { value: 'story', label: 'Story', icon: <FaBookmark color="#579DFF" style={{ marginRight: '8px' }}/> }
];

const TaskDetailModal = ({ task, onClose, onSave, columns = [] }) => {
  const statusOptions = columns.length > 0 
    ? columns.map(col => {
        let colorClass = 'dot-custom';
        if (col.id === 'todo') colorClass = 'dot-todo';
        else if (col.id === 'in-progress' || col.id === 'progress') colorClass = 'dot-progress';
        else if (col.id === 'review') colorClass = 'dot-review';
        else if (col.id === 'done') colorClass = 'dot-done';
        return {
          value: col.id,
          label: col.title,
          colorClass
        };
      })
    : [
        { value: 'todo', label: 'À Faire', colorClass: 'dot-todo' },
        { value: 'in-progress', label: 'En Cours', colorClass: 'dot-progress' },
        { value: 'review', label: 'En Revue', colorClass: 'dot-review' },
        { value: 'done', label: 'Terminé', colorClass: 'dot-done' }
      ];

  const [editedTask, setEditedTask] = useState({ ...task });
  const [isClosing, setIsClosing] = useState(false);
  const [newComment, setNewComment] = useState("");

  // Activités unifiées
  const [activities, setActivities] = useState([
    { id: 1, type: 'comment', author: 'Yasser', avatar: 'Y', time: 'il y a 2 heures', content: "J'ai commencé à regarder ce ticket. Le design est en cours." },
    { id: 2, type: 'history', author: 'Amine', avatar: 'A', time: 'hier à 14:30', content: "A changé le statut de 'À Faire' à 'En Cours'." },
    { id: 3, type: 'history', author: 'Yasser', avatar: 'Y', time: 'hier à 10:15', content: "A créé le ticket." }
  ]);

  // Inline editing states
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);

  // Refs for auto-focus
  const titleInputRef = useRef(null);
  const descInputRef = useRef(null);

  // Focus management
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    if (isEditingDesc && descInputRef.current) {
      descInputRef.current.focus();
    }
  }, [isEditingDesc]);

  const requestClose = () => {
    setIsClosing(true);
  };

  const handleAnimationEnd = (e) => {
    if (isClosing && e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      requestClose();
    }
  };

  // Ajout d'une entrée dans l'historique
  const addActivity = (type, content) => {
    const newActivity = {
      id: Date.now(),
      type,
      author: 'Vous', // A remplacer par l'utilisateur connecté
      avatar: 'V',
      time: "à l'instant",
      content
    };
    setActivities(prev => [newActivity, ...prev]);
  };

  const submitComment = (e) => {
    if (e.key === 'Enter' && newComment.trim() !== '') {
      addActivity('comment', newComment);
      setNewComment("");
    }
  };

  // Auto-save wrapper
  const saveChanges = (updatedTask, historyMessage = null) => {
    setEditedTask(updatedTask);
    if (historyMessage) {
      addActivity('history', historyMessage);
    }
    if (onSave) {
      onSave(updatedTask);
    }
  };

  const handleSelfAssign = () => {
    const updated = {
      ...editedTask,
      assignee: { name: 'Yasser', initials: 'YA', bgColor: '#185fa5', textColor: '#FFF' }
    };
    saveChanges(updated, "S'est assigné le ticket.");
  };

  // Field change handlers
  const handleFieldChange = (field, value) => {
    let message = null;
    if (field === 'status') {
      const oldStatus = statusOptions.find(s => s.value === editedTask.status)?.label || editedTask.status;
      const newStatus = statusOptions.find(s => s.value === value)?.label || value;
      message = `A changé le statut de '${oldStatus}' à '${newStatus}'.`;
    } else if (field === 'points') {
      message = `A estimé l'effort à ${value} points.`;
    } else if (field === 'type') {
      message = `A changé le type du ticket.`;
    }
    saveChanges({ ...editedTask, [field]: value }, message);
  };

  const stopEditingTitle = () => {
    setIsEditingTitle(false);
    if (editedTask.title.trim() === '') {
      saveChanges({ ...editedTask, title: task.title });
    } else if (editedTask.title !== task.title) {
      addActivity('history', `A modifié le titre.`);
    }
  };

  const stopEditingDesc = () => {
    setIsEditingDesc(false);
    if (editedTask.description !== task.description) {
      addActivity('history', `A mis à jour la description.`);
    }
  };

  if (!task) return null;

  return (
    <div 
      className={`modal-overlay ${isClosing ? 'fade-out' : 'fade-in'}`} 
      onClick={handleOverlayClick}
      onAnimationEnd={handleAnimationEnd}
    >
      <div className={`modal-content ${isClosing ? 'slide-down' : 'slide-up'}`}>
        
        {/* HEADER */}
        <div className="modal-header">
          <div className="breadcrumb">
            <span className="breadcrumb-item">Mini-Jira</span>
            <span>/</span>
            <span className="breadcrumb-item">Sprint Actif</span>
            <span>/</span>
            <span className="breadcrumb-item" style={{ color: 'var(--color-text-primary)' }}>{editedTask.id}</span>
          </div>
          <div className="header-actions">
            <ActionBtn variant="secondary" onClick={() => {}}>Assigner</ActionBtn>
            <ActionBtn variant="secondary" onClick={handleSelfAssign}>S'assigner</ActionBtn>
            <button className="icon-btn" title="Actions supplémentaires"><FiMoreHorizontal size={20} /></button>
            <button className="close-btn" onClick={requestClose} type="button" title="Fermer (Esc)"><FiX size={24} /></button>
          </div>
        </div>

        <div className="modal-body-container">
          <div className="modal-body scroll">
            
            {/* LEFT COLUMN: Main Content */}
            <div className="left-column">
              
              {/* TITLE */}
              <div style={{ marginBottom: '32px' }}>
                {isEditingTitle ? (
                  <input
                    ref={titleInputRef}
                    className="title-input"
                    value={editedTask.title}
                    onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                    onBlur={stopEditingTitle}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === 'Escape') {
                        stopEditingTitle();
                      }
                    }}
                  />
                ) : (
                  <div 
                    className="inline-edit-container task-title"
                    onClick={() => setIsEditingTitle(true)}
                  >
                    {editedTask.title || "Ticket sans titre"}
                  </div>
                )}
              </div>

              {/* DESCRIPTION */}
              <div style={{ marginBottom: '40px' }}>
                <h3 className="section-title"><FiAlignLeft style={{ marginRight: '8px' }}/> Description</h3>
                {isEditingDesc ? (
                  <div>
                    <textarea
                      ref={descInputRef}
                      className="description-textarea scroll"
                      value={editedTask.description || ''}
                      onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                      placeholder="Ajoutez une description détaillée..."
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          stopEditingDesc();
                        }
                      }}
                    />
                    <div className="edit-actions">
                      <ActionBtn variant="primary" onClick={stopEditingDesc}>Enregistrer</ActionBtn>
                      <ActionBtn variant="secondary" onClick={() => {
                        setEditedTask({ ...editedTask, description: task.description }); // revert
                        setIsEditingDesc(false);
                      }}>Annuler</ActionBtn>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="inline-edit-container description-text"
                    onClick={() => setIsEditingDesc(true)}
                  >
                    {editedTask.description ? (
                      editedTask.description
                    ) : (
                      <span className="description-placeholder">Ajouter une description...</span>
                    )}
                  </div>
                )}
              </div>

              {/* SUB-TASKS (Placeholder) */}
              <div style={{ marginBottom: '40px' }}>
                <h3 className="section-title"><FiList style={{ marginRight: '8px' }}/> Sous-tâches</h3>
                <div style={{ padding: '16px', border: '1px dashed var(--color-border-secondary)', borderRadius: '4px', textAlign: 'center', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                  + Créer une sous-tâche
                </div>
              </div>

              {/* ACTIVITY */}
              <div>
                <h3 className="section-title"><FiActivity style={{ marginRight: '8px' }}/> Activité</h3>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                  <div className="activity-avatar">V</div>
                  <input 
                    type="text" 
                    className="standard-textarea" 
                    style={{ minHeight: '40px', padding: '10px 16px', borderRadius: '24px', flex: 1, cursor: 'text' }} 
                    placeholder="Ajoutez un commentaire (Entrée pour envoyer)..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={submitComment}
                  />
                </div>
                
                <div className="activity-feed">
                  {activities.map(act => (
                    <div key={act.id} className="activity-item">
                      <div className="activity-avatar">{act.avatar}</div>
                      <div className="activity-content">
                        <div className="activity-header">
                          <span className="activity-author">{act.author}</span>
                          <span className="activity-time">{act.time}</span>
                        </div>
                        <div className="activity-body">
                          {act.content}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Metadata */}
            <div className="right-column">
              <div className="metadata-panel">
                
                {/* STATUT */}
                <div className="metadata-group" style={{ marginBottom: '8px' }}>
                  <div className="metadata-label">STATUT</div>
                  <div className="metadata-value no-hover" style={{ margin: 0, padding: 0 }}>
                    <StatusDropdown 
                      options={statusOptions}
                      value={editedTask.status}
                      onChange={(val) => handleFieldChange('status', val)}
                    />
                  </div>
                </div>

                {/* DÉTAILS */}
                <div style={{ borderTop: '1px solid var(--color-border-secondary)', paddingTop: '16px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: 'var(--color-text-primary)' }}>Détails</h4>
                  
                  <div className="metadata-group">
                    <div className="metadata-label">Type</div>
                    <div className="metadata-value no-hover">
                      <select 
                        className="ui-input"
                        style={{ height: '32px', padding: '0 8px' }}
                        value={editedTask.type || 'task'}
                        onChange={(e) => handleFieldChange('type', e.target.value)}
                      >
                        {TYPE_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="metadata-group">
                    <div className="metadata-label">Priorité</div>
                    <div className="metadata-value">
                      <FaExclamationCircle color="#FF991F" style={{ marginRight: '8px' }}/> Moyenne
                    </div>
                  </div>

                  <div className="metadata-group">
                    <div className="metadata-label">Labels</div>
                    <div className="metadata-value">
                      <span className="tag-badge">frontend</span>
                      <span className="tag-badge">design</span>
                    </div>
                  </div>

                  <div className="metadata-group">
                    <div className="metadata-label">Assigné à</div>
                    <div className="metadata-value">
                      {editedTask.assignee ? (
                        <div className="user-display">
                          <div 
                            className="user-avatar-small"
                            style={{
                              background: editedTask.assignee.bgColor || '#e6f1fb',
                              color: editedTask.assignee.textColor || '#185fa5',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: '600'
                            }}
                          >
                            {editedTask.assignee.initials || (editedTask.assignee.name ? editedTask.assignee.name.substring(0, 2).toUpperCase() : '—')}
                          </div>
                          {editedTask.assignee.name || editedTask.assignee}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>Non assigné</span>
                      )}
                    </div>
                  </div>

                  <div className="metadata-group">
                    <div className="metadata-label">Rapporteur</div>
                    <div className="metadata-value">
                      <div className="user-display">
                        <div className="user-avatar-small" style={{ backgroundColor: '#FF5630'}}>A</div>
                        Amine
                      </div>
                    </div>
                  </div>

                  <div className="metadata-group">
                    <div className="metadata-label">Sprint</div>
                    <div className="metadata-value" style={{ color: 'var(--color-primary-blue)' }}>
                      Sprint 1
                    </div>
                  </div>

                  <div className="metadata-group">
                    <div className="metadata-label">Story points</div>
                    <div className="metadata-value no-hover">
                      <input 
                        type="number"
                        min="0"
                        className="ui-input"
                        style={{ minHeight: 'auto', height: '32px', width: '60px', padding: '4px 8px', margin: 0 }}
                        value={editedTask.points || 0}
                        onChange={(e) => handleFieldChange('points', Math.max(0, parseInt(e.target.value) || 0))}
                      />
                    </div>
                  </div>

                  <div className="metadata-group">
                    <div className="metadata-label">Liens</div>
                    <div className="metadata-value" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                      <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Bloque :</div>
                      <a href="#" className="link-badge">PROJ-42</a>
                      <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>Bloqué par :</div>
                      <a href="#" className="link-badge">PROJ-39</a>
                    </div>
                  </div>
                </div>

                {/* DATES */}
                <div style={{ borderTop: '1px solid var(--color-border-secondary)', paddingTop: '16px' }}>
                  <div className="metadata-group">
                    <div className="metadata-label">Date limite</div>
                    <div className="metadata-value no-hover date-value">
                      <input 
                        type="date"
                        className="ui-input"
                        style={{ minHeight: 'auto', height: '32px', padding: '4px 8px', margin: 0 }}
                        value={editedTask.dueDate || ''}
                        onChange={(e) => handleFieldChange('dueDate', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="metadata-group">
                    <div className="metadata-label">Créé le</div>
                    <div className="metadata-value no-hover date-value">22 Mai 2026, 14:20</div>
                  </div>
                  <div className="metadata-group">
                    <div className="metadata-label">Mis à jour</div>
                    <div className="metadata-value no-hover date-value">Il y a 2 heures</div>
                  </div>
                </div>

              </div>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
};

export default TaskDetailModal;
