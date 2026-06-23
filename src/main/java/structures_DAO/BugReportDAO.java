package structures_DAO;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import connexion_BD.DBInteraction;

/**
 * DAO for fetching bug-type tasks across the user's projects.
 * Returns them grouped by project so the frontend can display
 * project sections with their associated bug reports.
 */
public class BugReportDAO {

    /** Subquery: projects the user is part of (via team, creator, SM, or PO). */
    private static final String USER_PROJECTS_SUBQUERY =
        "(SELECT DISTINCT p.id_project FROM projects p " +
        "LEFT JOIN appartenance_equipe ae ON ae.id_equipe = p.idTeam " +
        "WHERE ae.id_utilisateur = ? OR p.idCreateur = ? OR p.idSM = ? OR p.idPO = ?)";

    /**
     * Returns all Bug-type tasks from projects the user belongs to,
     * grouped by project. Each project entry includes metadata and a
     * list of bug report items.
     */
    public List<Map<String, Object>> getBugReportsByUser(int userId) {
        List<Map<String, Object>> result = new ArrayList<>();
        DBInteraction.connect();

        try {
            // Use a LinkedHashMap to keep insertion order (by project)
            LinkedHashMap<Integer, Map<String, Object>> projectMap = new LinkedHashMap<>();

            String sql =
                "SELECT t.id_task, t.titre, t.description, t.priorite, t.statut, " +
                "       t.date_creation, t.story_points, t.id_project, t.id_sprint, " +
                "       p.nom_projet, p.cle, p.isArchived, p.etats, " +
                "       u.prenom AS assignee_prenom, u.nom AS assignee_nom, " +
                "       s.nom_sprint " +
                "FROM tasks t " +
                "JOIN projects p ON t.id_project = p.id_project " +
                "LEFT JOIN utilisateurs u ON t.id_assignee = u.id " +
                "LEFT JOIN sprints s ON t.id_sprint = s.id_sprint " +
                "WHERE t.type_tache = 'Bug' " +
                "  AND t.id_project IN " + USER_PROJECTS_SUBQUERY + " " +
                "ORDER BY p.nom_projet ASC, " +
                "  CASE t.priorite " +
                "    WHEN 'critical' THEN 0 " +
                "    WHEN 'high'     THEN 1 " +
                "    WHEN 'medium'   THEN 2 " +
                "    WHEN 'low'      THEN 3 " +
                "    ELSE 4 END ASC, " +
                "  t.date_creation DESC";

            PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql);
            ps.setInt(1, userId);
            ps.setInt(2, userId);
            ps.setInt(3, userId);
            ps.setInt(4, userId);

            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                int projectId = rs.getInt("id_project");

                // Lazily create the project group
                if (!projectMap.containsKey(projectId)) {
                    Map<String, Object> project = new HashMap<>();
                    project.put("id", projectId);
                    project.put("title", rs.getString("nom_projet"));

                    // Determine project status from isArchived
                    int isArchived = rs.getInt("isArchived");
                    project.put("status", isArchived == 0 ? "ACTIVE" : "ARCHIVED");

                    // We'll calculate progress after we gather all tasks
                    project.put("reports", new ArrayList<Map<String, Object>>());
                    projectMap.put(projectId, project);
                }

                // Build the report item
                Map<String, Object> report = new HashMap<>();
                report.put("id", rs.getInt("id_task"));
                report.put("title", rs.getString("titre"));
                report.put("description", rs.getString("description"));
                report.put("priority", rs.getString("priorite"));
                report.put("status", rs.getString("statut"));
                report.put("projectId", projectId);
                report.put("projectKey", rs.getString("cle"));
                report.put("storyPoints", rs.getInt("story_points"));
                report.put("createdAt", rs.getString("date_creation"));
                report.put("sprintName", rs.getString("nom_sprint"));

                // Build assignee name
                String prenom = rs.getString("assignee_prenom");
                String nom = rs.getString("assignee_nom");
                if (prenom != null && nom != null) {
                    report.put("assigneeName", (prenom + " " + nom).trim());
                    // Build initials
                    String initials = "";
                    if (prenom.length() > 0) initials += prenom.charAt(0);
                    if (nom.length() > 0) initials += nom.charAt(0);
                    report.put("assigneeInitials", initials.toUpperCase());
                } else {
                    report.put("assigneeName", null);
                    report.put("assigneeInitials", null);
                }

                @SuppressWarnings("unchecked")
                List<Map<String, Object>> reports =
                    (List<Map<String, Object>>) projectMap.get(projectId).get("reports");
                reports.add(report);
            }
            rs.close();
            ps.close();

            // Now compute project progress for each project (% of all tasks done)
            for (Map.Entry<Integer, Map<String, Object>> entry : projectMap.entrySet()) {
                int projId = entry.getKey();
                Map<String, Object> project = entry.getValue();
                int[] progress = computeProjectProgress(projId);
                project.put("progress", progress[0]);
                project.put("totalTasks", progress[1]);
                project.put("doneTasks", progress[2]);
            }

            result.addAll(projectMap.values());

        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            DBInteraction.disconnect();
        }

        return result;
    }

    /**
     * Returns [progressPercent, totalTasks, doneTasks] for a project.
     * Uses the connection already opened by the caller.
     */
    private int[] computeProjectProgress(int projectId) {
        int total = 0, done = 0;
        try {
            // Get the project's done status (last état)
            String doneStatus = "done";
            String etatsSQL = "SELECT etats FROM projects WHERE id_project = ?";
            PreparedStatement psEtats = DBInteraction.getConn().prepareStatement(etatsSQL);
            psEtats.setInt(1, projectId);
            ResultSet rsEtats = psEtats.executeQuery();
            if (rsEtats.next()) {
                String etatsStr = rsEtats.getString("etats");
                if (etatsStr != null && !etatsStr.isEmpty()) {
                    String[] etats = etatsStr.split(",");
                    doneStatus = etats[etats.length - 1].trim();
                }
            }
            rsEtats.close();
            psEtats.close();

            // Count tasks
            String countSQL = "SELECT COUNT(*) AS total, " +
                "SUM(CASE WHEN statut = ? THEN 1 ELSE 0 END) AS done " +
                "FROM tasks WHERE id_project = ?";
            PreparedStatement psCount = DBInteraction.getConn().prepareStatement(countSQL);
            psCount.setString(1, doneStatus);
            psCount.setInt(2, projectId);
            ResultSet rsCount = psCount.executeQuery();
            if (rsCount.next()) {
                total = rsCount.getInt("total");
                done = rsCount.getInt("done");
            }
            rsCount.close();
            psCount.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        int percent = total > 0 ? Math.round((done * 100.0f) / total) : 0;
        return new int[]{ percent, total, done };
    }
}
