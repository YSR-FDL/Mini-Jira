package structures_DAO;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import classes.Team;
import classes.Utilisateur;
import connexion_BD.DBInteraction;

public class TeamDao {
	public List<Team> getUserTeams(int idUser, String type_utilisateur) {
	    List<Team> teams = new ArrayList<Team>();
	    DBInteraction.connect();
	    String sql = "";
	    if(type_utilisateur.equals("ADMIN")) {
	        sql = "select *, (SELECT COUNT(*) FROM projects p WHERE p.idTeam = equipes.id) as projetsCount from equipes where idCreateur = " + idUser 
	        		 + " order by isArchived, dateCreation desc";
	    } else {
	    	sql = "select distinct e.*, (SELECT COUNT(*) FROM projects p WHERE p.idTeam = e.id) as projetsCount from equipes e left join appartenance_equipe ae on e.id = ae.id_equipe "
	    			+ "where ae.id_utilisateur = " + idUser + " or e.idCreateur = " + idUser + 
	    			" order by e.isArchived, e.dateCreation desc";
	    }
	    try {
	        PreparedStatement ps =DBInteraction.getConn().prepareStatement(sql);
	        ResultSet rs = ps.executeQuery();
	        while(rs.next()) {
	            Team team = new Team();
	            team.setId(rs.getInt("id"));
	            team.setIdCreateur(rs.getInt("idCreateur"));
	            team.setNom(rs.getString("nom"));
	            team.setObjectif(rs.getString("objectif"));
	            team.setArchived(rs.getBoolean("isArchived"));
	            team.setDateCreation(rs.getString("dateCreation"));
	            team.setProjetsCount(rs.getInt("projetsCount"));
	            team.setMembres(getAllMembres(team.getId()));
	            teams.add(team);
	        }
	        rs.close();
	        ps.close();
	    }
	    catch(SQLException e) {
	        e.printStackTrace();
	    }
	    DBInteraction.disconnect();
	    return teams;
	}

