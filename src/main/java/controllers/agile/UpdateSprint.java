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
import classes.Sprint;

/**
 * UpdateSprint — Edit sprint details (name, goal, dates).
 * Does NOT change status (use UpdateSprintStatus for that).
 */
@WebServlet("/UpdateSprint")
public class UpdateSprint extends HttpServlet {
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

    /**
     * Returns an error message if the date range is invalid, or null if valid.
     * Requires both dates in ISO format (yyyy-MM-dd) with end strictly after start.
     */
    private String validateDates(String start, String end) {
        if (start == null || start.trim().isEmpty() || end == null || end.trim().isEmpty()) {
            return "Les dates de début et de fin sont requises.";
        }
        try {
            java.time.LocalDate s = java.time.LocalDate.parse(start.trim());
            java.time.LocalDate e = java.time.LocalDate.parse(end.trim());
            if (!e.isAfter(s)) {
                return "La date de fin doit être postérieure à la date de début.";
            }
        } catch (java.time.format.DateTimeParseException ex) {
            return "Format de date invalide (attendu AAAA-MM-JJ).";
        }
        return null;
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
        Sprint sprint = gson.fromJson(sb.toString(), Sprint.class);

        if (sprint.getIdSprint() == 0) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().print("{\"message\":\"error\",\"error\":\"Missing sprint ID\"}");
            return;
        }

        // RBAC: only the Scrum Master may edit sprints.
        com.google.gson.JsonObject body = gson.fromJson(sb.toString(), com.google.gson.JsonObject.class);
        Integer requesterId = utils.RequestUtils.getRequesterId(body);
        if (requesterId == null) {
            utils.RequestUtils.writeJsonError(response, HttpServletResponse.SC_UNAUTHORIZED, "Utilisateur non identifié.");
            return;
        }
        int projectId = sprint.getIdProject() > 0
                ? sprint.getIdProject()
                : sprintDAO.getProjectIdBySprint(sprint.getIdSprint());
        classes.Project project = projectDAO.getProjectById(projectId);
        utils.Rbac.Roles roles = utils.Rbac.resolve(requesterId, project, null);
        String denial = utils.Rbac.authorizeSprintManagement(roles);
        if (denial != null) {
            utils.RequestUtils.writeJsonError(response, HttpServletResponse.SC_FORBIDDEN, denial);
            return;
        }

        String dateError = validateDates(sprint.getDateDebut(), sprint.getDateFin());
        if (dateError != null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().print("{\"message\":\"error\",\"error\":\"" + dateError + "\"}");
            return;
        }

        int nb = sprintDAO.updateSprint(sprint);

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
