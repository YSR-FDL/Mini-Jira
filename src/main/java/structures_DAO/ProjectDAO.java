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

	public Project getProjectById(int projectId) {
		Project project = null;
		DBInteraction.connect();
		String sql = "SELECT * FROM projects WHERE id_project = ?";
		try {
			java.sql.PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql);
			ps.setInt(1, projectId);
			java.sql.ResultSet rs = ps.executeQuery();
			if (rs.next()) {
				project = new classes.Project();
				project.setIdProject(rs.getInt("id_project"));
				project.setNomProjet(rs.getString("nom_projet"));
				project.setCle(rs.getString("cle"));
				project.setDateCreation(rs.getDate("date_creation").toString());
				project.setIdCreateur(rs.getInt("idCreateur"));
				project.setArchived(rs.getBoolean("isArchived"));
				project.setIdTeam(rs.getInt("idTeam"));
				String etatsString = rs.getString("etats");
				if (etatsString != null && !etatsString.isEmpty()) {
					project.setEtats(java.util.Arrays.asList(etatsString.split(",")));
				}
			}
			rs.close();
			ps.close();
		} catch (java.sql.SQLException e) {
			e.printStackTrace();
		}
		DBInteraction.disconnect();
		return project;
	}
	
	public int updateProjectEtats(int projectId, List<String> etats) {
	    int nb = 0;
	    DBInteraction.connect();
	    String sql = "UPDATE projects SET etats = ? WHERE id_project = ?";
	    try {
	        PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql);
	        String etatsString = String.join(",", etats);
	        ps.setString(1, etatsString);
	        ps.setInt(2, projectId);
	        nb = ps.executeUpdate();
	        ps.close();
	    }
	    catch(SQLException e) {
	        e.printStackTrace();
	    }
	    DBInteraction.disconnect();
	    return nb;
	}
}
