package structures_DAO;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import connexion_BD.DBInteraction;

public class MetricsDAO {

    public Map<String, Object> getProjectMetrics(int projectId) {
        Map<String, Object> metrics = new HashMap<>();
        DBInteraction.connect();
        String sql = "SELECT " +
            "COUNT(*) AS total, " +
            "SUM(CASE WHEN statut = 'done' THEN 1 ELSE 0 END) AS completed, " +
            "SUM(CASE WHEN statut = 'in-progress' THEN 1 ELSE 0 END) AS inProgress, " +
            "SUM(CASE WHEN statut = 'review' THEN 1 ELSE 0 END) AS review " +
            "FROM tasks WHERE id_project = ?";
        try {
            PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql);
            ps.setInt(1, projectId);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                metrics.put("totalIssues", rs.getInt("total"));
                metrics.put("completed", rs.getInt("completed"));
                metrics.put("inProgress", rs.getInt("inProgress"));
                // overdue = total - completed - inProgress - review (rough approximation)
                int total = rs.getInt("total");
                int completed = rs.getInt("completed");
                int inProgress = rs.getInt("inProgress");
                int review = rs.getInt("review");
                int todo = total - completed - inProgress - review;
                metrics.put("todo", todo);
                metrics.put("overdue", 0); 
            }
            rs.close();
            ps.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        DBInteraction.disconnect();
        return metrics;
    }

    public Map<String, Object> getSprintProgress(int sprintId) {
        Map<String, Object> progress = new HashMap<>();
        DBInteraction.connect();
        String sql = "SELECT " +
            "COUNT(*) AS total, " +
            "SUM(CASE WHEN statut = 'done' THEN 1 ELSE 0 END) AS completed, " +
            "SUM(CASE WHEN statut = 'todo' THEN 1 ELSE 0 END) AS todo, " +
            "SUM(CASE WHEN statut = 'in-progress' THEN 1 ELSE 0 END) AS inProgress, " +
            "SUM(CASE WHEN statut = 'review' THEN 1 ELSE 0 END) AS review, " +
            "COALESCE(SUM(story_points), 0) AS totalPoints, " +
            "COALESCE(SUM(CASE WHEN statut = 'done' THEN story_points ELSE 0 END), 0) AS completedPoints " +
            "FROM tasks WHERE id_sprint = ?";
        try {
            PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql);
            ps.setInt(1, sprintId);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                progress.put("totalIssues", rs.getInt("total"));
                progress.put("totalCompleted", rs.getInt("completed"));
                progress.put("totalPoints", rs.getInt("totalPoints"));
                progress.put("completedPoints", rs.getInt("completedPoints"));

                Map<String, Integer> distribution = new HashMap<>();
                distribution.put("todo", rs.getInt("todo"));
                distribution.put("inProgress", rs.getInt("inProgress"));
                distribution.put("review", rs.getInt("review"));
                distribution.put("done", rs.getInt("completed"));
                progress.put("distribution", distribution);
            }
            rs.close();
            ps.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        DBInteraction.disconnect();
        return progress;
    }

    public List<Map<String, Object>> getTypeBreakdown(int projectId) {
        List<Map<String, Object>> breakdown = new ArrayList<>();
        DBInteraction.connect();
        String sql = "SELECT COALESCE(type_tache, 'Feature') AS type_tache, COUNT(*) AS count " +
                     "FROM tasks WHERE id_project = ? GROUP BY type_tache ORDER BY count DESC";
        try {
            PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql);
            ps.setInt(1, projectId);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                Map<String, Object> item = new HashMap<>();
                item.put("type", rs.getString("type_tache"));
                item.put("count", rs.getInt("count"));
                item.put("color", getTypeColor(rs.getString("type_tache")));
                breakdown.add(item);
            }
            rs.close();
            ps.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        DBInteraction.disconnect();
        return breakdown;
    }

    public List<Map<String, Object>> getPriorityBreakdown(int projectId) {
        List<Map<String, Object>> breakdown = new ArrayList<>();
        DBInteraction.connect();
        String sql = "SELECT COALESCE(priorite, 'medium') AS priorite, COUNT(*) AS count " +
                     "FROM tasks WHERE id_project = ? GROUP BY priorite ORDER BY count DESC";
        try {
            PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql);
            ps.setInt(1, projectId);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                Map<String, Object> item = new HashMap<>();
                item.put("priority", rs.getString("priorite"));
                item.put("count", rs.getInt("count"));
                item.put("color", getPriorityColor(rs.getString("priorite")));
                breakdown.add(item);
            }
            rs.close();
            ps.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        DBInteraction.disconnect();
        return breakdown;
    }

    public List<Map<String, Object>> getAssigneeWorkload(int projectId) {
        List<Map<String, Object>> workload = new ArrayList<>();
        DBInteraction.connect();
        String sql = "SELECT u.prenom, u.nom, COUNT(t.id_task) AS taskCount " +
                     "FROM tasks t JOIN utilisateurs u ON t.id_assignee = u.id " +
                     "WHERE t.id_project = ? GROUP BY u.id, u.prenom, u.nom ORDER BY taskCount DESC";
        try {
            PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql);
            ps.setInt(1, projectId);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                Map<String, Object> item = new HashMap<>();
                String fullName = (rs.getString("prenom") + " " + rs.getString("nom")).trim();
                item.put("name", fullName);
                item.put("taskCount", rs.getInt("taskCount"));
                workload.add(item);
            }
            rs.close();
            ps.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        DBInteraction.disconnect();
        return workload;
    }

    private String getTypeColor(String type) {
        if (type == null) return "#3b82f6";
        switch (type.toLowerCase()) {
            case "feature": return "#10b981";
            case "bug":     return "#ef4444";
            case "tech":    return "#3b82f6";
            case "story":   return "#f59e0b";
            default:        return "#6366f1";
        }
    }

    private String getPriorityColor(String priority) {
        if (priority == null) return "#f59e0b";
        switch (priority.toLowerCase()) {
            case "critical": return "#dc2626";
            case "high":     return "#ea580c";
            case "medium":   return "#f59e0b";
            case "low":      return "#3b82f6";
            default:         return "#6366f1";
        }
    }
}
