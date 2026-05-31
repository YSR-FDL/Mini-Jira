package controlers.teams;

import jakarta.servlet.ServletConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import structures_DAO.TeamDao;

import java.io.IOException;
import java.io.PrintWriter;

import com.google.gson.Gson;

import classes.Team;

@WebServlet("/GetTeam")
public class GetTeam extends HttpServlet {
    private static final long serialVersionUID = 1L;
    TeamDao TDAO;
    public void init(ServletConfig config) throws ServletException {
        TDAO = new TeamDao();
    }
    
    protected void doOptions(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");
        response.setStatus(HttpServletResponse.SC_OK);
    }
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");
        
        int idTeam = Integer.parseInt(request.getParameter("id"));
        Team team = TDAO.getTeamById(idTeam);
        Gson gson = new Gson();
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();
        out.print(gson.toJson(team));
    }
}