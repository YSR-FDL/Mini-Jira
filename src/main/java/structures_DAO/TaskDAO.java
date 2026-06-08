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
        task.setDateCreation(rs.getString("date_creation"));
        task.setIdProject(rs.getInt("id_project"));

        int sprintId = rs.getInt("id_sprint");
        task.setIdSprint(rs.wasNull() ? null : sprintId);

        int assigneeId = rs.getInt("id_assignee");
        task.setIdAssignee(rs.wasNull() ? null : assigneeId);

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

    private static final String TASK_SELECT = 
        "SELECT t.*, u.nom AS nom_assignee, u.prenom AS prenom_assignee " +
        "FROM tasks t LEFT JOIN utilisateurs u ON t.id_assignee = u.id ";

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
        Task existing = getTaskById(task.getIdTask());
        if (existing == null) return 0;

        // Merge fields if null in the incoming update payload
        if (task.getTitre() == null) task.setTitre(existing.getTitre());
        if (task.getDescription() == null) task.setDescription(existing.getDescription());
        if (task.getStatut() == null) task.setStatut(existing.getStatut());
        if (task.getPriorite() == null) task.setPriorite(existing.getPriorite());
        if (task.getStoryPoints() == 0) task.setStoryPoints(existing.getStoryPoints());
        if (task.getTypeTache() == null) task.setTypeTache(existing.getTypeTache());

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
}
