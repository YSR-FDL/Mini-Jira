package controllers.agile;

import jakarta.servlet.ServletConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import structures_DAO.TaskDAO;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import classes.Task;

@WebServlet("/UpdateTask")
public class UpdateTask extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private TaskDAO taskDAO;
    private structures_DAO.ProjectDAO projectDAO;
    private structures_DAO.TeamDao teamDao;

    @Override
    public void init(ServletConfig config) throws ServletException {
        taskDAO = new TaskDAO();
        projectDAO = new structures_DAO.ProjectDAO();
        teamDao = new structures_DAO.TeamDao();
    }

    @Override
    protected void doOptions(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");
        response.setStatus(HttpServletResponse.SC_OK);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");

        BufferedReader reader = request.getReader();
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            sb.append(line);
        }

        Gson gson = new Gson();
        JsonObject body = gson.fromJson(sb.toString(), JsonObject.class);
        Task task = gson.fromJson(body, Task.class);

        if (task.getTitre() != null && task.getTitre().trim().isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            PrintWriter out = response.getWriter();
            out.print("{\"message\":\"error\",\"error\":\"Title cannot be empty\"}");
            return;
        }

        // RBAC: field-level enforcement based on the caller's role and task type.
        Integer requesterId = utils.RequestUtils.getRequesterId(body);
        if (requesterId == null) {
            utils.RequestUtils.writeJsonError(response, HttpServletResponse.SC_UNAUTHORIZED, "Utilisateur non identifié.");
            return;
        }
        classes.Task existing = taskDAO.getTaskById(task.getIdTask());
        if (existing == null) {
            utils.RequestUtils.writeJsonError(response, HttpServletResponse.SC_BAD_REQUEST, "Tâche introuvable.");
            return;
        }
        classes.Project project = projectDAO.getProjectById(existing.getIdProject());
        utils.Rbac.Roles roles = utils.Rbac.resolve(requesterId, project, teamDao);
        // Only fields whose value actually differs from the stored task count as
        // changes (the frontend may echo the whole task back on every edit).
        java.util.Set<String> presentKeys = new java.util.HashSet<>(body.keySet());
        presentKeys.remove("idTask");
        presentKeys.remove("requesterId");
        java.util.Set<String> changedFields = utils.Rbac.computeChangedTaskFields(presentKeys, existing, task);
        classes.Task parent = utils.Rbac.isSubtask(existing) && existing.getIdParent() != null
                ? taskDAO.getTaskById(existing.getIdParent()) : null;
        String denial = utils.Rbac.authorizeTaskUpdate(roles, existing, task, changedFields, parent);
        if (denial != null) {
            utils.RequestUtils.writeJsonError(response, HttpServletResponse.SC_FORBIDDEN, denial);
            return;
        }

        int nb;
        // Type-only quick update (no title sent, only the type field).
        if (!body.has("titre") && body.has("typeTache")) {
            nb = taskDAO.updateTaskType(task.getIdTask(), task.getTypeTache());
        } else {
            nb = taskDAO.updateTask(task, body.keySet());
        }

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();
        if (nb > 0) {
            out.print("{\"message\":\"success\"}");
        } else {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"message\":\"error\"}");
        }
    }
}
