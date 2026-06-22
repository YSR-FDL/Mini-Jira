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

    public Map<String, Object> getGlobalDashboardData() {
        Map<String, Object> data = new HashMap<>();
        DBInteraction.connect();
        try {
            // 1. Global Stats
            Map<String, Object> stats = new HashMap<>();
            ResultSet rs = DBInteraction.getConn().prepareStatement("SELECT COUNT(*) FROM projects").executeQuery();
            if (rs.next()) stats.put("totalProjects", rs.getInt(1)); rs.close();
            
            rs = DBInteraction.getConn().prepareStatement("SELECT COUNT(*) FROM tasks").executeQuery();
            if (rs.next()) stats.put("totalTasks", rs.getInt(1)); rs.close();
            
            rs = DBInteraction.getConn().prepareStatement("SELECT COUNT(*) FROM utilisateurs").executeQuery();
            if (rs.next()) stats.put("totalUsers", rs.getInt(1)); rs.close();
            
            rs = DBInteraction.getConn().prepareStatement("SELECT COUNT(*) FROM equipes").executeQuery();
            if (rs.next()) stats.put("totalTeams", rs.getInt(1)); rs.close();

            int completed = 0, inProgress = 0, todo = 0;
            rs = DBInteraction.getConn().prepareStatement("SELECT statut, COUNT(*) as cnt FROM tasks GROUP BY statut").executeQuery();
            
            List<Map<String, Object>> statusDist = new ArrayList<>();
            while (rs.next()) {
                String st = rs.getString("statut");
                int cnt = rs.getInt("cnt");
                String stLower = st != null ? st.toLowerCase() : "";
                
                if (stLower.contains("termin") || stLower.contains("done") || stLower.contains("releas")) {
                    completed += cnt;
                    statusDist.add(createStatusItem(st, cnt, "#00875A"));
                } else if (stLower.contains("cours") || stLower.contains("progress") || stLower.contains("test") || stLower.contains("revue") || stLower.contains("review")) {
                    inProgress += cnt;
                    statusDist.add(createStatusItem(st, cnt, "#0052CC"));
                } else {
                    todo += cnt;
                    statusDist.add(createStatusItem(st, cnt, "#97A0AF"));
                }
            }
            rs.close();
            stats.put("completedTasks", completed);
            stats.put("inProgressTasks", inProgress);
            stats.put("todoTasks", todo);
            data.put("globalStats", stats);
            data.put("taskStatusData", statusDist);

            // 2. Priority Distribution
            List<Map<String, Object>> priorityDist = new ArrayList<>();
            rs = DBInteraction.getConn().prepareStatement("SELECT COALESCE(priorite, 'medium') as priorite, COUNT(*) as cnt FROM tasks GROUP BY priorite").executeQuery();
            while (rs.next()) {
                Map<String, Object> item = new HashMap<>();
                item.put("name", rs.getString("priorite"));
                item.put("value", rs.getInt("cnt"));
                item.put("color", getPriorityColor(rs.getString("priorite")));
                priorityDist.add(item);
            }
            rs.close();
            data.put("taskPriorityData", priorityDist);

            // 3. Recent Tasks
            List<Map<String, Object>> recentTasks = new ArrayList<>();
            rs = DBInteraction.getConn().prepareStatement(
                "SELECT t.id_task, t.titre, p.nom_projet, t.priorite, t.statut, s.date_fin " +
                "FROM tasks t LEFT JOIN projects p ON t.id_project = p.id_project " +
                "LEFT JOIN sprints s ON t.id_sprint = s.id_sprint " +
                "ORDER BY t.date_creation DESC LIMIT 6"
            ).executeQuery();
            while (rs.next()) {
                Map<String, Object> t = new HashMap<>();
                t.put("id", rs.getInt("id_task"));
                t.put("title", rs.getString("titre"));
                t.put("project", rs.getString("nom_projet"));
                t.put("priority", rs.getString("priorite"));
                t.put("status", rs.getString("statut"));
                t.put("deadline", rs.getString("date_fin"));
                recentTasks.add(t);
            }
            rs.close();
            data.put("recentTasks", recentTasks);

            // 4. Teams Overview
            List<Map<String, Object>> myTeams = new ArrayList<>();
            rs = DBInteraction.getConn().prepareStatement(
                "SELECT e.id, e.nom, " +
                "(SELECT COUNT(*) FROM appartenance_equipe ae WHERE ae.id_equipe = e.id) as members, " +
                "(SELECT COUNT(*) FROM projects p WHERE p.idTeam = e.id) as projects, " +
                "(SELECT COUNT(*) FROM tasks t2 JOIN projects p2 ON t2.id_project = p2.id_project WHERE p2.idTeam = e.id) as totalTasks, " +
                "(SELECT COUNT(*) FROM tasks t3 JOIN projects p3 ON t3.id_project = p3.id_project WHERE p3.idTeam = e.id AND (LOWER(t3.statut) LIKE '%termin%' OR LOWER(t3.statut) LIKE '%done%' OR LOWER(t3.statut) LIKE '%releas%')) as doneTasks " +
                "FROM equipes e WHERE e.isArchived = 0 LIMIT 5"
            ).executeQuery();
            while (rs.next()) {
                Map<String, Object> team = new HashMap<>();
                team.put("id", rs.getInt("id"));
                team.put("name", rs.getString("nom"));
                team.put("members", rs.getInt("members"));
                team.put("projects", rs.getInt("projects"));
                int totalT = rs.getInt("totalTasks");
                int doneT = rs.getInt("doneTasks");
                int progression = totalT > 0 ? Math.round((doneT * 100.0f) / totalT) : 0;
                team.put("progression", progression);
                myTeams.add(team);
            }
            rs.close();
            data.put("myTeams", myTeams);

            // 5. Global Summary
            Map<String, Object> globalSummary = new HashMap<>();
            globalSummary.put("completionRate", stats.get("totalTasks").equals(0) ? 0 : Math.round(((int)stats.get("completedTasks") * 100.0f) / (int)stats.get("totalTasks")));
            rs = DBInteraction.getConn().prepareStatement("SELECT COUNT(*) FROM projects WHERE isArchived = 0").executeQuery();
            if (rs.next()) globalSummary.put("activeProjects", rs.getInt(1)); rs.close();
            
            rs = DBInteraction.getConn().prepareStatement("SELECT COUNT(*) FROM sprints WHERE statut IN ('actif', 'active')").executeQuery();
            if (rs.next()) globalSummary.put("activeSprints", rs.getInt(1)); rs.close();
            
            rs = DBInteraction.getConn().prepareStatement("SELECT COUNT(*) FROM tasks t JOIN sprints s ON t.id_sprint = s.id_sprint WHERE s.date_fin < CURRENT_DATE AND LOWER(t.statut) NOT LIKE '%termin%' AND LOWER(t.statut) NOT LIKE '%done%' AND LOWER(t.statut) NOT LIKE '%releas%'").executeQuery();
            if (rs.next()) globalSummary.put("overdueTasks", rs.getInt(1)); rs.close();
            data.put("globalSummary", globalSummary);

            // 6. Recent Projects
            List<Map<String, Object>> recentProjects = new ArrayList<>();
            rs = DBInteraction.getConn().prepareStatement(
                "SELECT p.id_project, p.nom_projet, p.isArchived, " +
                "(SELECT COUNT(DISTINCT ae.id_utilisateur) FROM appartenance_equipe ae WHERE ae.id_equipe = p.idTeam) as members, " +
                "(SELECT COUNT(*) FROM tasks t WHERE t.id_project = p.id_project) as totalTasks, " +
                "(SELECT COUNT(*) FROM tasks t2 WHERE t2.id_project = p.id_project AND (LOWER(t2.statut) LIKE '%termin%' OR LOWER(t2.statut) LIKE '%done%' OR LOWER(t2.statut) LIKE '%releas%')) as doneTasks " +
                "FROM projects p " +
                "ORDER BY p.date_creation DESC LIMIT 4"
            ).executeQuery();
            while (rs.next()) {
                Map<String, Object> rp = new HashMap<>();
                rp.put("id", rs.getInt("id_project"));
                rp.put("title", rs.getString("nom_projet"));
                int totalT = rs.getInt("totalTasks");
                int doneT = rs.getInt("doneTasks");
                int progress = totalT > 0 ? Math.round((doneT * 100.0f) / totalT) : 0;
                rp.put("description", totalT + " tâches · " + doneT + " terminées");
                rp.put("members", rs.getInt("members"));
                rp.put("progress", progress);
                rp.put("status", rs.getInt("isArchived") == 0 ? "EN COURS" : "TERMINÉ");
                recentProjects.add(rp);
            }
            rs.close();
            data.put("recentProjects", recentProjects);

        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            DBInteraction.disconnect();
        }
        return data;
    }

    private Map<String, Object> createStatusItem(String name, int value, String color) {
        Map<String, Object> item = new HashMap<>();
        item.put("name", name);
        item.put("value", value);
        item.put("color", color);
        return item;
    }
}
