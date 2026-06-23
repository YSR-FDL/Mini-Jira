package controllers.agile;

import jakarta.servlet.ServletConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import structures_DAO.BugReportDAO;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.google.gson.Gson;

/**
 * GetBugReports — Returns all Bug-type tasks from the user's projects,
 * grouped by project. Used by the Bug Reports page.
 *
 * Query params:
 *   - userId (required): the logged-in user's ID
 *
 * Response:
 *   { "projects": [ { id, title, status, progress, reports: [...] } ] }
 */
@WebServlet("/GetBugReports")
public class GetBugReports extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private BugReportDAO bugReportDAO;

    @Override
    public void init(ServletConfig config) throws ServletException {
        bugReportDAO = new BugReportDAO();
    }

    @Override
    protected void doOptions(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");
        response.setStatus(HttpServletResponse.SC_OK);
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");

        String userIdParam = request.getParameter("userId");
        if (userIdParam == null || userIdParam.isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().print("{\"error\":\"Missing required parameter: userId\"}");
            return;
        }

        int userId;
        try {
            userId = Integer.parseInt(userIdParam);
        } catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().print("{\"error\":\"Invalid userId format\"}");
            return;
        }

        List<Map<String, Object>> projects = bugReportDAO.getBugReportsByUser(userId);

        Map<String, Object> result = new HashMap<>();
        result.put("projects", projects);

        Gson gson = new Gson();
        String json = gson.toJson(result);

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();
        out.print(json);
    }
}
