package structures_DAO;

import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import classes.Utilisateur;
import connexion_BD.DBInteraction;

public class UtilisateurDAO {
	public Utilisateur authentification(String log, String pass) {
	    Utilisateur user = null;
	    DBInteraction.connect();
	    String sql = "select * from utilisateurs where (login = ? OR email = ?) and password = ?";
	    try {
	        PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql);
	        ps.setString(1, log);
	        ps.setString(2, log);
	        ps.setString(3, pass);
	        ResultSet rs = ps.executeQuery();
	        if (rs.next()) {
	            List<String> experiences = new ArrayList<>();
	            String expString = rs.getString("experiences");
	            if (expString != null && !expString.isEmpty()) {
	                experiences = Arrays.asList(expString.split(","));
	            }
	            user = new Utilisateur(
	                rs.getInt("id"),
	                rs.getString("nom"),
	                rs.getString("prenom"),
	                rs.getString("login"),
	                rs.getString("email"),
	                experiences,
	                rs.getString("password"),
	                rs.getDate("date_creation_compte").toString(),
	                rs.getString("type_utilisateur")
	            );
	        }
	        rs.close();
	        ps.close();
	    }
	    catch (SQLException e) {
	        System.err.println("Erreur lors de l'authentification !");
	        e.printStackTrace();
	    }
	    DBInteraction.disconnect();

	    return user;
	}
	
	public int inscription(String nom,String prenom,String email,String login,String password,List<String> experiences,String type_utilisateur)
	{
		int nb = 0;
		DBInteraction.connect();
		String sql = "insert into utilisateurs (nom, prenom, login, email, password, experiences, date_creation_compte, type_utilisateur) " +
					  "values(?, ?, ?, ?, ?, ?, ?, ?)";	
		try {
			PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql);
			String experiencesString = String.join(",", experiences);
			ps.setString(1, nom);
			ps.setString(2, prenom);
			ps.setString(3, login);
			ps.setString(4, email);
			ps.setString(5, password);
			ps.setString(6, experiencesString);
			ps.setDate(7, Date.valueOf(LocalDate.now()));
			ps.setString(8, type_utilisateur);
			nb = ps.executeUpdate();
			ps.close();
		}
		catch (SQLException e) {
			e.printStackTrace();
		}
		DBInteraction.disconnect();
		
		return nb;
	}

	public int modifierInfosPersonnels(int id, String nom, String prenom, String email, List<String> experiences) {
	    int nb = 0;
	    DBInteraction.connect();
	    String sql = "update utilisateurs set nom = ?, prenom = ?, email = ?, experiences = ? where id = ?";
	    try {
	        PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql);
	        String experiencesString = String.join(",", experiences);
	        ps.setString(1, nom);
	        ps.setString(2, prenom);
	        ps.setString(3, email);
	        ps.setString(4, experiencesString);
	        ps.setInt(5, id);
	        nb = ps.executeUpdate();
	        ps.close();
	    }
	    catch(SQLException e) {
	        e.printStackTrace();
	    }
	    DBInteraction.disconnect();
	    return nb;
	}

	public int modifierPassword(int id, String nouveauPass) {
	    int nb = 0;
	    DBInteraction.connect();
	    String sql = "update utilisateurs set password = ? where id = ?";
	    try {
	        PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql);
	        ps.setString(1, nouveauPass);
	        ps.setInt(2, id);
	        nb = ps.executeUpdate();
	        ps.close();
	    }
	    catch(SQLException e) {
	        e.printStackTrace();
	    }
	    DBInteraction.disconnect();
	    return nb;
	}
	
	public int supprimerCompte(int id) {
	    int nb = 0;
	    DBInteraction.connect();
	    String sql = "delete from utilisateurs where id = ?";
	    try {
	        PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql);
	        ps.setInt(1, id);
	        nb = ps.executeUpdate();
	        ps.close();
	    }
	    catch(SQLException e) {
	        e.printStackTrace();
	    }
	    DBInteraction.disconnect();
	    return nb;
	}
	
	public Utilisateur getUserById(int id) {
	    Utilisateur user = null;
	    DBInteraction.connect();
	    String sql = "select * from utilisateurs where id = ?";
	    try {
	        PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql);
	        ps.setInt(1, id);
	        ResultSet rs = ps.executeQuery();
	        if(rs.next()) {
	            List<String> experiences = new ArrayList<>();
	            String expString = rs.getString("experiences");
	            if(expString != null && !expString.isEmpty()) {
	                experiences = Arrays.asList(expString.split(","));
	            }
	            user = new Utilisateur(
	                rs.getInt("id"),
	                rs.getString("nom"),
	                rs.getString("prenom"),
	                rs.getString("login"),
	                rs.getString("email"),
	                experiences,
	                rs.getString("password"),
	                rs.getString("date_creation_compte"),
	                rs.getString("type_utilisateur")
	            );
	        }
	        rs.close();
	        ps.close();
	    }
	    catch(SQLException e) {
	        e.printStackTrace();
	    }
	    DBInteraction.disconnect();
	    return user;
	}
	
	public List<Utilisateur> getAllUsers() {
	    List<Utilisateur> users = new ArrayList<Utilisateur>();
	    DBInteraction.connect();
	    String sql = "select * from utilisateurs;";
	    try {
	        PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql);
	        ResultSet rs = ps.executeQuery();
	        while(rs.next()) {
	            List<String> experiences = new ArrayList<>();
	            String expString = rs.getString("experiences");
	            if(expString != null && !expString.isEmpty()) {
	                experiences = Arrays.asList(expString.split(","));
	            }
	            Utilisateur user = new Utilisateur(
	                rs.getInt("id"),
	                rs.getString("nom"),
	                rs.getString("prenom"),
	                rs.getString("login"),
	                rs.getString("email"),
	                experiences,
	                rs.getString("password"),
	                rs.getString("date_creation_compte"),
	                rs.getString("type_utilisateur")
	            );
	            users.add(user);
	        }
	        rs.close();
	        ps.close();
	    }
	    catch(SQLException e) {
	        e.printStackTrace();
	    }
	    DBInteraction.disconnect();
	    return users;
	}

}
