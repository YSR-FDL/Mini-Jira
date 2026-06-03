package structures_DAO;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import classes.Project;
import connexion_BD.DBInteraction;

public class ProjectDAO {
	public int addProject(Project project) {
	    int nb = 0;
	    DBInteraction.connect();
	    String sql = "insert into projects(nom_projet, cle, etats, idCreateur) VALUES (?, ?, ?, ?)";
	    try {
	        PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql);
	        String etatsString = String.join(",", project.getEtats());
	        ps.setString(1, project.getNomProjet());
	        ps.setString(2, project.getCle());
	        ps.setString(3, etatsString);
	        ps.setInt(4, project.getIdCreateur());
	        nb = ps.executeUpdate();
	        ps.close();
	    }
	    catch(SQLException e) {
	        e.printStackTrace();
	    }
	    DBInteraction.disconnect();
	    return nb;
	}

	public List<Project> getUserProjects(int idUser) {
	    List<Project> projects = new ArrayList<Project>();
	    DBInteraction.connect();
	    String sql = "select * from projects where idCreateur = ? order by date_creation desc;";
	    try {
	        PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql);
	        ps.setInt(1, idUser);
	        ResultSet rs = ps.executeQuery();
	        while(rs.next()) {
	            Project project = new Project();
	            project.setIdProject(rs.getInt("id_project"));
	            project.setNomProjet(rs.getString("nom_projet"));
	            project.setCle(rs.getString("cle"));
	            project.setDateCreation(rs.getDate("date_creation").toString());
	            project.setIdCreateur(rs.getInt("idCreateur"));
	            project.setArchived(rs.getBoolean("isArchived"));
	            String etatsString = rs.getString("etats");
	            if(etatsString != null && !etatsString.isEmpty()) {
	                project.setEtats(
	                    Arrays.asList(etatsString.split(","))
	                );
	            }
	            projects.add(project);
	        }
	        rs.close();
	        ps.close();
	    }
	    catch(SQLException e) {
	        e.printStackTrace();
	    } 
	    DBInteraction.disconnect();
	    return projects;
	}
	
}
