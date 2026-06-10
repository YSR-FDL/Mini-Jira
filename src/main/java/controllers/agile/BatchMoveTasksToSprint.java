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
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

/**
 * BatchMoveTasksToSprint — Moves multiple tasks to a target sprint (or backlog) in one call.
 * Expects: { "taskIds": [1, 2, 3], "sprintId": 5 }
 * If sprintId is null, moves tasks to backlog (unassigns from sprint).
 */
@WebServlet("/BatchMoveTasksToSprint")
public class BatchMoveTasksToSprint extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private TaskDAO taskDAO;
    private structures_DAO.ProjectDAO projectDAO;

    @Override
    public void init(ServletConfig config) throws ServletException {
        taskDAO = new TaskDAO();
        projectDAO = new structures_DAO.ProjectDAO();
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

        JsonArray taskIdsArray = body.getAsJsonArray("taskIds");
        if (taskIdsArray == null || taskIdsArray.size() == 0) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().print("{\"message\":\"error\",\"error\":\"No task IDs provided\"}");
            return;
        }

        boolean toBacklog = !body.has("sprintId") || body.get("sprintId").isJsonNull();
        int sprintId = toBacklog ? 0 : body.get("sprintId").getAsInt();

        // RBAC: batch-moving stories between sprints/backlog is a Scrum Master action.
        Integer requesterId = utils.RequestUtils.getRequesterId(body);
        if (requesterId == null) {
            utils.RequestUtils.writeJsonError(response, HttpServletResponse.SC_UNAUTHORIZED, "Utilisateur non identifié.");
            return;
        }
        classes.Task firstTask = taskDAO.getTaskById(taskIdsArray.get(0).getAsInt());
        if (firstTask == null) {
            utils.RequestUtils.writeJsonError(response, HttpServletResponse.SC_BAD_REQUEST, "Tâche introuvable.");
            return;
        }
        classes.Project project = projectDAO.getProjectById(firstTask.getIdProject());
        utils.Rbac.Roles roles = utils.Rbac.resolve(requesterId, project, null);
        String denial = utils.Rbac.authorizeSprintManagement(roles);
        if (denial != null) {
            utils.RequestUtils.writeJsonError(response, HttpServletResponse.SC_FORBIDDEN, denial);
            return;
        }

        int successCount = 0;
        for (int i = 0; i < taskIdsArray.size(); i++) {
            int taskId = taskIdsArray.get(i).getAsInt();
            int result;
            if (toBacklog) {
                result = taskDAO.unassignTaskFromSprint(taskId);
            } else {
                result = taskDAO.assignTaskToSprint(taskId, sprintId);
            }
            if (result > 0) successCount++;
        }

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();
        out.print("{\"message\":\"success\",\"moved\":" + successCount + ",\"total\":" + taskIdsArray.size() + "}");
    }
}
