import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../../components/layout/Layout";
import styles from "../../styles/Search/SearchPage.module.css";
import { Search } from "lucide-react";

export default function SearchPage() {
  const [results, setResults] = useState({ tasks: [], projects: [], teams: [] });
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();
  
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get("q") || "";

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults({ tasks: [], projects: [], teams: [] });
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:8080/Backend_PFA/GlobalSearch", {
          params: { q: query },
        });
        setResults(response.data);
      } catch (error) {
        console.error("Error fetching search results:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query]);

  const handleProjectClick = (id) => {
    localStorage.setItem("selectedProjectId", id);
    navigate("/backlog");
  };

  const handleTeamClick = (id) => {
    navigate(`/detailsTeam/${id}`);
  };

  const handleTaskClick = (projectId) => {
    localStorage.setItem("selectedProjectId", projectId);
    navigate("/backlog");
  };

  return (
    <Layout activeNav="" pageTitle="Recherche">
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>
            Résultats pour "{query}"
          </h1>
          <p className={styles.pageSubtitle}>
            Recherche globale parmi les projets, équipes, et tâches (y compris stories, epics, et sub-tasks).
          </p>
        </div>

        {loading ? (
          <div className={styles.emptyState}>Chargement des résultats...</div>
        ) : (
          <>
            {!results.projects?.length && !results.teams?.length && !results.tasks?.length ? (
              <div className={styles.emptyState}>
                <Search size={40} style={{ marginBottom: 16, opacity: 0.5 }} />
                <p>Aucun résultat trouvé pour "{query}".</p>
              </div>
            ) : (
              <>
                {results.projects?.length > 0 && (
                  <div className={styles.section}>
                    <div className={styles.sectionHeader}>Projets ({results.projects.length})</div>
                    <div className={styles.list}>
                      {results.projects.map((p) => (
                        <div key={p.id} className={styles.item} onClick={() => handleProjectClick(p.id)}>
                          <div>
                            <div className={styles.itemTitle}>{p.name}</div>
                            <div className={styles.itemDesc}>Clé: {p.key}</div>
                          </div>
                          <span className={styles.itemMeta}>Projet</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {results.teams?.length > 0 && (
                  <div className={styles.section}>
                    <div className={styles.sectionHeader}>Équipes ({results.teams.length})</div>
                    <div className={styles.list}>
                      {results.teams.map((t) => (
                        <div key={t.id} className={styles.item} onClick={() => handleTeamClick(t.id)}>
                          <div>
                            <div className={styles.itemTitle}>{t.name}</div>
                            <div className={styles.itemDesc}>{t.objective}</div>
                          </div>
                          <span className={styles.itemMeta}>Équipe</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {results.tasks?.length > 0 && (
                  <div className={styles.section}>
                    <div className={styles.sectionHeader}>Tâches ({results.tasks.length})</div>
                    <div className={styles.list}>
                      {results.tasks.map((t) => (
                        <div key={t.id} className={styles.item} onClick={() => handleTaskClick(t.projectId)}>
                          <div>
                            <div className={styles.itemTitle}>{t.title}</div>
                            <div className={styles.itemDesc}>{t.description}</div>
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <span className={styles.itemMeta}>{t.type || 'Task'}</span>
                            <span className={styles.itemMeta}>{t.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
