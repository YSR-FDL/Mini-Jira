package structures_DAO;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import classes.Sprint;
import connexion_BD.DBInteraction;

public class SprintDAO {

    public int addSprint(Sprint sprint) {
        int nb = 0;
        DBInteraction.connect();
        String sql = "INSERT INTO sprints(nom_sprint, objectif, date_debut, date_fin, statut, capacite, id_project) VALUES (?, ?, ?, ?, ?, ?, ?)";
        try {
            PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql);
            ps.setString(1, sprint.getNomSprint());
            ps.setString(2, sprint.getObjectif());
            ps.setString(3, sprint.getDateDebut());
            ps.setString(4, sprint.getDateFin());
            ps.setString(5, sprint.getStatut() != null ? sprint.getStatut() : "a venir");
            if (sprint.getCapacite() != null) {
                ps.setInt(6, sprint.getCapacite());
            } else {
                ps.setNull(6, java.sql.Types.INTEGER);
            }
            ps.setInt(7, sprint.getIdProject());
            nb = ps.executeUpdate();
            ps.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        DBInteraction.disconnect();
        return nb;
    }

    public List<Sprint> getProjectSprints(int projectId) {
        List<Sprint> sprints = new ArrayList<>();
        DBInteraction.connect();
        String sql = "SELECT * FROM sprints WHERE id_project = ? ORDER BY date_debut ASC";
        try {
            PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql);
            ps.setInt(1, projectId);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                Sprint sprint = new Sprint();
                sprint.setIdSprint(rs.getInt("id_sprint"));
                sprint.setNomSprint(rs.getString("nom_sprint"));
                sprint.setObjectif(rs.getString("objectif"));
                sprint.setDateDebut(rs.getString("date_debut"));
                sprint.setDateFin(rs.getString("date_fin"));
                sprint.setStatut(rs.getString("statut"));
                int cap = rs.getInt("capacite");
                sprint.setCapacite(rs.wasNull() ? null : cap);
                sprint.setIdProject(rs.getInt("id_project"));
                sprints.add(sprint);
            }
            rs.close();
            ps.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        DBInteraction.disconnect();
        return sprints;
    }

    public int updateSprintStatus(int sprintId, String status) {
        int nb = 0;
        DBInteraction.connect();
        try {
            // Enforce a single active sprint per project.
            if ("actif".equalsIgnoreCase(status)) {
                String checkSql =
                    "SELECT COUNT(*) AS cnt FROM sprints WHERE statut = 'actif' " +
                    "AND id_project = (SELECT id_project FROM sprints WHERE id_sprint = ?) " +
                    "AND id_sprint <> ?";
                PreparedStatement check = DBInteraction.getConn().prepareStatement(checkSql);
                check.setInt(1, sprintId);
                check.setInt(2, sprintId);
                ResultSet rs = check.executeQuery();
                boolean conflict = rs.next() && rs.getInt("cnt") > 0;
                rs.close();
                check.close();
                if (conflict) {
                    DBInteraction.disconnect();
                    return -1; // signals "another sprint is already active"
                }
            }

            String sql = "UPDATE sprints SET statut = ? WHERE id_sprint = ?";
            PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql);
            ps.setString(1, status);
            ps.setInt(2, sprintId);
            nb = ps.executeUpdate();
            ps.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        DBInteraction.disconnect();
        return nb;
    }

    /**
     * Charge un sprint par son identifiant, ou null s'il est introuvable.
     * Utilisé pour les contrôles RBAC au niveau champ (ex. édition de l'objectif).
     */
    public Sprint getSprintById(int sprintId) {
        Sprint sprint = null;
        DBInteraction.connect();
        String sql = "SELECT * FROM sprints WHERE id_sprint = ?";
        try {
            PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql);
            ps.setInt(1, sprintId);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                sprint = new Sprint();
                sprint.setIdSprint(rs.getInt("id_sprint"));
                sprint.setNomSprint(rs.getString("nom_sprint"));
                sprint.setObjectif(rs.getString("objectif"));
                sprint.setDateDebut(rs.getString("date_debut"));
                sprint.setDateFin(rs.getString("date_fin"));
                sprint.setStatut(rs.getString("statut"));
                int cap = rs.getInt("capacite");
                sprint.setCapacite(rs.wasNull() ? null : cap);
                sprint.setIdProject(rs.getInt("id_project"));
            }
            rs.close();
            ps.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        DBInteraction.disconnect();
        return sprint;
    }

    public int updateSprint(Sprint sprint) {        int nb = 0;
        DBInteraction.connect();
        String sql = "UPDATE sprints SET nom_sprint = ?, objectif = ?, date_debut = ?, date_fin = ?, statut = ?, capacite = ? WHERE id_sprint = ?";
        try {
            PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql);
            ps.setString(1, sprint.getNomSprint());
            ps.setString(2, sprint.getObjectif());
            ps.setString(3, sprint.getDateDebut());
            ps.setString(4, sprint.getDateFin());
            ps.setString(5, sprint.getStatut());
            if (sprint.getCapacite() != null) {
                ps.setInt(6, sprint.getCapacite());
            } else {
                ps.setNull(6, java.sql.Types.INTEGER);
            }
            ps.setInt(7, sprint.getIdSprint());
            nb = ps.executeUpdate();
            ps.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        DBInteraction.disconnect();
        return nb;
    }

    /**
     * Returns the project id that owns a sprint, or 0 if the sprint is unknown.
     * Used for RBAC checks that only receive a sprintId.
     */
    public int getProjectIdBySprint(int sprintId) {
        int projectId = 0;
        DBInteraction.connect();
        String sql = "SELECT id_project FROM sprints WHERE id_sprint = ?";
        try {
            PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql);
            ps.setInt(1, sprintId);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                projectId = rs.getInt("id_project");
            }
            rs.close();
            ps.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        DBInteraction.disconnect();
        return projectId;
    }

    public int deleteSprint(int sprintId) {
        int nb = 0;
        DBInteraction.connect();
        try {
            DBInteraction.getConn().setAutoCommit(false);

            // First unassign all tasks from this sprint (move them back to backlog)
            String unassignSql = "UPDATE tasks SET id_sprint = NULL WHERE id_sprint = ?";
            PreparedStatement psUnassign = DBInteraction.getConn().prepareStatement(unassignSql);
            psUnassign.setInt(1, sprintId);
            psUnassign.executeUpdate();
            psUnassign.close();

            // Then delete the sprint
            String sql = "DELETE FROM sprints WHERE id_sprint = ?";
            PreparedStatement psDelete = DBInteraction.getConn().prepareStatement(sql);
            psDelete.setInt(1, sprintId);
            nb = psDelete.executeUpdate();
            psDelete.close();

            DBInteraction.getConn().commit();
        } catch (SQLException e) {
            try {
                DBInteraction.getConn().rollback();
            } catch (SQLException rollbackEx) {
                rollbackEx.printStackTrace();
            }
            e.printStackTrace();
        } finally {
            try {
                DBInteraction.getConn().setAutoCommit(true);
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
        DBInteraction.disconnect();
        return nb;
    }
}
