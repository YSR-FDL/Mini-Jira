package controllers.agile;

import jakarta.servlet.ServletConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import structures_DAO.TaskDAO;
import structures_DAO.ProjectDAO;
import classes.Project;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.google.gson.Gson;

@WebServlet("/GetSprintTasks")
public class GetSprintTasks extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private TaskDAO taskDAO;
    private ProjectDAO projectDAO;

    @Override
    public void init(ServletConfig config) throws ServletException {
        taskDAO = new TaskDAO();
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
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");

        int sprintId = Integer.parseInt(request.getParameter("sprintId"));
        List<Map<String, Object>> tasks = taskDAO.getSprintTasks(sprintId);

        Map<String, Object> result = new HashMap<>();
        result.put("tasks", tasks);

        String projectIdParam = request.getParameter("projectId");

        // Dynamic Column Mapping Logic
        if (projectIdParam != null && !projectIdParam.isEmpty()) {
            int projectId = Integer.parseInt(projectIdParam);
            Project project = projectDAO.getProjectById(projectId);

            if (project != null && project.getEtats() != null && !project.getEtats().isEmpty()) {
                List<Map<String, String>> dynamicColumns = new ArrayList<>();
                for (String etat : project.getEtats()) {
                    String columnName = etat.trim();
                    // ID and Title must be identical to match Task.statut exactly
                    dynamicColumns.add(createColumn(columnName, columnName));
                }
                result.put("columns", dynamicColumns);
            } else {
                result.put("columns", getDefaultColumns());
            }
        } else {
            result.put("columns", getDefaultColumns());
        }

        Gson gson = new Gson();
        String json = gson.toJson(result);

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();
        out.print(json);
    }

    private List<Map<String, String>> getDefaultColumns() {
        return Arrays.asList(
                createColumn("todo", "À Faire"),
                createColumn("in-progress", "En Cours"),
                createColumn("review", "En Revue"),
                createColumn("done", "Terminé")
        );
    }

    private Map<String, String> createColumn(String id, String title) {
        Map<String, String> col = new HashMap<>();
        col.put("id", id);
        col.put("title", title);
        return col;
    }
}