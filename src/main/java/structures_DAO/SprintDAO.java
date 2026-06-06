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
        String sql = "INSERT INTO sprints(nom_sprint, objectif, date_debut, date_fin, statut, id_project) VALUES (?, ?, ?, ?, ?, ?)";
        try {
            PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql);
            ps.setString(1, sprint.getNomSprint());
            ps.setString(2, sprint.getObjectif());
            ps.setString(3, sprint.getDateDebut());
            ps.setString(4, sprint.getDateFin());
            ps.setString(5, sprint.getStatut() != null ? sprint.getStatut() : "a venir");
            ps.setInt(6, sprint.getIdProject());
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
        String sql = "UPDATE sprints SET statut = ? WHERE id_sprint = ?";
        try {
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

    public int updateSprint(Sprint sprint) {
        int nb = 0;
        DBInteraction.connect();
        String sql = "UPDATE sprints SET nom_sprint = ?, objectif = ?, date_debut = ?, date_fin = ?, statut = ? WHERE id_sprint = ?";
        try {
            PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql);
            ps.setString(1, sprint.getNomSprint());
            ps.setString(2, sprint.getObjectif());
            ps.setString(3, sprint.getDateDebut());
            ps.setString(4, sprint.getDateFin());
            ps.setString(5, sprint.getStatut());
            ps.setInt(6, sprint.getIdSprint());
            nb = ps.executeUpdate();
            ps.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        DBInteraction.disconnect();
        return nb;
    }

    public int deleteSprint(int sprintId) {
        int nb = 0;
        DBInteraction.connect();
        // First unassign all tasks from this sprint (move them back to backlog)
        String unassignSql = "UPDATE tasks SET id_sprint = NULL WHERE id_sprint = ?";
        try {
            PreparedStatement ps = DBInteraction.getConn().prepareStatement(unassignSql);
            ps.setInt(1, sprintId);
            ps.executeUpdate();
            ps.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        // Then delete the sprint
        String sql = "DELETE FROM sprints WHERE id_sprint = ?";
        try {
            PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql);
            ps.setInt(1, sprintId);
            nb = ps.executeUpdate();
            ps.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        DBInteraction.disconnect();
        return nb;
    }
}
