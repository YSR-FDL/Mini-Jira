package controlers.teams;

import jakarta.servlet.ServletConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import structures_DAO.TeamDao;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;

import com.google.gson.Gson;

import classes.Team;

@WebServlet("/CreateTeam")
public class CreateTeam extends HttpServlet {
	private static final long serialVersionUID = 1L;
    TeamDao TDAO;
    public CreateTeam() {
        super();
    }

	public void init(ServletConfig config) throws ServletException {
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
        Gson gson = new Gson();
        System.out.println("Ta fin a sahbi, ra wasslatni lbar9iya");
        
        Team team = gson.fromJson(sb.toString(), Team.class);
        int nb = TDAO.createTeam(team);
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();
        if(nb == 0) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"message\":\"error\"}");
        }
        else {
        	out.print(gson.toJson(team));
        }
	}

}
