package structures_DAO;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import connexion_BD.DBInteraction;
import utils.AssigneeHelper;

public class ActivityDAO {

    private static final String ACTIVITY_SELECT =
        "SELECT a.*, u.nom AS nom_auteur, u.prenom AS prenom_auteur, t.titre AS task_title, t.type_tache " +
        "FROM task_activities a " +
        "JOIN utilisateurs u ON a.id_user = u.id " +
        "JOIN tasks t ON a.id_task = t.id_task ";

    private Map<String, Object> buildActivityMap(ResultSet rs) throws SQLException {
        Map<String, Object> map = new HashMap<>();
        map.put("id", rs.getInt("id"));
        map.put("taskId", rs.getInt("id_task"));
        map.put("projectId", rs.getInt("id_project"));
        map.put("actionType", rs.getString("action_type"));
        map.put("oldValue", rs.getString("old_value"));
        map.put("newValue", rs.getString("new_value"));
        map.put("dateCreation", rs.getString("date_creation"));
        map.put("taskTitle", rs.getString("task_title"));
        map.put("taskType", rs.getString("type_tache"));

        int auteurId = rs.getInt("id_user");
        String prenom = rs.getString("prenom_auteur");
        String nom = rs.getString("nom_auteur");
        map.put("user", AssigneeHelper.buildAssigneeMap(auteurId, prenom, nom));
        
        return map;
    }

    public void logActivity(int taskId, int projectId, int userId, String actionType, String oldValue, String newValue) {
        // Run in its own try block and don't enforce standalone DB connect/disconnect if it's part of a transaction,
        // but since MiniJira uses auto-commit mostly, we'll just connect/disconnect.
        // Wait, if it's called inside another DAO method, connect() won't hurt because CONNECTION is a ThreadLocal.
        DBInteraction.connect();
        String sql = "INSERT INTO task_activities(id_task, id_project, id_user, action_type, old_value, new_value) VALUES (?, ?, ?, ?, ?, ?)";
        try {
            PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql);
            ps.setInt(1, taskId);
            ps.setInt(2, projectId);
            ps.setInt(3, userId);
            ps.setString(4, actionType);
            
            if (oldValue != null) ps.setString(5, oldValue);
            else ps.setNull(5, java.sql.Types.VARCHAR);
            
            if (newValue != null) ps.setString(6, newValue);
            else ps.setNull(6, java.sql.Types.VARCHAR);
            
            ps.executeUpdate();
            ps.close();

            try (java.io.PrintWriter out = new java.io.PrintWriter(new java.io.FileWriter("../logs/project_activities.log", true))) {
                String timestamp = new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new java.util.Date());
                out.printf("[%s] Project %d | Task %d | User %d | Action: %s | Old: %s | New: %s%n",
                           timestamp, projectId, taskId, userId, actionType, oldValue, newValue);
            } catch (java.io.IOException e) {
                System.err.println("Failed to write to activity log file");
                e.printStackTrace();
            }

        } catch (SQLException e) {
            System.err.println("Failed to log activity: " + actionType);
            e.printStackTrace();
        }
        // Notice: not calling disconnect() here so we don't accidentally close the parent request's connection.
    }

    public List<Map<String, Object>> getProjectActivities(int projectId, int limit) {
        List<Map<String, Object>> activities = new ArrayList<>();
        DBInteraction.connect();
        String sql = ACTIVITY_SELECT + "WHERE a.id_project = ? ORDER BY a.date_creation DESC LIMIT ?";
        try {
            PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql);
            ps.setInt(1, projectId);
            ps.setInt(2, limit);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                activities.add(buildActivityMap(rs));
            }
            rs.close();
            ps.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        DBInteraction.disconnect();
        return activities;
    }

    public List<Map<String, Object>> getTaskActivities(int taskId) {
        List<Map<String, Object>> activities = new ArrayList<>();
        DBInteraction.connect();
        String sql = ACTIVITY_SELECT + "WHERE a.id_task = ? ORDER BY a.date_creation DESC";
        try {
            PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql);
            ps.setInt(1, taskId);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                activities.add(buildActivityMap(rs));
            }
            rs.close();
            ps.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        DBInteraction.disconnect();
        return activities;
    }
}
