import { useState, useMemo } from 'react'
import { Search, UserPlus, Users, Shield, Code2, SlidersHorizontal, ChevronDown } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import s from '../../styles/Administrateur/UsersPage.module.css'
import axios from 'axios'

const INITIAL_USERS = [
  { id: 1, name: 'Alexandre Dupont', email: 'alex.dupont@minijira.io',     initials: 'AD', color: '#2563EB', role: 'DÉVELOPPEUR',   projets: 4, equipes: 2, statut: 'actif'   },
  { id: 2, name: 'Sophie Laurent',   email: 's.laurent@minijira.io',       initials: 'SL', color: '#7C3AED', role: 'DÉVELOPPEUR',   projets: 1, equipes: 1, statut: 'actif'   },
  { id: 3, name: 'Marc Chen',        email: 'm.chen@minijira.io',          initials: 'MC', color: '#059669', role: 'PRODUCT OWNER', projets: 0, equipes: 0, statut: 'inactif' },
  { id: 4, name: 'Lucas Martin',     email: 'l.martin@minijira.io',        initials: 'LM', color: '#D97706', role: 'SCRUM MASTER',  projets: 2, equipes: 3, statut: 'actif'   },
  { id: 5, name: 'Emma Moreau',      email: 'e.moreau@minijira.io',        initials: 'EM', color: '#DC2626', role: 'DÉVELOPPEUR',   projets: 3, equipes: 2, statut: 'actif'   },
  { id: 6, name: 'Thomas Bernard',   email: 't.bernard@minijira.io',       initials: 'TB', color: '#0891B2', role: 'SCRUM MASTER',  projets: 1, equipes: 1, statut: 'inactif' },
  { id: 7, name: 'Yasmine Idrissi',  email: 'y.idrissi@minijira.io',       initials: 'YI', color: '#BE185D', role: 'PRODUCT OWNER', projets: 2, equipes: 2, statut: 'actif'   },
  { id: 8, name: 'Khalid Lamachi',   email: 'khalidlamachi2005@gmail.com', initials: 'KL', color: '#1D4ED8', role: 'ADMIN',         projets: 5, equipes: 4, statut: 'actif'   },
]

const ROLES = ['Tous', 'DÉVELOPPEUR', 'SCRUM MASTER', 'PRODUCT OWNER', 'ADMIN']
const emptyForm = {
  prenom: '',
  nom: '',
  email: '',
  password: '',
  experiences: [],
  type_utilisateur: 'MEMBRE'
}

function roleBadgeClass(role) {
  if (role === 'SCRUM MASTER')  return s.roleSM
  if (role === 'PRODUCT OWNER') return s.rolePO
  if (role === 'ADMIN')         return s.roleAdmin
  return s.roleDev
}

export default function UsersPage() {
  const [users, setUsers]               = useState(INITIAL_USERS)
  const [search, setSearch]             = useState('')
  const [roleFilter, setRoleFilter]     = useState('Tous')
  const [sortBy, setSortBy]             = useState('recent')
  const [showRoleMenu, setShowRoleMenu] = useState(false)
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [showAddModal, setShowAddModal]       = useState(false)
  const [showEditModal, setShowEditModal]     = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showViewModal, setShowViewModal]     = useState(false)
  const [selectedUser, setSelectedUser]       = useState(null)
  const [form, setForm]                       = useState(emptyForm)

  const totalUsers    = users.length
  const scrumMasters  = users.filter(u => u.role === 'SCRUM MASTER').length
  const productOwners = users.filter(u => u.role === 'PRODUCT OWNER').length

  const displayed = useMemo(() => {
    let list = [...users]
    if (search.trim())         list = list.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
    if (roleFilter !== 'Tous') list = list.filter(u => u.role === roleFilter)
    if (sortBy === 'recent')   list.sort((a, b) => b.id - a.id)
    if (sortBy === 'az')       list.sort((a, b) => a.name.localeCompare(b.name))
    if (sortBy === 'projets')  list.sort((a, b) => b.projets - a.projets)
    return list
  }, [users, search, roleFilter, sortBy])

  const openAdd = () => { setForm(emptyForm); setShowAddModal(true) }

