package structures_DAO;

import java.security.Timestamp;
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
	    String sql = "insert into projects(nom_projet, cle, etats, idCreateur, idSM, idPO, idTeam, date_creation) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_DATE)";
	    try {
	        PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql);
	        String etatsString = String.join(",", project.getEtats());
	        ps.setString(1, project.getNomProjet());
	        ps.setString(2, project.getCle());
	        ps.setString(3, etatsString);
	        ps.setInt(4, project.getIdCreateur());
	        ps.setInt(5, project.getIdSM() > 0 ? project.getIdSM() : project.getIdCreateur());
	        ps.setInt(6, project.getIdPO() > 0 ? project.getIdPO() : project.getIdCreateur());
	        ps.setInt(7, project.getIdTeam());
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
		    String sql = "select distinct p.* from projects p left join appartenance_equipe ae on p.idTeam = ae.id_equipe "
		    		+ "where p.idCreateur = ? or p.idSM = ? or p.idPO = ? or ae.id_utilisateur = ? order by p.date_creation desc;";
		    try {
		        PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql);
		        ps.setInt(1, idUser);
		        ps.setInt(2, idUser);
		        ps.setInt(3, idUser);
		        ps.setInt(4, idUser);
		        ResultSet rs = ps.executeQuery();
		        while(rs.next()) {
		            Project project = new Project();
		            project.setIdProject(rs.getInt("id_project"));
		            project.setNomProjet(rs.getString("nom_projet"));
		            project.setCle(rs.getString("cle"));
		            java.sql.Date d = rs.getDate("date_creation");
		            project.setDateCreation(d != null ? d.toString() : "");
		            project.setIdCreateur(rs.getInt("idCreateur"));
		            project.setArchived(rs.getBoolean("isArchived"));
		            project.setIdTeam(rs.getInt("idTeam"));
		            project.setIdSM(rs.getInt("idSM"));
		            project.setIdPO(rs.getInt("idPO"));
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
				java.sql.Date d = rs.getDate("date_creation");
				project.setDateCreation(d != null ? d.toString() : "");
				project.setIdCreateur(rs.getInt("idCreateur"));
				project.setArchived(rs.getBoolean("isArchived"));
				project.setIdTeam(rs.getInt("idTeam"));
				project.setIdSM(rs.getInt("idSM"));
				project.setIdPO(rs.getInt("idPO"));
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

	public int updateProject(Project project) {
	    int nb = 0;
	    DBInteraction.connect();
	    String sql = "UPDATE projects SET nom_projet = ?, cle = ?, idSM = ?, idPO = ? WHERE id_project = ?";
	    try {
	        PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql);
	        ps.setString(1, project.getNomProjet());
	        ps.setString(2, project.getCle());
	        ps.setInt(3, project.getIdSM());
	        ps.setInt(4, project.getIdPO());
	        ps.setInt(5, project.getIdProject());
	        nb = ps.executeUpdate();
	        ps.close();
	    }
	    catch(SQLException e) {
	        e.printStackTrace();
	    }
	    DBInteraction.disconnect();
	    return nb;
	}

	public int archiveProject(int projectId, boolean isArchived) {
	    int nb = 0;
	    DBInteraction.connect();
	    String sql = "UPDATE projects SET isArchived = ? WHERE id_project = ?";
	    try {
	        PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql);
	        ps.setBoolean(1, isArchived);
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

	public int deleteProject(int projectId) {
	    int nb = 0;
	    DBInteraction.connect();
	    String sql = "DELETE FROM projects WHERE id_project = ?";
	    try {
	        PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql);
	        ps.setInt(1, projectId);
	        nb = ps.executeUpdate();
	        ps.close();
	    }
	    catch(SQLException e) {
	        e.printStackTrace();
	    }
	    DBInteraction.disconnect();
	    return nb;
	}

	public int assignTeamToProject(int projectId, int idTeam) {
	    int nb = 0;
	    DBInteraction.connect();
	    String sql = "UPDATE projects SET idTeam = ? WHERE id_project = ?";
	    try {
	        PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql);
	        if (idTeam > 0) {
	            ps.setInt(1, idTeam);
	        } else {
	            ps.setNull(1, java.sql.Types.INTEGER);
	        }
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

	public List<Project> getProjectsByTeam(int idTeam) {
	    List<Project> projects = new ArrayList<>();
	    DBInteraction.connect();
	    String sql = "select * from projects where idTeam = ?";
	    try {
	        PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql);
	        ps.setInt(1, idTeam);
	        ResultSet rs = ps.executeQuery();
	        while(rs.next()) {
	            Project project = new Project();
	            project.setIdProject(rs.getInt("id_project"));
	            project.setNomProjet(rs.getString("nom_projet"));
	            project.setCle(rs.getString("cle"));
	            java.sql.Timestamp d = rs.getTimestamp("date_creation");
	            project.setDateCreation(d != null ? d.toString() : "");
	            project.setArchived(rs.getBoolean("isArchived"));
	            project.setIdTeam(rs.getInt("idTeam"));
	            project.setIdSM(rs.getInt("idSM"));
	            project.setIdPO(rs.getInt("idPO"));
	            project.setIdCreateur(rs.getInt("idCreateur"));
	            projects.add(project);
	        }
	        rs.close();
	        ps.close();
	    }
	    catch(Exception e) {
	        e.printStackTrace();
	    }
	    DBInteraction.disconnect();
	    return projects;
	}
	
	public static void main(String[] args) {
		ProjectDAO p = new ProjectDAO();
		System.out.println(p.getProjectById(1).toString());
	}
}
