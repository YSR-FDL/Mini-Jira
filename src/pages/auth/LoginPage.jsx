import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import LeftPanel from '../../components/auth/LeftPanel';
import '../../styles/AuthLayout.css';

export default function LoginPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()

    const newErrors = {}

    if (!email.trim()) {
      newErrors.email = "L'adresse e-mail est requise"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Veuillez entrer une adresse e-mail valide'
    }

    if (!password.trim()) {
      newErrors.password = 'Le mot de passe est requis'
    } else if (password.length < 6) {
      newErrors.password = 'Minimum 6 caractères'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
  }

  return (
    <div className="authPage">
      <LeftPanel />

      <div className="rightPanel scroll">
        <div className="dotGrid" />

        <div className="formArea">

          <form onSubmit={handleSubmit} noValidate>
            <h2 className="formTitle">Bon retour</h2>
            <p className="formSubtitle">
              Connectez-vous à votre espace Mini Jira
            </p>

            <div className="fields">

              {/* Email */}
              <div className="fieldGroup">
                <label className="label">
                  Adresse e-mail professionnelle
                </label>

                <div className={`inputWrap ${errors.email ? 'hasError' : ''}`}>
                  <span className="inputIcon">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="4" width="20" height="16" rx="2"/>
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                  </span>

                  <input
                    className="input"
                    type="email"
                    placeholder="vous@entreprise.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)

                      setErrors((prev) => ({
                        ...prev,
                        email: ''
                      }))
                    }}
                  />
                </div>

                {errors.email && (
                  <p className="errorMsg">
                    <span className="errorDot" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="fieldGroup">
                <label className="label">
                  Mot de passe
                </label>

                <div className={`inputWrap ${errors.password ? 'hasError' : ''}`}>
                  <span className="inputIcon">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </span>

                  <input
                    className="input"
                    type={showPass ? 'text' : 'password'}
                    placeholder="Votre mot de passe"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)

                      setErrors((prev) => ({
                        ...prev,
                        password: ''
                      }))
                    }}
                  />

                  <button
                    type="button"
                    className="eyeBtn"
                    onClick={() => setShowPass(v => !v)}
                  >
                    {showPass ? (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                        <line x1="2" x2="22" y1="2" y2="22"/>
                      </svg>
                    ) : (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>

                {errors.password && (
                  <p className="errorMsg">
                    <span className="errorDot" />
                    {errors.password}
                  </p>
                )}
              </div>
            </div>

            {/* Submit */}
            <button type="submit" className="btn">
              Se connecter

              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>

            {/* Switch */}
            <p className="switchRow">
              Pas encore de compte ?{' '}

              <Link to="/register" className="switchLink">
                S'inscrire
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}