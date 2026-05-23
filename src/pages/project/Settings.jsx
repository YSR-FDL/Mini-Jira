import React, { useState } from 'react';
import ProjectLayout from '../../components/layout/ProjectLayout';
import WaveInput from '../../components/ui/WaveInput';
import ActionBtn from '../../components/ui/ActionBtn';
import { projectService } from '../../services/projectService';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('settings');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  // État local avec les informations du projet
  const [projectInfo, setProjectInfo] = useState({
    name: 'Mini-Jira',
    key: 'MJ',
    description: 'A minimalist project management tool',
    manager: 'Yasser',
  });

  const handleInputChange = (field, value) => {
    setProjectInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');
    
    try {
      await projectService.updateProject(projectInfo);
      setMessage('Modifications enregistrées avec succès.');
    } catch (error) {
      setMessage('Erreur lors de l\'enregistrement.');
      console.error(error);
    } finally {
      setIsSaving(false);
      // Effacer le message de succès après 3 secondes
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <ProjectLayout activeTab={activeTab} onTabChange={setActiveTab} projectName={projectInfo.name}>
      <div style={{ padding: '40px 24px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ maxWidth: '600px', width: '100%', backgroundColor: 'var(--color-background-primary)', padding: '32px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid var(--color-border-secondary)' }}>
          <h2 style={{ marginBottom: '8px', color: 'var(--color-text-primary)' }}>Paramètres du Projet</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '32px', fontSize: '14px' }}>
            Modifiez les informations générales de votre projet. Ces paramètres seront visibles par tous les membres de l'équipe.
          </p>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <WaveInput
              label="Nom du projet"
              value={projectInfo.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required={true}
            />

            <WaveInput
              label="Clé du projet"
              value={projectInfo.key}
              onChange={(e) => handleInputChange('key', e.target.value)}
              required={true}
            />

            <WaveInput
              label="Chef de projet"
              value={projectInfo.manager}
              onChange={(e) => handleInputChange('manager', e.target.value)}
              required={true}
            />

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--color-text-tertiary)', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase' }}>Description</label>
              <textarea
                value={projectInfo.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '4px',
                  border: '1px solid var(--color-border-secondary)',
                  backgroundColor: 'transparent',
                  color: 'var(--color-text-primary)',
                  fontSize: '14px',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '16px', marginTop: '16px' }}>
              <ActionBtn type="submit" variant="primary">
                {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </ActionBtn>
              
              {message && (
                <span style={{ color: 'var(--color-success-green)', fontSize: '14px', fontWeight: '500' }}>
                  {message}
                </span>
              )}
            </div>
          </form>
        </div>
      </div>
    </ProjectLayout>
  );
}
