package controllers;

import jakarta.servlet.ServletConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import connexion_BD.DBInteraction;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.google.gson.Gson;

@WebServlet("/GlobalSearch")
public class GlobalSearch extends HttpServlet {
    private static final long serialVersionUID = 1L;

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

        String query = request.getParameter("q");
        if (query == null) {
            query = "";
        }
        query = "%" + query.toLowerCase() + "%";

        Map<String, Object> results = new HashMap<>();
        List<Map<String, Object>> tasks = new ArrayList<>();
        List<Map<String, Object>> projects = new ArrayList<>();
        List<Map<String, Object>> teams = new ArrayList<>();

        Connection conn = DBInteraction.getConn();
        try {
            // Search Tasks
            String sqlTasks = "SELECT id_task, titre, description, statut, type_tache, id_project FROM tasks WHERE LOWER(titre) LIKE ? OR LOWER(description) LIKE ? LIMIT 30";
            try (PreparedStatement ps = conn.prepareStatement(sqlTasks)) {
                ps.setString(1, query);
                ps.setString(2, query);
                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) {
                        Map<String, Object> t = new HashMap<>();
                        t.put("id", rs.getInt("id_task"));
                        t.put("title", rs.getString("titre"));
                        t.put("description", rs.getString("description"));
                        t.put("status", rs.getString("statut"));
                        t.put("type", rs.getString("type_tache"));
                        t.put("projectId", rs.getInt("id_project"));
                        tasks.add(t);
                    }
                }
            }

            // Search Projects
            String sqlProjects = "SELECT id_project, nom_projet, cle FROM projects WHERE LOWER(nom_projet) LIKE ? OR LOWER(cle) LIKE ? LIMIT 15";
            try (PreparedStatement ps = conn.prepareStatement(sqlProjects)) {
                ps.setString(1, query);
                ps.setString(2, query);
                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) {
                        Map<String, Object> p = new HashMap<>();
                        p.put("id", rs.getInt("id_project"));
                        p.put("name", rs.getString("nom_projet"));
                        p.put("key", rs.getString("cle"));
                        projects.add(p);
                    }
                }
            }

            // Search Teams
            String sqlTeams = "SELECT id, nom, objectif FROM equipes WHERE LOWER(nom) LIKE ? OR LOWER(objectif) LIKE ? LIMIT 15";
            try (PreparedStatement ps = conn.prepareStatement(sqlTeams)) {
                ps.setString(1, query);
                ps.setString(2, query);
                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) {
                        Map<String, Object> t = new HashMap<>();
                        t.put("id", rs.getInt("id"));
                        t.put("name", rs.getString("nom"));
                        t.put("objective", rs.getString("objectif"));
                        teams.add(t);
                    }
                }
            }

        } catch (SQLException e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().print("{\"error\":\"Database error\"}");
            return;
        } finally {
            DBInteraction.disconnect();
        }

        results.put("tasks", tasks);
        results.put("projects", projects);
        results.put("teams", teams);

        Gson gson = new Gson();
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();
        out.print(gson.toJson(results));
    }
}
