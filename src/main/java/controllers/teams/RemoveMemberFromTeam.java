package controllers.teams;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import structures_DAO.TeamDao;

import java.io.IOException;

import com.google.gson.Gson;
import com.google.gson.JsonObject;

@WebServlet("/RemoveMemberFromTeam")
public class RemoveMemberFromTeam extends HttpServlet {
	private static final long serialVersionUID = 1L;
	TeamDao TDAO;
    public RemoveMemberFromTeam() {
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
        JsonObject json = gson.fromJson(request.getReader(), JsonObject.class);
        int idTeam = json.get("idTeam").getAsInt();
        int idUser = json.get("idUser").getAsInt();
        int nb = TDAO.removeMemberFromTeam(idTeam, idUser);
        if(nb > 0) {
            response.getWriter().print("{\"message\":\"success\"}");
        }
        else {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().print("{\"message\":\"error\"}");
        }
	}

}
