package controllers.agile;

import jakarta.servlet.ServletConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import structures_DAO.MetricsDAO;
import structures_DAO.SprintDAO;

import java.io.IOException;
import java.io.PrintWriter;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.google.gson.Gson;
import classes.Sprint;

/**
 * GetDashboardMetrics — Packages all aggregated analytics into one JSON response.
 * Returns:
 *   - totalIssues, completed, inProgress, overdue (project-level)
 *   - activeSprintSummary (name, dates, days remaining, distribution)
 *   - byType breakdown
 *   - byPriority breakdown
 *   - assigneeWorkload
 */
@WebServlet("/GetDashboardMetrics")
public class GetDashboardMetrics extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private MetricsDAO metricsDAO;
    private SprintDAO sprintDAO;

    @Override
    public void init(ServletConfig config) throws ServletException {
        metricsDAO = new MetricsDAO();
        sprintDAO = new SprintDAO();
    }

    @Override
    protected void doOptions(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");
        response.setStatus(HttpServletResponse.SC_OK);
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");

        String projectIdParam = request.getParameter("projectId");
        if (projectIdParam == null || projectIdParam.isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().print("{\"error\":\"Missing required parameter: projectId\"}");
            return;
        }

        int projectId;
        try {
            projectId = Integer.parseInt(projectIdParam);
        } catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().print("{\"error\":\"Invalid projectId format\"}");
            return;
        }

        // 1. Project-level metrics
        Map<String, Object> projectMetrics = metricsDAO.getProjectMetrics(projectId);

        // 2. Active sprint summary
        List<Sprint> sprints = sprintDAO.getProjectSprints(projectId);
        Sprint activeSprint = null;
        for (Sprint s : sprints) {
            if ("active".equalsIgnoreCase(s.getStatut()) || "actif".equalsIgnoreCase(s.getStatut())) {
                activeSprint = s;
                break;
            }
        }

        Map<String, Object> result = new HashMap<>(projectMetrics);

        if (activeSprint != null) {
            Map<String, Object> sprintSummary = metricsDAO.getSprintProgress(activeSprint.getIdSprint());
            sprintSummary.put("sprintName", activeSprint.getNomSprint());
            sprintSummary.put("startDate", activeSprint.getDateDebut());
            sprintSummary.put("endDate", activeSprint.getDateFin());

            // Calculate days remaining
            try {
                LocalDate endDate = LocalDate.parse(activeSprint.getDateFin());
                long daysRemaining = ChronoUnit.DAYS.between(LocalDate.now(), endDate);
                sprintSummary.put("daysRemaining", Math.max(0, daysRemaining));
            } catch (Exception e) {
                sprintSummary.put("daysRemaining", 0);
            }

            result.put("activeSprintSummary", sprintSummary);
        } else {
            result.put("activeSprintSummary", null);
        }

        // 3. Type breakdown
        result.put("byType", metricsDAO.getTypeBreakdown(projectId));

        // 4. Priority breakdown
        result.put("byPriority", metricsDAO.getPriorityBreakdown(projectId));

        // 5. Assignee workload
        result.put("assigneeWorkload", metricsDAO.getAssigneeWorkload(projectId));

        Gson gson = new Gson();
        String json = gson.toJson(result);

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();
        out.print(json);
    }
}
