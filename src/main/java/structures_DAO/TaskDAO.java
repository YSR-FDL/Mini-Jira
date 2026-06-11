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

    private Task buildTaskFromRS(ResultSet rs) throws SQLException {
        Task task = new Task();
        task.setIdTask(rs.getInt("id_task"));
        task.setTitre(rs.getString("titre"));
        task.setDescription(rs.getString("description"));
        task.setStatut(rs.getString("statut"));
        task.setPriorite(rs.getString("priorite"));
        task.setStoryPoints(rs.getInt("story_points"));
        task.setPosition(rs.getInt("position"));
        task.setDateCreation(rs.getString("date_creation"));
        task.setIdProject(rs.getInt("id_project"));

        int sprintId = rs.getInt("id_sprint");
        task.setIdSprint(rs.wasNull() ? null : sprintId);

        int assigneeId = rs.getInt("id_assignee");
        task.setIdAssignee(rs.wasNull() ? null : assigneeId);

        int parentId = rs.getInt("id_parent");
        task.setIdParent(rs.wasNull() ? null : parentId);

        task.setTypeTache(rs.getString("type_tache"));
        return task;
    }

    private Map<String, Object> buildTaskMap(ResultSet rs) throws SQLException {
        Map<String, Object> map = new HashMap<>();
        map.put("idTask", rs.getInt("id_task"));
        map.put("titre", rs.getString("titre"));
        map.put("description", rs.getString("description"));
        map.put("statut", rs.getString("statut"));
        map.put("priorite", rs.getString("priorite"));
        map.put("storyPoints", rs.getInt("story_points"));
        map.put("position", rs.getInt("position"));
        map.put("dateCreation", rs.getString("date_creation"));
        map.put("idProject", rs.getInt("id_project"));

        int sprintId = rs.getInt("id_sprint");
        map.put("idSprint", rs.wasNull() ? null : sprintId);

        int parentId = rs.getInt("id_parent");
        map.put("idParent", rs.wasNull() ? null : parentId);

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

    private static final String TASK_SELECT = 
        "SELECT t.*, u.nom AS nom_assignee, u.prenom AS prenom_assignee " +
        "FROM tasks t LEFT JOIN utilisateurs u ON t.id_assignee = u.id ";

    public int addTask(Task task) {
        int nb = 0;
        DBInteraction.connect();

        // Place the new task at the end of its container (project + sprint/backlog).
        int nextPos = 0;
        String posSql = "SELECT COALESCE(MAX(position), -1) + 1 AS np FROM tasks WHERE id_project = ? AND " +
                        (task.getIdSprint() != null ? "id_sprint = ?" : "id_sprint IS NULL");
        try {
            PreparedStatement pp = DBInteraction.getConn().prepareStatement(posSql);
            pp.setInt(1, task.getIdProject());
            if (task.getIdSprint() != null) {
                pp.setInt(2, task.getIdSprint());
            }
            ResultSet prs = pp.executeQuery();
            if (prs.next()) {
                nextPos = prs.getInt("np");
            }
            prs.close();
            pp.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }

        String sql = "INSERT INTO tasks(titre, description, statut, priorite, story_points, position, id_project, id_sprint, id_assignee, id_parent, type_tache) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try {
            PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql, PreparedStatement.RETURN_GENERATED_KEYS);
            ps.setString(1, task.getTitre());
            ps.setString(2, task.getDescription());
            ps.setString(3, task.getStatut() != null ? task.getStatut() : "todo");
            ps.setString(4, task.getPriorite() != null ? task.getPriorite() : "medium");
            ps.setInt(5, task.getStoryPoints());
            ps.setInt(6, nextPos);
            ps.setInt(7, task.getIdProject());
            if (task.getIdSprint() != null) {
                ps.setInt(8, task.getIdSprint());
            } else {
                ps.setNull(8, java.sql.Types.INTEGER);
            }
            if (task.getIdAssignee() != null) {
                ps.setInt(9, task.getIdAssignee());
            } else {
                ps.setNull(9, java.sql.Types.INTEGER);
            }
            if (task.getIdParent() != null) {
                ps.setInt(10, task.getIdParent());
            } else {
                ps.setNull(10, java.sql.Types.INTEGER);
            }
            ps.setString(11, task.getTypeTache() != null ? task.getTypeTache() : "Feature");
            nb = ps.executeUpdate();
            if (nb > 0) {
                ResultSet keys = ps.getGeneratedKeys();
                if (keys.next()) {
                    task.setIdTask(keys.getInt(1));
                }
                keys.close();
            }
            ps.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        DBInteraction.disconnect();
        return nb;
    }
    public List<Map<String, Object>> getBacklogTasks(int projectId) {
        List<Map<String, Object>> tasks = new ArrayList<>();
        DBInteraction.connect();
        String sql = TASK_SELECT + "WHERE t.id_project = ? AND t.id_sprint IS NULL ORDER BY t.position ASC, t.date_creation DESC";
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

    public List<Map<String, Object>> getSprintTasks(int sprintId) {
        List<Map<String, Object>> tasks = new ArrayList<>();
        DBInteraction.connect();
        String sql = TASK_SELECT + "WHERE t.id_sprint = ? ORDER BY t.position ASC, t.date_creation ASC";
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

    public List<Map<String, Object>> getProjectTasks(int projectId) {
        List<Map<String, Object>> tasks = new ArrayList<>();
        DBInteraction.connect();
        String sql = TASK_SELECT + "WHERE t.id_project = ? ORDER BY t.position ASC, t.date_creation DESC";
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

    /** Considère une tâche comme terminée selon les libellés FR/EN possibles. */
    private boolean isDoneStatus(String statut) {
        if (statut == null) return false;
        String s = statut.toLowerCase();
        return s.contains("done") || s.contains("termin") || s.contains("released")
                || s.contains("closed") || s.contains("ferm");
    }

    /** Tâches enfants d'un parent donné (stories d'un epic, ou subtasks d'une story). */
    public List<Map<String, Object>> getChildren(int parentId) {
        List<Map<String, Object>> children = new ArrayList<>();
        DBInteraction.connect();
        String sql = TASK_SELECT + "WHERE t.id_parent = ? ORDER BY t.position ASC, t.id_task ASC";
        try {
            PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql);
            ps.setInt(1, parentId);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                children.add(buildTaskMap(rs));
            }
            rs.close();
            ps.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        DBInteraction.disconnect();
        return children;
    }

    /**
     * Retourne les epics d'un projet (type_tache = 'Epic') avec leurs stories
     * enfants et un cumul (roll-up) : nombre d'enfants, enfants terminés, points
     * totaux et points livrés. Permet à la page Epics d'afficher la progression
     * sans recalcul côté client.
     */
    public List<Map<String, Object>> getEpics(int projectId) {
        List<Map<String, Object>> epics = new ArrayList<>();
        DBInteraction.connect();
        String sql = TASK_SELECT + "WHERE t.id_project = ? AND t.type_tache = 'Epic' " +
                     "ORDER BY t.position ASC, t.id_task ASC";
        try {
            PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql);
            ps.setInt(1, projectId);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                epics.add(buildTaskMap(rs));
            }
            rs.close();
            ps.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        DBInteraction.disconnect();

        // Attache les enfants et calcule le roll-up pour chaque epic.
        for (Map<String, Object> epic : epics) {
            int epicId = (int) epic.get("idTask");
            List<Map<String, Object>> children = getChildren(epicId);
            int childCount = children.size();
            int doneCount = 0;
            int totalPoints = 0;
            int donePoints = 0;
            for (Map<String, Object> child : children) {
                int pts = child.get("storyPoints") != null ? (int) child.get("storyPoints") : 0;
                totalPoints += pts;
                if (isDoneStatus((String) child.get("statut"))) {
                    doneCount++;
                    donePoints += pts;
                }
            }
            epic.put("children", children);
            epic.put("childCount", childCount);
            epic.put("doneCount", doneCount);
            epic.put("totalPoints", totalPoints);
            epic.put("donePoints", donePoints);
        }
        return epics;
    }

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
                int parentId = rs.getInt("id_parent");
                task.setIdParent(rs.wasNull() ? null : parentId);
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

    public int updateTask(Task task) {
        return updateTask(task, null);
    }

    /**
     * Updates a task using presence-based partial semantics.
     *
     * {@code providedFields} holds the JSON keys that were actually present in
     * the request body. Any field not present keeps its existing value, while a
     * field present with a null value is applied as-is. This distinguishes
     * "field omitted" (keep) from "field explicitly cleared" (e.g. unassign or
     * move to backlog) and lets story points be set to 0.
     *
     * When {@code providedFields} is null the legacy "null means keep" behaviour
     * is used for backward compatibility.
     */
    public int updateTask(Task task, java.util.Set<String> providedFields) {
        Task existing = getTaskById(task.getIdTask());
        if (existing == null) return 0;

        boolean hasPresence = providedFields != null;

        if (hasPresence ? !providedFields.contains("titre") : task.getTitre() == null)
            task.setTitre(existing.getTitre());
        if (hasPresence ? !providedFields.contains("description") : task.getDescription() == null)
            task.setDescription(existing.getDescription());
        if (hasPresence ? !providedFields.contains("statut") : task.getStatut() == null)
            task.setStatut(existing.getStatut());
        if (hasPresence ? !providedFields.contains("priorite") : task.getPriorite() == null)
            task.setPriorite(existing.getPriorite());
        if (hasPresence ? !providedFields.contains("storyPoints") : task.getStoryPoints() == 0)
            task.setStoryPoints(existing.getStoryPoints());
        if (hasPresence ? !providedFields.contains("typeTache") : task.getTypeTache() == null)
            task.setTypeTache(existing.getTypeTache());

        // idSprint / idAssignee: only merge when the key was omitted. A present
        // null is an intentional "move to backlog" / "unassign".
        if (hasPresence ? !providedFields.contains("idSprint") : task.getIdSprint() == null)
            task.setIdSprint(existing.getIdSprint());
        if (hasPresence ? !providedFields.contains("idAssignee") : task.getIdAssignee() == null)
            task.setIdAssignee(existing.getIdAssignee());

        // idParent: same presence semantics. A present null detaches the task
        // from its epic/parent; an omitted key keeps the current parent.
        if (hasPresence ? !providedFields.contains("idParent") : task.getIdParent() == null)
            task.setIdParent(existing.getIdParent());

        int nb = 0;
        DBInteraction.connect();
        String sql = "UPDATE tasks SET titre = ?, description = ?, statut = ?, priorite = ?, " +
                     "story_points = ?, id_sprint = ?, id_assignee = ?, id_parent = ?, type_tache = ? WHERE id_task = ?";
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
            if (task.getIdParent() != null) {
                ps.setInt(8, task.getIdParent());
            } else {
                ps.setNull(8, java.sql.Types.INTEGER);
            }
            ps.setString(9, task.getTypeTache());
            ps.setInt(10, task.getIdTask());
            nb = ps.executeUpdate();
            ps.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        DBInteraction.disconnect();
        return nb;
    }

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

    /**
     * Persists the ordering of a container (backlog or sprint).
     * For each id in {@code orderedTaskIds}, sets position = its index and
     * id_sprint = {@code sprintId} (null = backlog). Both the new order and the
     * container membership are written in a single transaction, so a drag that
     * also moves a task between lists is handled in one call.
     */
    public int reorderTasks(java.util.List<Integer> orderedTaskIds, Integer sprintId) {
        if (orderedTaskIds == null || orderedTaskIds.isEmpty()) return 0;
        int updated = 0;
        DBInteraction.connect();
        String sql = "UPDATE tasks SET position = ?, id_sprint = ? WHERE id_task = ?";
        try {
            DBInteraction.getConn().setAutoCommit(false);
            PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql);
            for (int i = 0; i < orderedTaskIds.size(); i++) {
                ps.setInt(1, i);
                if (sprintId != null) {
                    ps.setInt(2, sprintId);
                } else {
                    ps.setNull(2, java.sql.Types.INTEGER);
                }
                ps.setInt(3, orderedTaskIds.get(i));
                ps.addBatch();
            }
            int[] results = ps.executeBatch();
            for (int r : results) {
                if (r > 0 || r == PreparedStatement.SUCCESS_NO_INFO) updated++;
            }
            DBInteraction.getConn().commit();
            ps.close();
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
        return updated;
    }
    
    public List<Map<String, Object>> getUserTasks(int userId) {
        List<Map<String, Object>> tasks = new ArrayList<>();
        DBInteraction.connect();
        String sql =
            "SELECT t.id_task, t.titre, t.description, t.statut, t.priorite, " +
            "       t.story_points, t.date_creation, t.id_project, t.id_sprint, " +
            "       t.id_assignee, t.id_parent, t.type_tache, " +
            "       u.nom AS nom_assignee, u.prenom AS prenom_assignee, " +
            "       p.nom_projet " +
            "FROM tasks t " +
            "LEFT JOIN utilisateurs u ON t.id_assignee = u.id " +
            "LEFT JOIN projects p ON t.id_project = p.id_project " +
            "WHERE t.id_assignee = ? " +
            "ORDER BY t.id_project ASC, t.date_creation DESC";
        try {
            PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql);
            ps.setInt(1, userId);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                Map<String, Object> map = new HashMap<>();
                map.put("idTask", rs.getInt("id_task"));
                map.put("titre", rs.getString("titre"));
                map.put("description", rs.getString("description"));
                map.put("statut", rs.getString("statut"));
                map.put("priorite", rs.getString("priorite"));
                map.put("storyPoints", rs.getInt("story_points"));
                map.put("dateCreation", rs.getString("date_creation"));
                map.put("idProject", rs.getInt("id_project"));
                map.put("nomProjet", rs.getString("nom_projet"));

                int sprintId = rs.getInt("id_sprint");
                map.put("idSprint", rs.wasNull() ? null : sprintId);

                int parentId = rs.getInt("id_parent");
                map.put("idParent", rs.wasNull() ? null : parentId);

                map.put("typeTache", rs.getString("type_tache"));
                tasks.add(map);
            }
            rs.close();
            ps.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        DBInteraction.disconnect();
        return tasks;
    }
}
