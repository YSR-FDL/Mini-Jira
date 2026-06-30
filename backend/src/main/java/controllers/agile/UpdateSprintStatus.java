package controllers.agile;

import jakarta.servlet.ServletConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import structures_DAO.SprintDAO;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;

import com.google.gson.Gson;
import com.google.gson.JsonObject;

@WebServlet("/UpdateSprintStatus")
public class UpdateSprintStatus extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private SprintDAO sprintDAO;
    private structures_DAO.ProjectDAO projectDAO;

    @Override
    public void init(ServletConfig config) throws ServletException {
        sprintDAO = new SprintDAO();
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

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        if (body == null || !body.has("sprintId") || body.get("sprintId").isJsonNull()
                || !body.has("status") || body.get("status").isJsonNull()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"message\":\"error\",\"error\":\"Missing sprintId or status\"}");
            return;
        }

        int sprintId;
        try {
            sprintId = body.get("sprintId").getAsInt();
        } catch (NumberFormatException | UnsupportedOperationException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"message\":\"error\",\"error\":\"Invalid sprintId\"}");
            return;
        }

        // RBAC: starting/closing a sprint is a Scrum Master action.
        Integer requesterId = utils.RequestUtils.getRequesterId(body);
        if (requesterId == null) {
            utils.RequestUtils.writeJsonError(response, HttpServletResponse.SC_UNAUTHORIZED, "Utilisateur non identifié.");
            return;
        }
        classes.Project project = projectDAO.getProjectById(sprintDAO.getProjectIdBySprint(sprintId));
        utils.Rbac.Roles roles = utils.Rbac.resolve(requesterId, project, null);
        String denial = utils.Rbac.authorizeSprintManagement(roles);
        if (denial != null) {
            utils.RequestUtils.writeJsonError(response, HttpServletResponse.SC_FORBIDDEN, denial);
            return;
        }

        String rawStatus = body.get("status").getAsString();

        // Normalize sprint status to consistent DB values
        String status;
        switch (rawStatus.toLowerCase()) {
            case "active":
            case "actif":
                status = "actif";
                break;
            case "completed":
            case "done":
            case "terminee":
            case "terminé":
                status = "terminee";
                break;
            case "planned":
            case "upcoming":
            case "a venir":
            case "future":
                status = "a venir";
                break;
            default:
                status = rawStatus;
        }

        int nb = sprintDAO.updateSprintStatus(sprintId, status);

        if (nb > 0) {
            out.print("{\"message\":\"success\"}");
        } else if (nb == -1) {
            response.setStatus(HttpServletResponse.SC_CONFLICT);
            out.print("{\"message\":\"error\",\"error\":\"Un sprint est déjà actif pour ce projet.\"}");
        } else {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"message\":\"error\"}");
        }
    }
}