	public List<Utilisateur> getAllMembres(int idTeam) {
	    List<Utilisateur> membres = new ArrayList<Utilisateur>();
	    String sql = "select u.* from utilisateurs u join appartenance_equipe ae on u.id = ae.id_utilisateur where ae.id_equipe = ?";
	    try {
	        PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql);
	        ps.setInt(1, idTeam);
	        ResultSet rs = ps.executeQuery();
	        while(rs.next()) {
	        	List<String> experiences = new ArrayList<>();
	            String expString = rs.getString("experiences");
	            if (expString != null && !expString.isEmpty()) {
	                experiences = new ArrayList<String>(Arrays.asList(expString.split(",")));
	            }
	            Utilisateur user = new Utilisateur();
	            user.setId(rs.getInt("id"));
	            user.setNom(rs.getString("nom"));
	            user.setPrenom(rs.getString("prenom"));
	            user.setEmail(rs.getString("email"));
	            user.setLogin(rs.getString("login"));
	            user.setExperiences(experiences);
	            user.setType_utilisateur(rs.getString("type_utilisateur"));
	            membres.add(user);
	        }
	        rs.close();
	        ps.close();
	    }
	    catch(SQLException e) {
	        e.printStackTrace();
	    }
	    return membres;
	}

	public int createTeam(Team team) {
	    int idTeam = 0;
	    int nb = 0;
	    DBInteraction.connect();
	    String sql = "insert into equipes(nom,objectif,idCreateur) values(?,?,?)";
	    try {    
	        PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql, PreparedStatement.RETURN_GENERATED_KEYS);
	        ps.setString(1, team.getNom());
	        ps.setString(2, team.getObjectif());
	        ps.setInt(3, team.getIdCreateur());
	        nb = ps.executeUpdate();
	        ResultSet rs = ps.getGeneratedKeys();
	        if(rs.next()) {
	            idTeam = rs.getInt(1);
	        }
	        team.setId(idTeam);
	        rs.close();
	        ps.close();
	        if(nb > 0) {
	        	String sqlMembre = "insert into appartenance_equipe(id_utilisateur,id_equipe) values(?,?)";
		        for(Utilisateur user : team.getMembres()) {
		            PreparedStatement psMembre = DBInteraction.getConn().prepareStatement(sqlMembre);
		            psMembre.setInt(1, user.getId());
		            psMembre.setInt(2, idTeam);
		            psMembre.executeUpdate();
		            psMembre.close();
		        }
	        }  
	    }
	    catch(SQLException e) {
	        e.printStackTrace();
	    }
	    DBInteraction.disconnect();
	    return nb;
	}

	public Team getTeamById(int idTeam) {
	    Team team = null;
	    DBInteraction.connect();
	    String sql = "select *, (SELECT COUNT(*) FROM projects p WHERE p.idTeam = equipes.id) as projetsCount from equipes where id = ?";
	    try {
	        PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql);
	        ps.setInt(1, idTeam);
	        ResultSet rs = ps.executeQuery();
	        if(rs.next()) {
	            team = new Team();
	            team.setId(rs.getInt("id"));
	            team.setIdCreateur(rs.getInt("idCreateur"));
	            team.setNom(rs.getString("nom"));
	            team.setObjectif(rs.getString("objectif"));
	            team.setArchived(rs.getBoolean("isArchived"));
	            team.setDateCreation(rs.getString("dateCreation"));
	            team.setProjetsCount(rs.getInt("projetsCount"));
	            team.setMembres(getAllMembres(idTeam));
	        }
	        rs.close();
	        ps.close();
	    }
	    catch(SQLException e) {
	        e.printStackTrace();
	    }
	    DBInteraction.disconnect();
	    return team;
	}

	public int updateTeam(Team team) {
	    int nb = 0;
	    DBInteraction.connect();
	    String sql = "update equipes set nom = ?, objectif = ? where id = ?";
	    try {
	        PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql);
	        ps.setString(1, team.getNom());
	        ps.setString(2, team.getObjectif());
	        ps.setInt(3, team.getId());
	        nb = ps.executeUpdate();
	        ps.close();
	    }
	    catch(SQLException e) {
	        e.printStackTrace();
	    }
	    DBInteraction.disconnect();
	    return nb;
	}
	
	public int deleteTeam(int idTeam) {
		int nb = 0;
		DBInteraction.connect();
		String sql = "delete from equipes where id = ? ;";
	    try {
	        PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql);
	        ps.setInt(1, idTeam);
	        nb = ps.executeUpdate();
	        ps.close();
	    }
	    catch(SQLException e) {
	        e.printStackTrace();
	    }
	    DBInteraction.disconnect();
		return nb;
	}

	public int archiveTeam(int idTeam) {
	    int nb = 0;
	    DBInteraction.connect();
	    String sql = "update equipes set isArchived = 1 where id = ?";
	    try {
	        PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql);
	        ps.setInt(1, idTeam);
	        nb = ps.executeUpdate();
	        ps.close();
	    }
	    catch(SQLException e) {
	        e.printStackTrace();
	    }
	    DBInteraction.disconnect();
	    return nb;
	}
	
	public int addMembersToTeam(int idTeam, List<Integer> members) {
	    int nb = 0;
	    DBInteraction.connect();
	    try {
	        String sql = "insert into appartenance_equipe(id_equipe, id_utilisateur) values (?, ?)";
	        PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql);
	        for(Integer idUser : members) {
	            ps.setInt(1, idTeam);
	            ps.setInt(2, idUser);
	            nb += ps.executeUpdate();
	        }
	        ps.close();
	    }
	    catch(SQLException e) {
	        e.printStackTrace();
	    }
	    DBInteraction.disconnect();
	    return nb;
	}

	public int removeMemberFromTeam(int idTeam, int idUser) {
	    int nb = 0;
	    DBInteraction.connect();
        String sql = "delete from appartenance_equipe where id_equipe=? and id_utilisateur=?";
	    try {
	        PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql);
	        ps.setInt(1, idTeam);
	        ps.setInt(2, idUser);
	        nb = ps.executeUpdate();
	        ps.close();
	    }
	    catch(SQLException e) {
	        e.printStackTrace();
	    }
	    DBInteraction.disconnect();
	    return nb;
	}

	/**
	 * Returns true if the given user belongs to the team (used for RBAC:
	 * a "Développeur" is any team member who is not Admin/SM/PO of the project).
	 */
	public boolean isTeamMember(int idTeam, int idUser) {
	    if (idTeam <= 0 || idUser <= 0) return false;
	    boolean member = false;
	    DBInteraction.connect();
	    String sql = "select 1 from appartenance_equipe where id_equipe = ? and id_utilisateur = ? limit 1";
	    try {
	        PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql);
	        ps.setInt(1, idTeam);
	        ps.setInt(2, idUser);
	        ResultSet rs = ps.executeQuery();
	        member = rs.next();
	        rs.close();
	        ps.close();
	    }
	    catch(SQLException e) {
	        e.printStackTrace();
	    }
	    DBInteraction.disconnect();
	    return member;
	}
}
