import { useState, useMemo, useEffect } from 'react'
import { Search, UserPlus, Users, Shield, Code2, SlidersHorizontal, ChevronDown } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import s from '../../styles/Administrateur/UsersPage.module.css'
import axios from 'axios'

const rolesLabels = {
  scrum: "Scrum Master",
  po: "Product Owner",
  dev: "Développeur",
  designer: "Designer",
  tester: "Testeur"
}

const ROLES = [  'Tous','scrum','po','dev','designer','tester']
const emptyForm = {
  prenom: '',
  nom: '',
  email: '',
  password: '',
  experiences: [],
  type_utilisateur: 'MEMBRE'
}


export default function UsersPage() {
  const [users, setUsers]               = useState([])
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
  const scrumMasters  = users.filter(u => u.experiences?.includes('scrum')).length
  const productOwners = users.filter(u => u.experiences?.includes('po')).length
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => {setToast("");}, 2800);
  };


  useEffect(() => {loadUsers()}, [])
  const loadUsers = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/Backend_PFA/GetAllUsers"
      )
      const formattedUsers = response.data.map(user => ({
        id: user.id,
        name: `${user.prenom} ${user.nom}`,
        prenom: user.prenom,
        nom: user.nom,
        email: user.email,
        experiences: user.experiences || [],
        type_utilisateur: user.type_utilisateur,
        initials: `${user.prenom?.charAt(0) || ''}${user.nom?.charAt(0) || ''}`,
        color: '#2563EB',
        projets: 0,
        equipes: 0,
      }))

      setUsers(formattedUsers)

    } catch (error) {
      console.error(error)
    }
  }

  const displayed = useMemo(() => {
    let list = [...users]
    if (search.trim())         list = list.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
    if (roleFilter !== 'Tous') list = list.filter( u => u.experiences?.includes(roleFilter))
    if (sortBy === 'recent')   list.sort((a, b) => b.id - a.id)
    if (sortBy === 'az')       list.sort((a, b) => a.name.localeCompare(b.name))
    if (sortBy === 'projets')  list.sort((a, b) => b.projets - a.projets)
    return list
  }, [users, search, roleFilter, sortBy])

  const openAdd = () => { setForm(emptyForm); setShowAddModal(true) }

