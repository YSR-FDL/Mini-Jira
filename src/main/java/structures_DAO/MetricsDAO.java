package structures_DAO;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import connexion_BD.DBInteraction;

public class MetricsDAO {

    /**
     * Resolves all workflow states for a project.
     * Returns the list of states, or a default set if not found.
     */
    private List<String> resolveProjectStates(int projectId) {
        List<String> states = new ArrayList<>();
        String sql = "SELECT etats FROM projects WHERE id_project = ?";
        try {
            PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql);
            ps.setInt(1, projectId);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                String etatsStr = rs.getString("etats");
                if (etatsStr != null && !etatsStr.isEmpty()) {
                    for (String s : etatsStr.split(",")) {
                        states.add(s.trim());
                    }
                }
            }
            rs.close();
            ps.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        if (states.isEmpty()) {
            states = Arrays.asList("todo", "in-progress", "review", "done");
        }
        return states;
    }

    public Map<String, Object> getProjectMetrics(int projectId) {
        Map<String, Object> metrics = new HashMap<>();
        DBInteraction.connect();

        List<String> states = resolveProjectStates(projectId);
        String firstStatus = states.get(0);
        String doneStatus = states.get(states.size() - 1);

        // Count tasks per status, then bucket into todo / in-progress / done.
        Map<String, Integer> counts = new HashMap<>();
        int total = 0;
        String sql = "SELECT statut, COUNT(*) AS cnt FROM tasks WHERE id_project = ? GROUP BY statut";
        try {
            PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql);
            ps.setInt(1, projectId);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                String st = rs.getString("statut");
                int c = rs.getInt("cnt");
                counts.put(st == null ? "" : st, c);
                total += c;
            }
            rs.close();
            ps.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }

        int completed = counts.getOrDefault(doneStatus, 0);
        int todo = counts.getOrDefault(firstStatus, 0);
        // Avoid double counting if the workflow has a single state (first == last).
        int inProgress = total - completed - (firstStatus.equals(doneStatus) ? 0 : todo);
        if (inProgress < 0) inProgress = 0;

        metrics.put("totalIssues", total);
        metrics.put("completed", completed);
        metrics.put("todo", todo);
        metrics.put("inProgress", inProgress);
        metrics.put("overdue", countOverdue(projectId, doneStatus));

        DBInteraction.disconnect();
        return metrics;
    }

    /**
     * Counts not-done tasks that belong to a sprint whose end date has passed.
     * Uses the connection already opened by the caller (no connect/disconnect).
     */
    private int countOverdue(int projectId, String doneStatus) {
        int overdue = 0;
        String sql = "SELECT COUNT(*) AS cnt FROM tasks t " +
                     "JOIN sprints s ON t.id_sprint = s.id_sprint " +
                     "WHERE t.id_project = ? AND s.date_fin < CURRENT_DATE AND t.statut <> ?";
        try {
            PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql);
            ps.setInt(1, projectId);
            ps.setString(2, doneStatus);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                overdue = rs.getInt("cnt");
            }
            rs.close();
            ps.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return overdue;
    }

    public Map<String, Object> getSprintProgress(int sprintId) {
        Map<String, Object> progress = new HashMap<>();
        DBInteraction.connect();

        // First, get the project ID for this sprint to resolve its "done" state
        String doneStatus = "done";
        String projectSql = "SELECT p.etats FROM sprints s JOIN projects p ON s.id_project = p.id_project WHERE s.id_sprint = ?";
        try {
            PreparedStatement psProj = DBInteraction.getConn().prepareStatement(projectSql);
            psProj.setInt(1, sprintId);
            ResultSet rsProj = psProj.executeQuery();
            if (rsProj.next()) {
                String etatsStr = rsProj.getString("etats");
                if (etatsStr != null && !etatsStr.isEmpty()) {
                    String[] etats = etatsStr.split(",");
                    doneStatus = etats[etats.length - 1].trim();
                }
            }
            rsProj.close();
            psProj.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }

        String sql = "SELECT " +
            "COUNT(*) AS total, " +
            "SUM(CASE WHEN statut = ? THEN 1 ELSE 0 END) AS completed, " +
            "COALESCE(SUM(story_points), 0) AS totalPoints, " +
            "COALESCE(SUM(CASE WHEN statut = ? THEN story_points ELSE 0 END), 0) AS completedPoints " +
            "FROM tasks WHERE id_sprint = ?";
        try {
            PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql);
            ps.setString(1, doneStatus);
            ps.setString(2, doneStatus);
            ps.setInt(3, sprintId);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                int total = rs.getInt("total");
                int completed = rs.getInt("completed");
                progress.put("totalIssues", total);
                progress.put("totalCompleted", completed);
                progress.put("totalPoints", rs.getInt("totalPoints"));
                progress.put("completedPoints", rs.getInt("completedPoints"));
            }
            rs.close();
            ps.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }

        // Build the real per-status distribution.
        String distSql = "SELECT statut, COUNT(*) AS cnt FROM tasks WHERE id_sprint = ? GROUP BY statut";
        try {
            PreparedStatement psDist = DBInteraction.getConn().prepareStatement(distSql);
            psDist.setInt(1, sprintId);
            ResultSet rsDist = psDist.executeQuery();
            Map<String, Integer> actualDist = new HashMap<>();
            while (rsDist.next()) {
                actualDist.put(rsDist.getString("statut"), rsDist.getInt("cnt"));
            }
            rsDist.close();
            psDist.close();
            progress.put("distribution", actualDist);
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
