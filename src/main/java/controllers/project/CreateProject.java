package controllers.project;

import jakarta.servlet.ServletConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import structures_DAO.ProjectDAO;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import com.google.gson.Gson;
import classes.Project;

@WebServlet("/CreateProject")
public class CreateProject extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
	ProjectDAO PDAO;
    public CreateProject() {
        super();
    }

	public void init(ServletConfig config) throws ServletException {
		PDAO = new ProjectDAO();
	}
	
    @Override
    protected void doOptions(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
    	 response.setHeader("Access-Control-Allow-Origin",  "*");
    	 response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    	 response.setHeader("Access-Control-Allow-Headers", "Content-Type");
    	 response.setStatus(HttpServletResponse.SC_OK);
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
		Project P_recu = gson.fromJson(json, Project.class);
		int nb = PDAO.addProject(P_recu);
		response.setCharacterEncoding("UTF-8");
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
