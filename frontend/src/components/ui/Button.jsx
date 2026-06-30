import styles from '../../styles/Ui/Button.module.css'

/**
 * Bouton principal réutilisable.
 * @param {{ children: ReactNode, onClick: () => void, type?: string }} props
 */
export default function Button({ children, onClick, type = 'button' }) {
  return (
    <button
      type={type}
      className={`${styles.btn} ${styles['btn--primary']}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
