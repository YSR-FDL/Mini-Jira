package controllers.project;

import jakarta.servlet.ServletConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import structures_DAO.ProjectDAO;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import com.google.gson.Gson;
import classes.Project;

@WebServlet("/UpdateProject")
public class UpdateProject extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private ProjectDAO PDAO;

    public void init(ServletConfig config) throws ServletException {
        PDAO = new ProjectDAO();
    }

    @Override
    protected void doOptions(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");
        response.setStatus(HttpServletResponse.SC_OK);
    }

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

        String json = sb.toString();
        Gson gson = new Gson();
        Project project = gson.fromJson(json, Project.class);

        // RBAC: editing project settings / assigning SM & PO is an Administrateur
        // (creator) action. Authorise against the *stored* creator, never the
        // payload, so a caller cannot grant themselves ownership.
        com.google.gson.JsonObject obj = gson.fromJson(json, com.google.gson.JsonObject.class);
        Integer requesterId = utils.RequestUtils.getRequesterId(obj);
        if (requesterId == null) {
            utils.RequestUtils.writeJsonError(response, HttpServletResponse.SC_UNAUTHORIZED, "Utilisateur non identifié.");
            return;
        }
        classes.Project stored = PDAO.getProjectById(project.getIdProject());
        utils.Rbac.Roles roles = utils.Rbac.resolve(requesterId, stored, null);
        String denial = utils.Rbac.authorizeProjectAdmin(roles, "modifier le projet et ses rôles");
        if (denial != null) {
            utils.RequestUtils.writeJsonError(response, HttpServletResponse.SC_FORBIDDEN, denial);
            return;
        }

        int nb = PDAO.updateProject(project);

        response.setCharacterEncoding("UTF-8");
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();
        if (nb > 0) {
            out.print("{\"message\":\"success\"}");
        } else {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"message\":\"error\"}");
        }
    }
}
