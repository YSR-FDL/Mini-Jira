import React from "react";
import styles from "../../styles/teams/TeamMemberCard.module.css";

const iconEye = (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const iconRemove = (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="23" y1="11" x2="17" y2="11" />
  </svg>
);
const iconMail = (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

export default function TeamMemberCard({ member, onViewProfile, onRemove }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardTop}>
        <div className={styles.avatar} style={{ background: "var(--blue)" }}>
          {`${member?.prenom?.charAt(0) || ""}${member?.nom?.charAt(0) || ""}`.toUpperCase()}
        </div>

        <div className={styles.memberInfo}>
          <span className={styles.memberName}>
            {member.nom} {member.prenom}
          </span>
          <span className={styles.memberRole}>{member.login}</span>
        </div>
      </div>

      <div className={styles.emailRow}>
        {iconMail}
        <span>{member.email}</span>
      </div>

      <div className={styles.cardActions}>
        <button
          className={styles.btnProfile}
          onClick={() => onViewProfile && onViewProfile(member)}
        >
          {iconEye} Voir profil
        </button>
        <button
          className={styles.btnRemove}
          onClick={() => onRemove && onRemove(member)}
        >
          {iconRemove} Retirer
        </button>
      </div>
    </div>
  );
}
