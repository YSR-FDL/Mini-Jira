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
import classes.Task;

@WebServlet("/CreateTask")
public class CreateTask extends HttpServlet {
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
        Task task = gson.fromJson(sb.toString(), Task.class);
        
        if (task.getTitre() == null || task.getTitre().trim().isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            PrintWriter out = response.getWriter();
            out.print("{\"message\":\"error\",\"error\":\"Title cannot be empty\"}");
            return;
        }

        // RBAC: Epics → Product Owner, Stories → Product Owner,
        // Sub-tasks → Développeur (only under a story assigned to them).
        com.google.gson.JsonObject body = gson.fromJson(sb.toString(), com.google.gson.JsonObject.class);
        Integer requesterId = utils.RequestUtils.getRequesterId(body);
        if (requesterId == null) {
            utils.RequestUtils.writeJsonError(response, HttpServletResponse.SC_UNAUTHORIZED, "Utilisateur non identifié.");
            return;
        }
        classes.Project project = projectDAO.getProjectById(task.getIdProject());
        utils.Rbac.Roles roles = utils.Rbac.resolve(requesterId, project, teamDao);
        classes.Task parent = (task.getIdParent() != null) ? taskDAO.getTaskById(task.getIdParent()) : null;
        String denial = utils.Rbac.authorizeTaskCreate(roles, task, parent);
        if (denial != null) {
            utils.RequestUtils.writeJsonError(response, HttpServletResponse.SC_FORBIDDEN, denial);
            return;
        }

        int nb = taskDAO.addTask(task);

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();
        if (nb > 0) {
            out.print("{\"message\":\"success\",\"idTask\":" + task.getIdTask() + "}");
        } else {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"message\":\"error\"}");
        }
    }
}
