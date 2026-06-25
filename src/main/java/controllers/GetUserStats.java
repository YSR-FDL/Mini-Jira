package controllers;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;

import com.google.gson.Gson;

import connexion_BD.DBInteraction;
import structures_DAO.TaskDAO;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet("/GetUserStats")
public class GetUserStats extends HttpServlet {
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

        Integer idUser = utils.RequestUtils.parseIntOrNull(request.getParameter("idUser"));
        if (idUser == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().print("{\"error\": \"Missing or invalid idUser\"}");
            return;
        }

        Map<String, Integer> stats = new HashMap<>();
        DBInteraction.connect();
        try {
            // 1. tachesCount
            String sqlTaches = "SELECT COUNT(*) FROM tasks WHERE id_assignee = ?";
            PreparedStatement ps1 = DBInteraction.getConn().prepareStatement(sqlTaches);
            ps1.setInt(1, idUser);
            ResultSet rs1 = ps1.executeQuery();
            int tachesCount = rs1.next() ? rs1.getInt(1) : 0;
            rs1.close(); ps1.close();
            stats.put("tachesCount", tachesCount);

            // 2. projetsCount
            String sqlProjets = "SELECT COUNT(DISTINCT p.id_project) FROM projects p " +
                                "LEFT JOIN appartenance_equipe ae ON p.idTeam = ae.id_equipe " +
                                "WHERE ae.id_utilisateur = ? OR p.idCreateur = ? OR p.idSM = ? OR p.idPO = ?";
            PreparedStatement ps2 = DBInteraction.getConn().prepareStatement(sqlProjets);
            ps2.setInt(1, idUser); ps2.setInt(2, idUser); ps2.setInt(3, idUser); ps2.setInt(4, idUser);
            ResultSet rs2 = ps2.executeQuery();
            int projetsCount = rs2.next() ? rs2.getInt(1) : 0;
            rs2.close(); ps2.close();
            stats.put("projetsCount", projetsCount);

            // 3. collabsCount
            String sqlCollabs = "SELECT COUNT(DISTINCT ae2.id_utilisateur) FROM appartenance_equipe ae2 " +
                                "WHERE ae2.id_equipe IN (SELECT ae.id_equipe FROM appartenance_equipe ae WHERE ae.id_utilisateur = ?)";
            PreparedStatement ps3 = DBInteraction.getConn().prepareStatement(sqlCollabs);
            ps3.setInt(1, idUser);
            ResultSet rs3 = ps3.executeQuery();
            int collabsCount = rs3.next() ? rs3.getInt(1) : 0;
            rs3.close(); ps3.close();
            stats.put("collabsCount", collabsCount);

            // 4. score
            String sqlScore = "SELECT COUNT(*) FROM tasks t WHERE t.id_assignee = ? AND (LOWER(t.statut) LIKE '%termin%' OR LOWER(t.statut) LIKE '%done%')";
            PreparedStatement ps4 = DBInteraction.getConn().prepareStatement(sqlScore);
            ps4.setInt(1, idUser);
            ResultSet rs4 = ps4.executeQuery();
            int completedTasksCount = rs4.next() ? rs4.getInt(1) : 0;
            rs4.close(); ps4.close();
            stats.put("score", completedTasksCount * 10);
            stats.put("completedTasks", completedTasksCount);

        } catch (SQLException e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            return;
        } finally {
            DBInteraction.disconnect();
        }

        // Fetch User Tasks for Contributions
        TaskDAO taskDAO = new TaskDAO();
        List<Map<String, Object>> tasks = taskDAO.getUserTasks(idUser);
        
        List<Map<String, Object>> contributions = new ArrayList<>();
        List<Map<String, Object>> completedContributions = new ArrayList<>();

        for (Map<String, Object> t : tasks) {
            Map<String, Object> contrib = new HashMap<>();
            contrib.put("id", t.get("idTask"));
            contrib.put("title", t.get("titre"));
            contrib.put("description", "Projet: " + t.get("nomProjet"));
            contrib.put("dueDate", t.get("dateCreation")); // Using creation date as fallback

            String status = t.get("statut") != null ? (String) t.get("statut") : "todo";
            String etatsStr = (String) t.get("etats");
            List<String> etatsList = new ArrayList<>();
            if (etatsStr != null && !etatsStr.isEmpty()) {
                for (String e : etatsStr.split(",")) {
                    etatsList.add(e.trim().toLowerCase());
                }
            }

            int index = -1;
            int total = etatsList.size();
            if (total > 0) {
                 index = etatsList.indexOf(status.trim().toLowerCase());
            }

            int progress = 0;
            String statusBg = "#DBEAFE"; // Default blue
            String statusColor = "#2563EB";
            String progressColor = "#2563EB";
            boolean isCompleted = false;

            if (total == 0) {
                // Fallback to keyword heuristic only if project has no states defined
                String s = status.toLowerCase();
                if (s.contains("termin") || s.contains("done") || s.contains("releas")) {
                    progress = 100; isCompleted = true;
                } else if (s.contains("revue") || s.contains("review") || s.contains("test")) {
                    progress = 80;
                } else if (s.contains("cours") || s.contains("progress")) {
                    progress = 50;
                } else {
                    progress = 0;
                }
            } else {
                if (index == -1) {
                    // Task status is not found in the project's states.
                    // The frontend board forces unmatched tasks into the first column.
                    progress = 0;
                    status = etatsStr.split(",")[0].trim(); // Display it as the first column
                } else {
                    if (total > 1) {
                        progress = (int) Math.round(((double) index / (total - 1)) * 100);
                    } else {
                        progress = 100;
                    }
                    if (index == total - 1) {
                        isCompleted = true;
                    }
                }
            }

            if (isCompleted || progress == 100) {
                statusBg = "#DCFCE7";
                statusColor = "#16A34A";
                progressColor = "#16A34A";
                completedContributions.add(contrib);
            } else if (progress == 0) {
                statusBg = "#fef3c7";
                statusColor = "#d97706";
                progressColor = "#d97706";
                contributions.add(contrib);
            } else {
                statusBg = "#DBEAFE";
                statusColor = "#2563EB";
                progressColor = "#2563EB";
                contributions.add(contrib);
            }

            contrib.put("status", status); // Display real state name
            contrib.put("statusBg", statusBg);
            contrib.put("statusColor", statusColor);
            contrib.put("progress", progress);
            contrib.put("progressColor", progressColor);
        }

        Map<String, Object> result = new HashMap<>();
        result.putAll(stats);
        result.put("contributions", contributions);
        result.put("completedContributions", completedContributions);

        Gson gson = new Gson();
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();
        out.print(gson.toJson(result));
    }
}