const confirmAdd = async () => {
  try {
    const response = await axios.post(
      "http://localhost:8080/Backend_PFA/AddUser",
      {
        nom: form.nom,
        prenom: form.prenom,
        email: form.email,
        password: form.password,
        experiences: form.experiences,
        type_utilisateur: form.type_utilisateur
      }
    );
    console.log(response.data);
    setShowAddModal(false);
    setForm(emptyForm);
  } catch (error) {
    console.error(error);
  }
}

  const openEdit = (user) => { setSelectedUser(user); setForm({ name: user.name, email: user.email, role: user.role, statut: user.statut }); setShowEditModal(true) }

  const confirmEdit = () => {
    setUsers(prev => prev.map(u => u.id === selectedUser.id
      ? { ...u, name: form.name, email: form.email, role: form.role, statut: form.statut, initials: form.name.split(' ').map(w => w[0]?.toUpperCase() || '').join('').slice(0, 2) }
      : u))
    setShowEditModal(false)
  }

  const openDelete = (user) => { setSelectedUser(user); setShowDeleteModal(true) }
  const confirmDelete = () => { setUsers(prev => prev.filter(u => u.id !== selectedUser.id)); setShowDeleteModal(false) }
  const openView = (user) => { setSelectedUser(user); setShowViewModal(true) }

  const dropStyle = (right = false) => ({
    position: 'absolute',
    top: 'calc(100% + 4px)',
    [right ? 'right' : 'left']: 0,
    background: 'var(--white)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-lg)',
    zIndex: 30,
    minWidth: 160,
    overflow: 'hidden',
  })

  const dropItemStyle = (active) => ({
    display: 'block', width: '100%', padding: '9px 14px', textAlign: 'left',
    fontSize: 13, border: 'none', cursor: 'pointer',
    color: active ? 'var(--blue)' : 'var(--text-dark)',
    background: active ? 'var(--blue-light)' : 'transparent',
    fontWeight: active ? 600 : 400,
  })

  return (
    <Layout activeNav="users" pageTitle="Gestion des utilisateurs">
      <div className={s.page} onClick={() => { setShowRoleMenu(false); setShowSortMenu(false) }}>

        {/* Header */}
        <div className={s.pageHeader}>
          <div>
            <h1 className={s.pageTitle}>Gestion des utilisateurs</h1>
            <p className={s.pageSubtitle}>Gérez les accès, rôles et statuts de vos collaborateurs MiniJira.</p>
          </div>
          <button className={s.btnAdd} onClick={openAdd}>
            <UserPlus size={15} /> Ajouter un utilisateur
          </button>
        </div>

        {/* Stats */}
        <div className={s.statsRow}>
          <div className={s.statCard}>
            <div className={s.statInfo}>
              <div className={s.statLabel}>Nombre total d'utilisateurs</div>
              <div className={s.statValue}>{totalUsers.toLocaleString()}</div>
            </div>
            <div className={s.statIconWrap} style={{ background: '#EFF6FF' }}>
              <Users size={22} color="#2563EB" />
            </div>
          </div>
          <div className={s.statCard}>
            <div className={s.statInfo}>
              <div className={s.statLabel}>Scrum masters</div>
              <div className={s.statValue}>{scrumMasters.toLocaleString()}</div>
            </div>
            <div className={s.statIconWrap} style={{ background: '#EFF6FF' }}>
              <Code2 size={22} color="#2563EB" />
            </div>
          </div>
          <div className={s.statCard}>
            <div className={s.statInfo}>
              <div className={s.statLabel}>Product owners</div>
              <div className={s.statValue}>{productOwners}</div>
            </div>
            <div className={s.statIconWrap} style={{ background: '#FFF0E6' }}>
              <Shield size={22} color="#C2410C" />
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className={s.toolbar}>
          <div className={s.searchBox}>
            <span className={s.searchIcon}><Search size={14} /></span>
            <input className={s.searchInput} placeholder="Recherche" value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button className={`${s.filterBtn} ${roleFilter !== 'Tous' ? s.filterBtnActive : ''}`} onClick={() => { setShowRoleMenu(v => !v); setShowSortMenu(false) }}>
              Rôle: {roleFilter} <ChevronDown size={13} />
            </button>
            {showRoleMenu && (
              <div style={dropStyle()}>
                {ROLES.map(r => (
                  <button key={r} style={dropItemStyle(roleFilter === r)} onClick={() => { setRoleFilter(r); setShowRoleMenu(false) }}>{r}</button>
                ))}
              </div>
            )}
          </div>

          <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button className={s.filterBtn} onClick={() => { setShowSortMenu(v => !v); setShowRoleMenu(false) }}>
              Trier par: {sortBy === 'recent' ? 'Récent' : sortBy === 'az' ? 'A → Z' : 'Projets'} <SlidersHorizontal size={13} />
            </button>
            {showSortMenu && (
              <div style={dropStyle(true)}>
                {[['recent','Récent'],['az','Nom A → Z'],['projets','Projets']].map(([val, label]) => (
                  <button key={val} style={dropItemStyle(sortBy === val)} onClick={() => { setSortBy(val); setShowSortMenu(false) }}>{label}</button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Rôle</th>
                <th>Nombre de projets</th>
                <th>Nombre d'équipes</th>
                <th className={s.thActions}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayed.length === 0 && (
                <tr className={s.emptyRow}><td colSpan={5}>Aucun utilisateur trouvé.</td></tr>
              )}
              {displayed.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className={s.nameCell}>
                      <div className={s.avatar} style={{ background: user.color }}>{user.initials}</div>
                      <div className={s.nameInfo}>
                        <div className={s.userName}>{user.name}</div>
                        <div className={s.userEmail}>{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`${s.roleBadge} ${roleBadgeClass(user.role)}`}>{user.role}</span>
                  </td>
                  <td className={s.countCell}>{user.projets} projet{user.projets !== 1 ? 's' : ''}</td>
                  <td className={s.countCell}>{user.equipes} équipe{user.equipes !== 1 ? 's' : ''}</td>
                  <td>
                    <div className={s.actionsCell}>
                      <button className={s.btnConsult} onClick={() => openView(user)}>Consulter</button>
                      <button className={s.btnEdit}    onClick={() => openEdit(user)}>Modifier</button>
                      <button className={s.btnDelete}  onClick={() => openDelete(user)}>Supprimer</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Consulter */}
      {showViewModal && selectedUser && (
          <div className={s.modalOverlay} onClick={() => setShowViewModal(false)}>
            <div className={s.modal} onClick={e => e.stopPropagation()}>
              <h3 className={s.modalTitle}>Profil utilisateur</h3>
              <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20, padding:'16px', background:'var(--surface)', borderRadius:'var(--radius-md)', border:'1px solid var(--border)' }}>
                <div className={s.avatar} style={{ background: selectedUser.color, width:52, height:52, fontSize:17 }}>{selectedUser.initials}</div>
                <div>
                  <div style={{ fontSize:16, fontWeight:700, color:'var(--text-dark)' }}>{selectedUser.name}</div>
                  <div style={{ fontSize:12.5, color:'var(--text-mid)', marginTop:2 }}>{selectedUser.email}</div>
                  <span className={`${s.roleBadge} ${roleBadgeClass(selectedUser.role)}`} style={{ marginTop:6, display:'inline-flex' }}>{selectedUser.role}</span>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {[['Projets', `${selectedUser.projets} projet${selectedUser.projets !== 1 ? 's' : ''}`], ['Équipes', `${selectedUser.equipes} équipe${selectedUser.equipes !== 1 ? 's' : ''}`], ['Statut', selectedUser.statut === 'actif' ? '🟢 Actif' : '⚪ Inactif']].map(([label, val]) => (
                  <div key={label} style={{ padding:'12px', background:'var(--surface)', borderRadius:'var(--radius-md)', border:'1px solid var(--border)' }}>
                    <div style={{ fontSize:11, color:'var(--text-light)', fontWeight:600, textTransform:'uppercase', marginBottom:4 }}>{label}</div>
                    <div style={{ fontSize:14, fontWeight:600, color:'var(--text-dark)' }}>{val}</div>
                  </div>
                ))}
              </div>
              <div className={s.modalActions}>
                <button className={s.btnCancel} onClick={() => setShowViewModal(false)}>Fermer</button>
                <button className={s.btnSave}   onClick={() => { setShowViewModal(false); openEdit(selectedUser) }}>Modifier</button>
              </div>
            </div>
          </div>
      )}

      {/* Modal: Ajouter */}
      {showAddModal && (
        <div className={s.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div className={s.modal} onClick={e => e.stopPropagation()}>
            <h3 className={s.modalTitle}>Ajouter un utilisateur</h3>
            <div className={s.formGrid}>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Prénom</label>
                <input className={s.formInput} value={form.prenom} placeholder='Donner le prénom' onChange={e => setForm({...form,prenom: e.target.value})}/>
              </div>

              <div className={s.formGroup}>
                <label className={s.formLabel}>Nom</label>
                <input className={s.formInput} value={form.nom} placeholder='Donner le nom' onChange={e => setForm({...form,nom: e.target.value})}/>
              </div>

              <div className={`${s.formGroup} ${s.formFull}`}>
                <label className={s.formLabel}>Adresse email</label>
                <input type="email" className={s.formInput} value={form.email} placeholder='utilisateur@entreprise.com' onChange={e => setForm({...form, email: e.target.value})}/>
              </div>

              <div className={`${s.formGroup} ${s.formFull}`}>
                <label className={s.formLabel}>Mot de passe</label>
                <input type="password" className={s.formInput} value={form.password} placeholder='Donner le mot de passe' onChange={e => setForm({...form, password: e.target.value})}/>
              </div>

              <div className={`${s.formGroup} ${s.formFull}`}>
                <label className={s.formLabel}>Type utilisateur</label>
                <select className={s.formSelect} value={form.type_utilisateur} onChange={e => setForm({...form, type_utilisateur: e.target.value})}>
                  <option value="MEMBRE">Membre</option>
                  <option value="ADMIN">Administrateur</option>
                </select>
              </div>
            </div>

            <div className={s.modalActions}>
              <button className={s.btnCancel} onClick={() => setShowAddModal(false)}>Annuler</button>
              <button className={s.btnSave} onClick={confirmAdd}>Ajouter</button>
            </div>
          </div>
        </div>
      )}
{/* Modal: Modifier */}
{showEditModal && selectedUser && (
  <div className={s.modalOverlay} onClick={() => setShowEditModal(false)}>
    <div className={s.modal} onClick={e => e.stopPropagation()}>
      <h3 className={s.modalTitle}>Modifier l'utilisateur</h3>

      <div className={s.formGrid}>

        <div className={s.formGroup}>
          <label className={s.formLabel}>Prénom</label>
          <input className={s.formInput} value={form.prenom} placeholder='Nouveau prénom' onChange={e => setForm({ ...form, prenom: e.target.value })} />
        </div>

        <div className={s.formGroup}>
          <label className={s.formLabel}>Nom</label>
          <input className={s.formInput} value={form.nom} placeholder='Nouveau nom' onChange={e => setForm({ ...form, nom: e.target.value })} />
        </div>

        <div className={`${s.formGroup} ${s.formFull}`}>
          <label className={s.formLabel}>Adresse email</label>
          <input className={s.formInput} type="email" value={form.email} placeholder='Donner le nouveau email' onChange={e => setForm({ ...form, email: e.target.value })} />
        </div>

        <div className={`${s.formGroup} ${s.formFull}`}>
          <label className={s.formLabel}>Mot de passe</label>
          <input className={s.formInput} type="password" value={form.password || ''} placeholder='Donner le nouveau password' onChange={e => setForm({ ...form, password: e.target.value })} />
        </div>

      </div>

      <div className={s.modalActions}>
        <button className={s.btnCancel} onClick={() => setShowEditModal(false)}>Annuler</button>
        <button className={s.btnSave} onClick={confirmEdit}>Enregistrer</button>
      </div>

    </div>
  </div>
)}

      {/* Modal: Supprimer */}
      {showDeleteModal && selectedUser && (
        <div className={s.modalOverlay} onClick={() => setShowDeleteModal(false)}>
          <div className={s.modal} onClick={e => e.stopPropagation()}>
            <h3 className={s.modalTitle}>Supprimer l'utilisateur</h3>
            <p className={s.deleteText}>
              Voulez-vous vraiment supprimer <strong>{selectedUser.name}</strong> ?
              Son compte et toutes ses associations seront retirés. Cette action est irréversible.
            </p>
            <div className={s.modalActions}>
              <button className={s.btnCancel}        onClick={() => setShowDeleteModal(false)}>Annuler</button>
              <button className={s.btnConfirmDelete} onClick={confirmDelete}>Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
