package connexion_BD;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

public class DBInteraction {
	private static Connection conn = null;
	private static Statement st = null;
	private static ResultSet rs = null;
	private static PreparedStatement pst = null;
	private static String url="jdbc:mysql://localhost:3306/MiniJira";
	private static String username = "root";
	private static String password = "2005";
	
	public static void connect() {
		try {
			Class.forName("com.mysql.cj.jdbc.Driver");
			conn = DriverManager.getConnection(url,username,password);
			System.out.println("Connexion réussie!");
		}catch(ClassNotFoundException e) {
			System.err.println("Erreur lors du chargement du driver!");
			e.printStackTrace();
		}catch(SQLException e) {
			System.err.println("Erreur lors de la connexion à la base!");
			e.printStackTrace();
		}
	}
	

	public static ResultSet lire(String req){
		try {
			st = conn.createStatement();
			rs = st.executeQuery(req);
		} catch (SQLException e) {
			System.err.println("Erreur lors de l'exécution de la requête SQL!");
		}
		return rs;
	}

	public static int MAJ(String req){
		int nbr_ligne = 0;
		try {
			pst = conn.prepareStatement(req);
			nbr_ligne = pst.executeUpdate();
		} catch (SQLException e) {
			System.err.println("Erreur lors de la mise à jour de la base de données!");
		}
		return nbr_ligne;
	}

	public static void disconnect() {
		try {
			if(rs != null)
				rs.close();
			if(st != null)
				st.close();
			if(pst != null)
				pst.close();
			if(conn != null)
				conn.close();
		} catch (SQLException e) {
			System.err.println("Erreur lors de la fermeture de la base!");
		}		
	}

	public static Connection getConn() {
		return conn;
	}
	
}

