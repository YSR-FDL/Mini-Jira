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

/**
 * SubmitDeliverable — Le développeur dépose le lien de son livrable (dépôt
 * GitHub) lorsqu'il termine une sous-tâche qui lui est assignée.
 * Attend : { "taskId": 5, "lienLivrable": "https://github.com/...", "requesterId": 3 }
 * Un lien vide ou absent retire le livrable.
 */
@WebServlet("/SubmitDeliverable")
public class SubmitDeliverable extends HttpServlet {
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

        if (body == null || !body.has("taskId") || body.get("taskId").isJsonNull()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"message\":\"error\",\"error\":\"Missing taskId\"}");
            return;
        }

        int taskId = body.get("taskId").getAsInt();
        String lienLivrable = (body.has("lienLivrable") && !body.get("lienLivrable").isJsonNull())
                ? body.get("lienLivrable").getAsString().trim() : null;
        if (lienLivrable != null && lienLivrable.isEmpty()) {
            lienLivrable = null;
        }

        // Validation du format : doit être une URL GitHub valide.
        if (lienLivrable != null && !lienLivrable.matches("^https?://(www\\.)?github\\.com/[a-zA-Z0-9_.-]+/[a-zA-Z0-9_.-]+(/.*)?$")) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"message\":\"error\",\"error\":\"Lien de livrable invalide (URL GitHub attendue).\"}");
            return;
        }

        // RBAC : seul le développeur propriétaire de la sous-tâche peut déposer le livrable.
        Integer requesterId = utils.RequestUtils.getRequesterId(body);
        if (requesterId == null) {
            utils.RequestUtils.writeJsonError(response, HttpServletResponse.SC_UNAUTHORIZED, "Utilisateur non identifié.");
            return;
        }
        classes.Task existing = taskDAO.getTaskById(taskId);
        if (existing == null) {
            utils.RequestUtils.writeJsonError(response, HttpServletResponse.SC_BAD_REQUEST, "Tâche introuvable.");
            return;
        }
        classes.Project project = projectDAO.getProjectById(existing.getIdProject());
        utils.Rbac.Roles roles = utils.Rbac.resolve(requesterId, project, teamDao);
        classes.Task parent = (existing.getIdParent() != null)
                ? taskDAO.getTaskById(existing.getIdParent()) : null;
        boolean isRemoval = (lienLivrable == null);
        String denial = utils.Rbac.authorizeDeliverableSubmit(roles, existing, parent, isRemoval);
        if (denial != null) {
            utils.RequestUtils.writeJsonError(response, HttpServletResponse.SC_FORBIDDEN, denial);
            return;
        }

        int nb = taskDAO.updateDeliverable(taskId, lienLivrable);

        if (nb > 0) {
            out.print("{\"message\":\"success\"}");
        } else {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"message\":\"error\"}");
        }
    }
}
