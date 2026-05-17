import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import LeftPanel from './LeftPanel'
import '../../styles/AuthLayout.css'

const ROLES = [
  { id: 'scrum',    label: 'Scrum Master',  color: '#6554C0' },
  { id: 'po',       label: 'Product Owner', color: '#FF5630' },
  { id: 'dev',      label: 'Developer',     color: '#0052CC' },
  { id: 'designer', label: 'Designer',      color: '#00B8D9' },
  { id: 'tester',   label: 'Tester',        color: '#00875A' },
]

export default function RegisterPage() {
  const navigate = useNavigate()

  // ── State ──────────────────────────────────────────────────
  const [userId,          setUserId]          = useState('')
  const [firstName,       setFirstName]       = useState('')
  const [lastName,        setLastName]        = useState('')
  const [email,           setEmail]           = useState('')
  const [password,        setPassword]        = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [selectedRoles,   setSelectedRoles]   = useState([])
  const [errors,          setErrors]          = useState({})
  const [showPass,        setShowPass]        = useState(false)
  const [showConfirm,     setShowConfirm]     = useState(false)
  const [success,         setSuccess]         = useState(false)

  // ── Toggle rôle ────────────────────────────────────────────
  const toggleRole = (id) => {
    setSelectedRoles(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    )
    setErrors(prev => ({ ...prev, roles: '' }))
  }

  // ── Effacer erreur d'un champ au changement ────────────────
  const clearError = (field) => setErrors(prev => ({ ...prev, [field]: '' }))

  // ── Validation & submit ────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault()

    const newErrors = {}

    if (!userId.trim())
      newErrors.userId = "L'identifiant est requis"

    if (!firstName.trim())
      newErrors.firstName = 'Le prénom est requis'

    if (!lastName.trim())
      newErrors.lastName = 'Le nom de famille est requis'

    if (!email.trim())
      newErrors.email = "L'adresse e-mail est requise"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = 'Veuillez entrer une adresse e-mail valide'

    if (!password.trim())
      newErrors.password = 'Le mot de passe est requis'
    else if (password.length < 6)
      newErrors.password = 'Minimum 6 caractères'

    if (!confirmPassword.trim())
      newErrors.confirmPassword = 'Veuillez confirmer votre mot de passe'
    else if (password !== confirmPassword)
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas'

    if (selectedRoles.length === 0)
      newErrors.roles = 'Sélectionnez au moins un rôle'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setSuccess(true)
  }

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="authPage">
      <LeftPanel />

      <div className="rightPanel scroll">
        <div className="dotGrid" />

        <div className="formArea">

          {success ? (
            /* ── Succès ── */
            <div className="success">
              <div className="successCircle">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                  stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5"/>
                </svg>
              </div>
              <h2 className="successTitle">Compte créé !</h2>
              <p className="successMsg">Votre compte est prêt. Vous pouvez maintenant vous connecter.</p>
              <button className="btn" onClick={() => navigate('/login')}>
                Aller à la connexion
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>

          ) : (
            /* ── Formulaire ── */
            <form onSubmit={handleSubmit} noValidate>
              <h2 className="formTitle">Créer un compte</h2>
              <p className="formSubtitle">Rejoignez votre équipe sur Mini Jira</p>

              <div className="fields">

                {/* Prénom */}
                <div className="fieldGroup">
                  <label className="label">Prénom</label>
                  <div className={`inputWrap ${errors.firstName ? 'hasError' : ''}`}>
                    <span className="inputIcon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/>
                      </svg>
                    </span>
                    <input
                      className="input" type="text" placeholder="Votre prénom"
                      value={firstName}
                      onChange={e => { setFirstName(e.target.value); clearError('firstName') }}
                    />
                  </div>
                  {errors.firstName && <p className="errorMsg"><span className="errorDot"/>{errors.firstName}</p>}
                </div>

                {/* Nom */}
                <div className="fieldGroup">
                  <label className="label">Nom de famille</label>
                  <div className={`inputWrap ${errors.lastName ? 'hasError' : ''}`}>
                    <span className="inputIcon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/>
                      </svg>
                    </span>
                    <input
                      className="input" type="text" placeholder="Votre nom"
                      value={lastName}
                      onChange={e => { setLastName(e.target.value); clearError('lastName') }}
                    />
                  </div>
                  {errors.lastName && <p className="errorMsg"><span className="errorDot"/>{errors.lastName}</p>}
                </div>

                {/* Email */}
                <div className="fieldGroup">
                  <label className="label">Adresse e-mail professionnelle</label>
                  <div className={`inputWrap ${errors.email ? 'hasError' : ''}`}>
                    <span className="inputIcon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="4" width="20" height="16" rx="2"/>
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                      </svg>
                    </span>
                    <input
                      className="input" type="email" placeholder="vous@entreprise.com"
                      value={email}
                      onChange={e => { setEmail(e.target.value); clearError('email') }}
                    />
                  </div>
                  {errors.email && <p className="errorMsg"><span className="errorDot"/>{errors.email}</p>}
                </div>

                {/* Mot de passe */}
                <div className="fieldGroup">
                  <label className="label">Mot de passe</label>
                  <div className={`inputWrap ${errors.password ? 'hasError' : ''}`}>
                    <span className="inputIcon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    </span>
                    <input
                      className="input"
                      type={showPass ? 'text' : 'password'}
                      placeholder="Minimum 6 caractères"
                      value={password}
                      onChange={e => { setPassword(e.target.value); clearError('password') }}
                    />
                    <button type="button" className="eyeBtn" onClick={() => setShowPass(v => !v)}>
                      {showPass ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                          <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                          <line x1="2" x2="22" y1="2" y2="22"/>
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.password && <p className="errorMsg"><span className="errorDot"/>{errors.password}</p>}
                </div>

                {/* Confirmer mot de passe */}
                <div className="fieldGroup">
                  <label className="label">Confirmer le mot de passe</label>
                  <div className={`inputWrap ${errors.confirmPassword ? 'hasError' : ''}`}>
                    <span className="inputIcon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      </svg>
                    </span>
                    <input
                      className="input"
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Répétez votre mot de passe"
                      value={confirmPassword}
                      onChange={e => { setConfirmPassword(e.target.value); clearError('confirmPassword') }}
                    />
                    <button type="button" className="eyeBtn" onClick={() => setShowConfirm(v => !v)}>
                      {showConfirm ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                          <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                          <line x1="2" x2="22" y1="2" y2="22"/>
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="errorMsg"><span className="errorDot"/>{errors.confirmPassword}</p>}
                </div>

                {/* Rôles */}
                <div className="fieldGroup">
                  <p className="rolesTitle">Quels sont les rôle(s) que vous avez déjà occuper?</p>
                  <div className="rolesGrid">
                    {ROLES.map(role => {
                      const checked = selectedRoles.includes(role.id)
                      return (
                        <label
                          key={role.id}
                          className="roleLabel"
                          style={checked ? {
                            borderColor: role.color,
                            background: `${role.color}18`,
                          } : {}}
                        >
                          <div
                            className="roleBox"
                            style={checked ? {
                              background: role.color,
                              borderColor: role.color,
                            } : {}}
                          >
                            {checked && (
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                                stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 6 9 17l-5-5"/>
                              </svg>
                            )}
                          </div>
                          <span
                            className="roleText"
                            style={checked ? { color: role.color, fontWeight: 500 } : {}}
                          >
                            {role.label}
                          </span>
                          <input type="checkbox" onChange={() => toggleRole(role.id)} checked={checked} />
                        </label>
                      )
                    })}
                  </div>
                  {errors.roles && <p className="errorMsg"><span className="errorDot"/>{errors.roles}</p>}
                </div>

              </div>{/* end .fields */}

              {/* Bouton */}
              <button type="submit" className="btn">
                Créer mon compte
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>

              {/* Switch */}
              <p className="switchRow">
                Déjà un compte ?{' '}
                <Link to="/login" className="switchLink">Se connecter</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