const confirmAdd = async () => {
  try {
    const response = await axios.post(
      "http://localhost:8080/AddUser",
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
    await loadUsers();
    showToast("Utilisateur ajouté avec succès!");
    setShowAddModal(false);
    setForm(emptyForm);
  } catch (error) {
    console.error(error);
    showToast("Erreur lors de l'ajout de l'utilisateur!");
  }
}

  const openEdit = (user) => {
    setSelectedUser(user)
    setEditNoChange(false)
    setForm({
      prenom: user.prenom,
      nom: user.nom,
      email: user.email,
      experiences: user.experiences || [],
      password: ''
    })
    setShowEditModal(true)
  }

  const [editNoChange, setEditNoChange] = useState(false)

  const hasChanged = selectedUser && (
    form.prenom !== (selectedUser.prenom || '') ||
    form.nom    !== (selectedUser.nom    || '') ||
    form.email  !== (selectedUser.email  || '') ||
    form.password !== '' ||
    JSON.stringify([...form.experiences].sort()) !== JSON.stringify([...(selectedUser.experiences || [])].sort())
  )

  const confirmEdit = async () => {
    if (!hasChanged) {
      setEditNoChange(true)
      return
    }
    setEditNoChange(false)
    try {
      await axios.post(
        "http://localhost:8080/Backend_PFA/UpdateUser",
        {
          id: selectedUser.id,
          nom: form.nom,
          prenom: form.prenom,
          email: form.email,
          experiences: form.experiences
        }
      )
      await loadUsers()
      showToast("Modifications enregistrées avec succès!")
      setShowEditModal(false)
    } catch (error) {
      console.error(error)
      showToast("Erreur lors de la modifications!")
    }
  }

  const openDelete = (user) => { setSelectedUser(user); setShowDeleteModal(true) }
  const confirmDelete = async () => {
    try {
      await axios.post(
        "http://localhost:8080/Backend_PFA/DeleteAccount",
        {
          id: selectedUser.id
        }
      )
      await loadUsers()
      showToast("Utilisateur supprimé avec succès!")
      setShowDeleteModal(false)
    } catch (error) {
      console.error(error)
      showToast("Erreur lors de la suppression!")
    }
  }
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
                <button key={r} style={dropItemStyle(roleFilter === r)} onClick={() => {
                    setRoleFilter(r)
                    setShowRoleMenu(false)
                  }}>
                  {r === 'Tous' ? 'Tous' : rolesLabels[r]}
                </button>
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
                <th>Expériences</th>
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
                    {user.experiences?.length > 0 ? user.experiences.map(exp => rolesLabels[exp] || exp).join(", ") : "Aucune expérience"}
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

            {/* Header identité */}
            <div className={s.viewHeader}>
              <div className={s.viewAvatar} style={{ background: selectedUser.color }}>
                {selectedUser.initials}
              </div>
              <div className={s.viewIdentity}>
                <div className={s.viewName}>{selectedUser.name}</div>
                <div className={s.viewEmail}>{selectedUser.email}</div>
                <div className={s.viewTypeBadge}>{selectedUser.type_utilisateur === 'ADMIN' ? 'Administrateur' : 'Membre'}</div>
              </div>
            </div>

            {/* Expériences */}
            <div className={s.viewSection}>
              <div className={s.viewSectionLabel}>Expériences</div>
              <div className={s.viewChips}>
                {selectedUser.experiences?.length > 0
                  ? selectedUser.experiences.map(exp => (
                      <span key={exp} className={s.viewChip}>{rolesLabels[exp] || exp}</span>
                    ))
                  : <span className={s.viewEmpty}>Aucune expérience renseignée</span>
                }
              </div>
            </div>

            {/* Stats */}
            <div className={s.viewStats}>
              {[['Projets', selectedUser.projets, 'projet'], ['Équipes', selectedUser.equipes, 'équipe']].map(([label, val, unit]) => (
                <div key={label} className={s.viewStatCard}>
                  <div className={s.viewStatValue}>{val}</div>
                  <div className={s.viewStatLabel}>{val !== 1 ? unit + 's' : unit}</div>
                </div>
              ))}
            </div>

            <div className={s.modalActions}>
              <button className={s.btnCancel} onClick={() => setShowViewModal(false)}>Fermer</button>
              <button className={s.btnSave} onClick={() => { setShowViewModal(false); openEdit(selectedUser) }}>Modifier</button>
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
                <label className={s.formLabel}>Expériences</label>
                <div className={s.checkGrid}>
                  {Object.entries(rolesLabels).map(([value, label]) => (
                    <label key={value} className={s.checkRow}>
                      <input
                        type="checkbox"
                        className={s.checkInput}
                        checked={form.experiences.includes(value)}
                        onChange={(e) => setForm({
                          ...form,
                          experiences: e.target.checked
                            ? [...form.experiences, value]
                            : form.experiences.filter(exp => exp !== value)
                        })}
                      />
                      <span className={s.checkLabel}>{label}</span>
                    </label>
                  ))}
                </div>
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

      {/* Header identité */}
      <div className={s.editHeader}>
        <div className={s.avatar} style={{ background: selectedUser.color, width:40, height:40, fontSize:14 }}>
          {selectedUser.initials}
        </div>
        <div>
          <h3 className={s.modalTitle} style={{ marginBottom:2 }}>Modifier l'utilisateur</h3>
          <div style={{ fontSize:12.5, color:'var(--text-mid)' }}>{selectedUser.email}</div>
        </div>
      </div>

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
          <input className={s.formInput} type="password" value={form.password || ''} placeholder='Laisser vide pour ne pas changer' onChange={e => setForm({ ...form, password: e.target.value })} />
        </div>

        <div className={`${s.formGroup} ${s.formFull}`}>
          <label className={s.formLabel}>Expériences</label>
          <div className={s.checkGrid}>
            {Object.entries(rolesLabels).map(([value, label]) => (
              <label key={value} className={s.checkRow}>
                <input
                  type="checkbox"
                  className={s.checkInput}
                  checked={form.experiences.includes(value)}
                  onChange={(e) => setForm({
                    ...form,
                    experiences: e.target.checked
                      ? [...form.experiences, value]
                      : form.experiences.filter(exp => exp !== value)
                  })}
                />
                <span className={s.checkLabel}>{label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {editNoChange && (
        <div className={s.noChangeMsg}>
          Aucune modification détectée.
        </div>
      )}
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
      {toast && (
          <div className={`${s.toast} ${toast === "Erreur lors de l'ajout de l'utilisateur!" || 
          toast === "Erreur lors de la modifications!" || toast === "Erreur lors de la suppression!" ? s.toastError : ""}`}>
            {toast}
          </div>
      )}
    </Layout>
  )
}
