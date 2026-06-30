package controllers.teams;

import jakarta.servlet.ServletConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import structures_DAO.TeamDao;
import structures_DAO.UtilisateurDAO;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

import com.google.gson.Gson;

import classes.Team;
import classes.Utilisateur;

@WebServlet("/GetUserTeams")
public class GetUserTeams extends HttpServlet {
	private static final long serialVersionUID = 1L;
	UtilisateurDAO UDAO;
	TeamDao TDAO;
    public GetUserTeams() {
        super();
    }

	public void init(ServletConfig config) throws ServletException {
		UDAO = new UtilisateurDAO();
		TDAO = new TeamDao();
	}
	
	protected void doOptions(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		 response.setHeader("Access-Control-Allow-Origin",  "*");
	   	 response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
	   	 response.setHeader("Access-Control-Allow-Headers", "Content-Type");
	   	 response.setStatus(HttpServletResponse.SC_OK);
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		response.setHeader("Access-Control-Allow-Origin",  "*");
	   	response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
	   	response.setHeader("Access-Control-Allow-Headers", "Content-Type");
	   	BufferedReader reader = request.getReader();
		StringBuilder sb = new StringBuilder();
		String line;
		while((line = reader.readLine()) != null) {
			sb.append(line);
		}
		
		String json = sb.toString();
		Gson gson = new Gson();
		Utilisateur user = gson.fromJson(json, Utilisateur.class);
        List<Team> teams = TDAO.getUserTeams(user.getId(), user.getType_utilisateur());
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();
        out.print(gson.toJson(teams));
	}

}
