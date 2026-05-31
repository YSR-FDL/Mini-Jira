package controlers;

import jakarta.servlet.ServletConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import structures_DAO.UtilisateurDAO;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.UUID;

import com.google.gson.Gson;

import classes.Utilisateur;

@WebServlet("/AddUser")
public class AddUser extends HttpServlet {
	private static final long serialVersionUID = 1L;
	UtilisateurDAO UDAO;
	
    public AddUser() {
    	super();
    }
    
    @Override
    protected void doOptions(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
    	 response.setHeader("Access-Control-Allow-Origin",  "*");
    	 response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    	 response.setHeader("Access-Control-Allow-Headers", "Content-Type");
    	 response.setStatus(HttpServletResponse.SC_OK);
    }
    
	public void init(ServletConfig config) throws ServletException {
    	UDAO = new UtilisateurDAO();
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		response.setHeader("Access-Control-Allow-Origin", "*");
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
		String login = user.getNom().substring(0,3) + user.getPrenom().substring(0,3) + UUID.randomUUID().toString().substring(0,8);
		int nb = UDAO.inscription(
				user.getNom(),
				user.getPrenom(),
				user.getEmail(),
				login,
				user.getPassword(),
				user.getExperiences(),
				user.getType_utilisateur()
		);
		
		response.setContentType("application/json");

		PrintWriter out = response.getWriter();
		if(nb > 0) {
			out.print("{\"message\":\"success\"}");
		}
		else {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			out.print("{\"message\":\"error\"}");
		}
	}
}
