import React, { useState } from 'react';
import ProjectLayout from '../../components/layout/ProjectLayout';
import ActionBtn from '../../components/ui/ActionBtn';
import { projectService } from '../../services/projectService';
import '../../styles/Project/Settings.css';
import { 
  FiSettings, 
  FiSliders, 
  FiUsers, 
  FiBell, 
  FiAlertTriangle, 
  FiTrash2, 
  FiArchive 
} from 'react-icons/fi';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('settings');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  // 1. Informations Générales
  const [generalInfo, setGeneralInfo] = useState({
    name: 'Mini-Jira',
    key: 'PROJ',
    description: 'Un outil de gestion de projet minimaliste.',
    color: '#0052CC',
  });

  // 2. Configuration
  const [config, setConfig] = useState({
    type: 'Scrum',
    status: 'Actif',
    startDate: '2026-05-01',
    endDate: '2026-12-31',
  });

  // 3. Accès & membres
  const [access, setAccess] = useState({
    visibility: 'Privé',
    manager: 'Yasser',
  });

  const [members, setMembers] = useState([
    { id: 1, name: 'Yasser', role: 'Admin', initials: 'Y' },
    { id: 2, name: 'Amine', role: 'Membre', initials: 'A' },
    { id: 3, name: 'Sara', role: 'Observateur', initials: 'S' },
  ]);

  // 4. Notifications
  const [notifications, setNotifications] = useState({
    newTask: true,
    statusChange: true,
    mentions: true,
    dailyDigest: false,
  });

  const handleGeneralChange = (field, value) => {
    setGeneralInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleConfigChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleAccessChange = (field, value) => {
    setAccess(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationToggle = (field) => {
    setNotifications(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');
    
    try {
      // Simulation d'une sauvegarde
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Essayer de mettre à jour le service si implémenté
      if (projectService && projectService.updateProject) {
        await projectService.updateProject(generalInfo).catch(err => console.warn('Mock service error:', err));
      }
      
      setMessage('Paramètres mis à jour avec succès.');
    } catch (error) {
      setMessage('Erreur lors de la mise à jour.');
      console.error(error);
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <ProjectLayout activeTab={activeTab} onTabChange={setActiveTab} projectName={generalInfo.name}>
      <div className="settings-container scroll">
        <div className="settings-content">
          
          <div className="settings-header">
            <h2 className="settings-title">Paramètres du Projet</h2>
            <p className="settings-description">
              Gérez les détails, la configuration, l'accès et les notifications de votre projet.
            </p>
          </div>

          <form onSubmit={handleSave} className="settings-content">
            
            {/* 1. Informations Générales */}
            <section className="settings-section">
              <h3 className="settings-section-title"><FiSettings /> Informations générales</h3>
              <p className="settings-section-subtitle">Définissez l'identité de base de votre projet.</p>
              
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Nom du projet</label>
                  <input 
                    className="form-input"
                    type="text"
                    value={generalInfo.name}
                    onChange={(e) => handleGeneralChange('name', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Clé du projet</label>
                  <input 
                    className="form-input"
                    type="text"
                    value={generalInfo.key}
                    onChange={(e) => handleGeneralChange('key', e.target.value)}
                    required
                    maxLength={10}
                  />
                </div>
                <div className="form-group full-width">
                  <label className="form-label">Description courte</label>
                  <textarea 
                    className="form-textarea"
                    value={generalInfo.description}
                    onChange={(e) => handleGeneralChange('description', e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Couleur / Icône</label>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <input 
                      type="color"
                      value={generalInfo.color}
                      onChange={(e) => handleGeneralChange('color', e.target.value)}
                      style={{ width: '40px', height: '40px', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: 0 }}
                    />
                    <span style={{ fontSize: '14px', color: 'var(--text-soft)' }}>{generalInfo.color}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Configuration */}
            <section className="settings-section">
              <h3 className="settings-section-title"><FiSliders /> Configuration</h3>
              <p className="settings-section-subtitle">Ajustez le comportement et le cycle de vie du projet.</p>
              
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Statut du projet</label>
                  <select 
                    className="form-select"
                    value={config.status}
                    onChange={(e) => handleConfigChange('status', e.target.value)}
                  >
                    <option value="Actif">Actif</option>
                    <option value="En attente">En attente</option>
                    <option value="Archivé">Archivé</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Date de début</label>
                  <input 
                    className="form-input"
                    type="date"
                    value={config.startDate}
                    onChange={(e) => handleConfigChange('startDate', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Date de fin prévue</label>
                  <input 
                    className="form-input"
                    type="date"
                    value={config.endDate}
                    onChange={(e) => handleConfigChange('endDate', e.target.value)}
                  />
                </div>
              </div>
            </section>

            {/* 3. Accès & membres */}
            <section className="settings-section">
              <h3 className="settings-section-title"><FiUsers /> Accès & membres</h3>
              <p className="settings-section-subtitle">Gérez qui peut voir et modifier ce projet.</p>
              
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Visibilité</label>
                  <div className="radio-group">
                    <label>
                      <input 
                        type="radio" 
                        className="radio-input" 
                        name="visibility" 
                        value="Privé"
                        checked={access.visibility === 'Privé'}
                        onChange={(e) => handleAccessChange('visibility', e.target.value)}
                      />
                      <span className="radio-label">Privé</span>
                    </label>
                    <label>
                      <input 
                        type="radio" 
                        className="radio-input" 
                        name="visibility" 
                        value="Public interne"
                        checked={access.visibility === 'Public interne'}
                        onChange={(e) => handleAccessChange('visibility', e.target.value)}
                      />
                      <span className="radio-label">Public interne</span>
                    </label>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Chef de projet</label>
                  <input 
                    className="form-input"
                    type="text"
                    value={access.manager}
                    onChange={(e) => handleAccessChange('manager', e.target.value)}
                  />
                </div>
              </div>

              <div className="members-list">
                <label className="form-label" style={{ marginTop: '16px' }}>Membres actuels</label>
                {members.map(member => (
                  <div key={member.id} className="member-item">
                    <div className="member-info">
                      <div className="member-avatar">{member.initials}</div>
                      <div>
                        <div className="member-name">{member.name}</div>
                        <div className="member-role">{member.role}</div>
                      </div>
                    </div>
                    <select 
                      className="form-select" 
                      style={{ width: 'auto', padding: '6px 12px' }}
                      value={member.role}
                      onChange={(e) => {
                        const newMembers = members.map(m => m.id === member.id ? { ...m, role: e.target.value } : m);
                        setMembers(newMembers);
                      }}
                    >
                      <option value="Admin">Admin</option>
                      <option value="Membre">Membre</option>
                      <option value="Observateur">Observateur</option>
                    </select>
                  </div>
                ))}
              </div>
            </section>

            {/* 4. Notifications */}
            <section className="settings-section">
              <h3 className="settings-section-title"><FiBell /> Notifications</h3>
              <p className="settings-section-subtitle">Configurez vos préférences d'alertes pour ce projet.</p>
              
              <div className="toggle-row">
                <div className="toggle-info">
                  <span className="toggle-title">Nouvelle tâche</span>
                  <span className="toggle-desc">Être notifié quand une nouvelle tâche est créée.</span>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" checked={notifications.newTask} onChange={() => handleNotificationToggle('newTask')} />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="toggle-row">
                <div className="toggle-info">
                  <span className="toggle-title">Changement de statut</span>
                  <span className="toggle-desc">Être notifié quand le statut d'une tâche change (ex: En cours → Terminé).</span>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" checked={notifications.statusChange} onChange={() => handleNotificationToggle('statusChange')} />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="toggle-row">
                <div className="toggle-info">
                  <span className="toggle-title">Mentions</span>
                  <span className="toggle-desc">Être notifié quand quelqu'un vous mentionne dans un commentaire.</span>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" checked={notifications.mentions} onChange={() => handleNotificationToggle('mentions')} />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </section>

            <div className="settings-footer">
              {message && <span className="save-message">{message}</span>}
              <ActionBtn type="submit" variant="primary">
                {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </ActionBtn>
            </div>
          </form>

          {/* 5. Danger zone */}
          <section className="settings-section danger-zone" style={{ marginTop: '-16px' }}>
            <h3 className="settings-section-title"><FiAlertTriangle /> Danger Zone</h3>
            <p className="settings-section-subtitle" style={{ color: 'var(--red-text)' }}>
              Actions irréversibles. Soyez prudent.
            </p>
            
            <div className="danger-action-row">
              <div className="danger-action-info">
                <span className="danger-action-title">Archiver le projet</span>
                <span className="danger-action-desc">Le projet sera en lecture seule et n'apparaîtra plus dans les tableaux actifs.</span>
              </div>
              <ActionBtn type="button" variant="danger" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiArchive /> Archiver
              </ActionBtn>
            </div>

            <div className="danger-action-row">
              <div className="danger-action-info">
                <span className="danger-action-title">Supprimer le projet</span>
                <span className="danger-action-desc">Toutes les données, tâches et configurations seront définitivement perdues.</span>
              </div>
              <ActionBtn type="button" variant="danger" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiTrash2 /> Supprimer
              </ActionBtn>
            </div>
          </section>

        </div>
      </div>
    </ProjectLayout>
  );
}
