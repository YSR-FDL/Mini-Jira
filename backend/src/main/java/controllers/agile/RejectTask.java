package controllers.agile;

import jakarta.servlet.ServletConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import structures_DAO.TaskDAO;
import structures_DAO.ProjectDAO;
import structures_DAO.TeamDao;
import structures_DAO.ActivityDAO;
import structures_DAO.CommentaireDAO;
import classes.Commentaire;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;

import com.google.gson.Gson;
import com.google.gson.JsonObject;

@WebServlet("/RejectTask")
public class RejectTask extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private TaskDAO taskDAO;
    private ProjectDAO projectDAO;
    private TeamDao teamDao;
    private CommentaireDAO commentaireDAO;

    @Override
    public void init(ServletConfig config) throws ServletException {
        taskDAO = new TaskDAO();
        projectDAO = new ProjectDAO();
        teamDao = new TeamDao();
        commentaireDAO = new CommentaireDAO();
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

        if (body == null || !body.has("taskId") || body.get("taskId").isJsonNull()
                || !body.has("reason") || body.get("reason").isJsonNull()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"message\":\"error\",\"error\":\"Missing taskId or reason\"}");
            return;
        }

        int taskId = body.get("taskId").getAsInt();
        String reason = body.get("reason").getAsString();

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

        // Seul le PO peut rejeter une Story formellement
        if (!roles.isPO) {
            utils.RequestUtils.writeJsonError(response, HttpServletResponse.SC_FORBIDDEN, "Seul le Product Owner peut rejeter une user story.");
            return;
        }

        if ("REJECTED".equals(existing.getPoValidation())) {
            utils.RequestUtils.writeJsonError(response, HttpServletResponse.SC_BAD_REQUEST, "La tâche est déjà rejetée.");
            return;
        }

        int nb = taskDAO.updateTaskValidation(taskId, "REJECTED");

        if (nb > 0) {
            // Ajouter le motif du rejet comme commentaire
            Commentaire comment = new Commentaire();
            comment.setIdTask(taskId);
            comment.setIdAuteur(requesterId);
            comment.setContenu("Rejeté : " + reason);
            commentaireDAO.add(comment);

            new ActivityDAO().logActivity(
                taskId,
                existing.getIdProject(),
                requesterId,
                "PO_VALIDATION_REJECTED",
                existing.getPoValidation() != null ? existing.getPoValidation() : "NONE",
                "REJECTED"
            );
            out.print("{\"message\":\"success\", \"newValidation\":\"REJECTED\"}");
        } else {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print("{\"message\":\"error\"}");
        }
    }
}
