package controllers.project;

import java.io.IOException;
import java.io.PrintWriter;
import java.io.BufferedReader;
import java.util.List;
import java.util.Map;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import jakarta.servlet.ServletConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import structures_DAO.ProjectDAO;

@WebServlet("/UpdateProjectStates")
public class UpdateProjectStates extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private ProjectDAO projectDAO;

    @Override
    public void init(ServletConfig config) throws ServletException {
        projectDAO = new ProjectDAO();
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

        StringBuilder jsonBuffer = new StringBuilder();
        String line;
        BufferedReader reader = request.getReader();
        while ((line = reader.readLine()) != null) {
            jsonBuffer.append(line);
        }

        Gson gson = new Gson();
        Map<String, Object> data = gson.fromJson(jsonBuffer.toString(), new TypeToken<Map<String, Object>>(){}.getType());

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        if (data != null && data.containsKey("projectId") && data.containsKey("etats")) {
            int projectId = ((Double) data.get("projectId")).intValue();
            List<String> etats = (List<String>) data.get("etats");

            // RBAC: editing the project's workflow columns is a workspace
            // (Administrateur/creator) action.
            Integer requesterId = (data.get("requesterId") instanceof Double)
                    ? ((Double) data.get("requesterId")).intValue() : null;
            if (requesterId == null) {
                utils.RequestUtils.writeJsonError(response, HttpServletResponse.SC_UNAUTHORIZED, "Utilisateur non identifié.");
                return;
            }
            classes.Project project = projectDAO.getProjectById(projectId);
            utils.Rbac.Roles roles = utils.Rbac.resolve(requesterId, project, null);
            String denial = utils.Rbac.authorizeBoardManagement(roles);
            if (denial != null) {
                utils.RequestUtils.writeJsonError(response, HttpServletResponse.SC_FORBIDDEN, denial);
                return;
            }

            int result = projectDAO.updateProjectEtats(projectId, etats);
            if (result > 0) {
                out.print("{\"message\": \"success\"}");
            } else {
                out.print("{\"message\": \"failure\"}");
            }
        } else {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"error\": \"Missing projectId or etats\"}");
        }
    }
}
