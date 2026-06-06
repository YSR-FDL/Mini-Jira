package structures_DAO;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import classes.Task;
import connexion_BD.DBInteraction;
import utils.AssigneeHelper;

public class TaskDAO {

    /**
     * Builds a Task object from a ResultSet row.
     * Expects the query to include a LEFT JOIN on utilisateurs for assignee data.
     */
    private Task buildTaskFromRS(ResultSet rs) throws SQLException {
        Task task = new Task();
        task.setIdTask(rs.getInt("id_task"));
        task.setTitre(rs.getString("titre"));
        task.setDescription(rs.getString("description"));
        task.setStatut(rs.getString("statut"));
        task.setPriorite(rs.getString("priorite"));
        task.setStoryPoints(rs.getInt("story_points"));
        task.setDateCreation(rs.getString("date_creation"));
        task.setIdProject(rs.getInt("id_project"));

        int sprintId = rs.getInt("id_sprint");
        task.setIdSprint(rs.wasNull() ? null : sprintId);

        int assigneeId = rs.getInt("id_assignee");
        task.setIdAssignee(rs.wasNull() ? null : assigneeId);

        task.setTypeTache(rs.getString("type_tache"));
        return task;
    }

    /**
     * Builds a JSON-friendly map for a task, including computed assignee details.
     * This is the shape the frontend expects.
     */
    private Map<String, Object> buildTaskMap(ResultSet rs) throws SQLException {
        Map<String, Object> map = new HashMap<>();
        map.put("idTask", rs.getInt("id_task"));
        map.put("titre", rs.getString("titre"));
        map.put("description", rs.getString("description"));
        map.put("statut", rs.getString("statut"));
        map.put("priorite", rs.getString("priorite"));
        map.put("storyPoints", rs.getInt("story_points"));
        map.put("dateCreation", rs.getString("date_creation"));
        map.put("idProject", rs.getInt("id_project"));

        int sprintId = rs.getInt("id_sprint");
        map.put("idSprint", rs.wasNull() ? null : sprintId);

        int assigneeId = rs.getInt("id_assignee");
        if (!rs.wasNull() && assigneeId > 0) {
            String prenom = rs.getString("prenom_assignee");
            String nom = rs.getString("nom_assignee");
            map.put("assignee", AssigneeHelper.buildAssigneeMap(assigneeId, prenom, nom));
        } else {
            map.put("assignee", null);
        }

        String typeTache = rs.getString("type_tache");
        // Frontend expects tags as an array
        List<String> tags = new ArrayList<>();
        if (typeTache != null && !typeTache.isEmpty()) {
            tags.add(typeTache);
        }
        map.put("tags", tags);
        map.put("typeTache", typeTache);

        return map;
    }

    /**
     * Base query with LEFT JOIN for assignee enrichment.
     */
    private static final String TASK_SELECT = 
        "SELECT t.*, u.nom AS nom_assignee, u.prenom AS prenom_assignee " +
        "FROM tasks t LEFT JOIN utilisateurs u ON t.id_assignee = u.id ";

    // ========================= CREATE =========================

