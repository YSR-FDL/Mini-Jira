package controllers.teams;

import jakarta.servlet.ServletConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import structures_DAO.ProjectDAO;
import structures_DAO.TeamDao;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

import com.google.gson.Gson;

import classes.Project;
import classes.Team;

@WebServlet("/GetProjectsByTeam")
public class GetProjectsByTeam extends HttpServlet {
	private static final long serialVersionUID = 1L;
    public GetProjectsByTeam() {
        super();
    }
    ProjectDAO PDAO;
    public void init(ServletConfig config) throws ServletException {
    	PDAO = new ProjectDAO();
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
        
        int idTeam = Integer.parseInt(request.getParameter("idTeam"));
        List<Project> projects = PDAO.getProjectsByTeam(idTeam);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        Gson gson = new Gson();
        response.getWriter().write(gson.toJson(projects));
    }
}
