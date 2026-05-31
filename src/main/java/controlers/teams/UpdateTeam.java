package controlers.teams;

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

@WebServlet("/UpdateTeam")
public class UpdateTeam extends HttpServlet {
	private static final long serialVersionUID = 1L;
	TeamDao TDAO;
    public UpdateTeam() {
        super();
    }
    
    @Override
    public void init() throws ServletException {
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
       
	   Gson gson = new Gson();
       Team team = gson.fromJson(request.getReader(), Team.class);

       int nb = TDAO.updateTeam(team);
       response.setContentType("application/json");
       PrintWriter out = response.getWriter();
       if(nb > 0) {
    	   out.print(gson.toJson(team));
       }
       else {
           response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
           out.print("{\"message\":\"error\"}");
       }
	}

}