    public int addTask(Task task) {
        int nb = 0;
        DBInteraction.connect();
        String sql = "INSERT INTO tasks(titre, description, statut, priorite, story_points, id_project, id_sprint, id_assignee, type_tache) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try {
            PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql);
            ps.setString(1, task.getTitre());
            ps.setString(2, task.getDescription());
            ps.setString(3, task.getStatut() != null ? task.getStatut() : "todo");
            ps.setString(4, task.getPriorite() != null ? task.getPriorite() : "medium");
            ps.setInt(5, task.getStoryPoints());
            ps.setInt(6, task.getIdProject());
            if (task.getIdSprint() != null) {
                ps.setInt(7, task.getIdSprint());
            } else {
                ps.setNull(7, java.sql.Types.INTEGER);
            }
            if (task.getIdAssignee() != null) {
                ps.setInt(8, task.getIdAssignee());
            } else {
                ps.setNull(8, java.sql.Types.INTEGER);
            }
            ps.setString(9, task.getTypeTache() != null ? task.getTypeTache() : "Feature");
            nb = ps.executeUpdate();
            ps.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        DBInteraction.disconnect();
        return nb;
    }

    // ========================= READ =========================

    /**
     * Gets backlog tasks (tasks not assigned to any sprint) for a project.
     * Returns enriched maps ready for JSON serialization.
     */
    public List<Map<String, Object>> getBacklogTasks(int projectId) {
        List<Map<String, Object>> tasks = new ArrayList<>();
        DBInteraction.connect();
        String sql = TASK_SELECT + "WHERE t.id_project = ? AND t.id_sprint IS NULL ORDER BY t.date_creation DESC";
        try {
            PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql);
            ps.setInt(1, projectId);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                tasks.add(buildTaskMap(rs));
            }
            rs.close();
            ps.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        DBInteraction.disconnect();
        return tasks;
    }

    /**
     * Gets all tasks assigned to a specific sprint.
     * Used for the Board view and sprint detail.
     */
    public List<Map<String, Object>> getSprintTasks(int sprintId) {
        List<Map<String, Object>> tasks = new ArrayList<>();
        DBInteraction.connect();
        String sql = TASK_SELECT + "WHERE t.id_sprint = ? ORDER BY t.date_creation ASC";
        try {
            PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql);
            ps.setInt(1, sprintId);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                tasks.add(buildTaskMap(rs));
            }
            rs.close();
            ps.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        DBInteraction.disconnect();
        return tasks;
    }

    /**
     * Gets ALL tasks for a project (both backlog and sprint-assigned).
     * Used for project-wide metrics and overview.
     */
    public List<Map<String, Object>> getProjectTasks(int projectId) {
        List<Map<String, Object>> tasks = new ArrayList<>();
        DBInteraction.connect();
        String sql = TASK_SELECT + "WHERE t.id_project = ? ORDER BY t.date_creation DESC";
        try {
            PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql);
            ps.setInt(1, projectId);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                tasks.add(buildTaskMap(rs));
            }
            rs.close();
            ps.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        DBInteraction.disconnect();
        return tasks;
    }

    // ========================= UPDATE =========================

    /**
     * Updates only the status of a task. Used for Board drag-and-drop.
     * This is the fastest possible endpoint for real-time D&D.
     */
    public int updateTaskStatus(int taskId, String newStatus) {
        int nb = 0;
        DBInteraction.connect();
        String sql = "UPDATE tasks SET statut = ? WHERE id_task = ?";
        try {
            PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql);
            ps.setString(1, newStatus);
            ps.setInt(2, taskId);
            nb = ps.executeUpdate();
            ps.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        DBInteraction.disconnect();
        return nb;
    }

    /**
     * Full task update — title, description, status, priority, points, sprint, assignee, type.
     */
    public Task getTaskById(int taskId) {
        Task task = null;
        DBInteraction.connect();
        String sql = "SELECT * FROM tasks WHERE id_task = ?";
        try {
            PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql);
            ps.setInt(1, taskId);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                task = new Task();
                task.setIdTask(rs.getInt("id_task"));
                task.setTitre(rs.getString("titre"));
                task.setDescription(rs.getString("description"));
                task.setStatut(rs.getString("statut"));
                task.setPriorite(rs.getString("priorite"));
                task.setStoryPoints(rs.getInt("story_points"));
                task.setIdProject(rs.getInt("id_project"));
                int sprintId = rs.getInt("id_sprint");
                task.setIdSprint(rs.wasNull() ? null : sprintId);
                int assigneeId = rs.getInt("id_assignee");
                task.setIdAssignee(rs.wasNull() ? null : assigneeId);
                task.setTypeTache(rs.getString("type_tache"));
            }
            rs.close();
            ps.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        DBInteraction.disconnect();
        return task;
    }

    public int updateTaskType(int taskId, String type) {
        int nb = 0;
        DBInteraction.connect();
        String sql = "UPDATE tasks SET type_tache = ? WHERE id_task = ?";
        try {
            PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql);
            ps.setString(1, type);
            ps.setInt(2, taskId);
            nb = ps.executeUpdate();
            ps.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        DBInteraction.disconnect();
        return nb;
    }

    /**
     * Full task update — title, description, status, priority, points, sprint, assignee, type.
     */
    public int updateTask(Task task) {
        Task existing = getTaskById(task.getIdTask());
        if (existing == null) return 0;

        // Merge fields if null in the incoming update payload
        if (task.getTitre() == null) task.setTitre(existing.getTitre());
        if (task.getDescription() == null) task.setDescription(existing.getDescription());
        if (task.getStatut() == null) task.setStatut(existing.getStatut());
        if (task.getPriorite() == null) task.setPriorite(existing.getPriorite());
        if (task.getStoryPoints() == 0) task.setStoryPoints(existing.getStoryPoints());
        if (task.getTypeTache() == null) task.setTypeTache(existing.getTypeTache());
        // For foreign keys, GSON uses null if absent, but we should only merge if the field was absent.
        // If we want to allow setting idSprint/idAssignee to null, we can check. Since full updates pass all fields,
        // we can safely keep them if they are null but the title is also null, otherwise use incoming value.

        int nb = 0;
        DBInteraction.connect();
        String sql = "UPDATE tasks SET titre = ?, description = ?, statut = ?, priorite = ?, " +
                     "story_points = ?, id_sprint = ?, id_assignee = ?, type_tache = ? WHERE id_task = ?";
        try {
            PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql);
            ps.setString(1, task.getTitre());
            ps.setString(2, task.getDescription());
            ps.setString(3, task.getStatut());
            ps.setString(4, task.getPriorite());
            ps.setInt(5, task.getStoryPoints());
            if (task.getIdSprint() != null) {
                ps.setInt(6, task.getIdSprint());
            } else {
                ps.setNull(6, java.sql.Types.INTEGER);
            }
            if (task.getIdAssignee() != null) {
                ps.setInt(7, task.getIdAssignee());
            } else {
                ps.setNull(7, java.sql.Types.INTEGER);
            }
            ps.setString(8, task.getTypeTache());
            ps.setInt(9, task.getIdTask());
            nb = ps.executeUpdate();
            ps.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        DBInteraction.disconnect();
        return nb;
    }

    /**
     * Assigns a task to a sprint (moves from backlog into sprint).
     */
    public int assignTaskToSprint(int taskId, int sprintId) {
        int nb = 0;
        DBInteraction.connect();
        String sql = "UPDATE tasks SET id_sprint = ? WHERE id_task = ?";
        try {
            PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql);
            ps.setInt(1, sprintId);
            ps.setInt(2, taskId);
            nb = ps.executeUpdate();
            ps.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        DBInteraction.disconnect();
        return nb;
    }

    /**
     * Unassigns a task from its sprint (moves back to backlog).
     */
    public int unassignTaskFromSprint(int taskId) {
        int nb = 0;
        DBInteraction.connect();
        String sql = "UPDATE tasks SET id_sprint = NULL WHERE id_task = ?";
        try {
            PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql);
            ps.setInt(1, taskId);
            nb = ps.executeUpdate();
            ps.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        DBInteraction.disconnect();
        return nb;
    }

    // ========================= DELETE =========================

    public int deleteTask(int taskId) {
        int nb = 0;
        DBInteraction.connect();
        String sql = "DELETE FROM tasks WHERE id_task = ?";
        try {
            PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql);
            ps.setInt(1, taskId);
            nb = ps.executeUpdate();
            ps.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        DBInteraction.disconnect();
        return nb;
    }
}
