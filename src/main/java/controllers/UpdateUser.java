package controllers;
//test
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

import com.google.gson.Gson;

import classes.Utilisateur;

@WebServlet("/UpdateUser")
public class UpdateUser extends HttpServlet {
	private static final long serialVersionUID = 1L;
    UtilisateurDAO UDAO;
    public UpdateUser() {
        super();  
    }
    
	public void init(ServletConfig config) throws ServletException {
		UDAO = new UtilisateurDAO();
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
		Utilisateur user_recu = gson.fromJson(json, Utilisateur.class);
		System.out.println(user_recu);
		int nb = UDAO.modifierInfosPersonnels(user_recu.getId(), user_recu.getNom(), user_recu.getPrenom(), user_recu.getEmail(), user_recu.getExperiences());
		Utilisateur user_updated = UDAO.getUserById(user_recu.getId());
		PrintWriter out = response.getWriter();
		response.setContentType("application/json");
		if(nb == 0) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			out.print("{\"message\":\"error\"}");
		} else {
			out.print(gson.toJson(user_updated));
		}
	}

}
