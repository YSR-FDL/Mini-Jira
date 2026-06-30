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
import java.util.ArrayList;
import java.util.List;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

/**
 * ReorderTasks — Persists the ordering of a backlog or sprint container.
 * Expects: { "taskIds": [3, 1, 2], "sprintId": 5 }
 * If sprintId is null or missing, the tasks belong to the backlog.
 * Each task gets position = its index in the array, and its sprint set to
 * the target container (so a drag that also changes lists is handled here).
 */
@WebServlet("/ReorderTasks")
public class ReorderTasks extends HttpServlet {
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

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        JsonArray taskIdsArray = (body != null && body.has("taskIds") && !body.get("taskIds").isJsonNull())
                ? body.getAsJsonArray("taskIds") : null;
        if (taskIdsArray == null || taskIdsArray.size() == 0) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"message\":\"error\",\"error\":\"No task IDs provided\"}");
            return;
        }

        Integer sprintId = (body.has("sprintId") && !body.get("sprintId").isJsonNull())
                ? body.get("sprintId").getAsInt() : null;

        List<Integer> orderedIds = new ArrayList<>();
        for (int i = 0; i < taskIdsArray.size(); i++) {
            orderedIds.add(taskIdsArray.get(i).getAsInt());
        }

        // RBAC: Scrum Master may reorder any container; Product Owner may reorder
        // the backlog only (sprintId == null).
        Integer requesterId = utils.RequestUtils.getRequesterId(body);
        if (requesterId == null) {
            utils.RequestUtils.writeJsonError(response, HttpServletResponse.SC_UNAUTHORIZED, "Utilisateur non identifié.");
            return;
        }
        classes.Task firstTask = taskDAO.getTaskById(orderedIds.get(0));
        if (firstTask == null) {
            utils.RequestUtils.writeJsonError(response, HttpServletResponse.SC_BAD_REQUEST, "Tâche introuvable.");
            return;
        }
        classes.Project project = projectDAO.getProjectById(firstTask.getIdProject());
        utils.Rbac.Roles roles = utils.Rbac.resolve(requesterId, project, teamDao);
        String denial = utils.Rbac.authorizeReorder(roles, sprintId);
        if (denial != null) {
            utils.RequestUtils.writeJsonError(response, HttpServletResponse.SC_FORBIDDEN, denial);
            return;
        }

        int updated = taskDAO.reorderTasks(orderedIds, sprintId);

        if (updated > 0) {
            out.print("{\"message\":\"success\",\"updated\":" + updated + "}");
        } else {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"message\":\"error\"}");
        }
    }
}
