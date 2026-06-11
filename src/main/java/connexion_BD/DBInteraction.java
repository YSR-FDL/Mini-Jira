package connexion_BD;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

/**
 * Database access helper.
 *
 * Each request thread gets its own isolated {@link Connection} via a
 * {@link ThreadLocal}. In a multi-threaded servlet container this prevents one
 * request from closing or reusing a connection that another request is still
 * using — the root cause of intermittent "No operations allowed after
 * connection closed" errors and leaked transaction state.
 *
 * The public API ({@code connect}/{@code getConn}/{@code disconnect}) is kept
 * identical so existing DAOs need no changes: they still call connect() at the
 * start of an operation and disconnect() at the end.
 */
public class DBInteraction {
	private static final String url = "jdbc:mysql://localhost:3306/MiniJira?useUnicode=true&characterEncoding=UTF-8";
	private static final String username = "root";
	private static final String password = "2005";

	private static final ThreadLocal<Connection> CONNECTION = new ThreadLocal<>();

	public static void connect() {
		try {
			Connection conn = CONNECTION.get();
			if (conn == null || conn.isClosed()) {
				Class.forName("com.mysql.cj.jdbc.Driver");
				conn = DriverManager.getConnection(url, username, password);
				CONNECTION.set(conn);
				System.out.println("Connexion réussie!");
			}
		} catch (ClassNotFoundException e) {
			System.err.println("Erreur lors du chargement du driver!");
			e.printStackTrace();
		} catch (SQLException e) {
			System.err.println("Erreur lors de la connexion à la base!");
			e.printStackTrace();
		}
	}

	public static ResultSet lire(String req) {
		ResultSet rs = null;
		try {
			connect();
			Statement st = CONNECTION.get().createStatement();
			rs = st.executeQuery(req);
		} catch (SQLException e) {
			System.err.println("Erreur lors de l'exécution de la requête SQL!");
		}
		return rs;
	}

	public static int MAJ(String req) {
		int nbr_ligne = 0;
		try {
			connect();
			PreparedStatement pst = CONNECTION.get().prepareStatement(req);
			nbr_ligne = pst.executeUpdate();
		} catch (SQLException e) {
			System.err.println("Erreur lors de la mise à jour de la base de données!");
		}
		return nbr_ligne;
	}

	public static void disconnect() {
		Connection conn = CONNECTION.get();
		try {
			if (conn != null && !conn.isClosed()) {
				conn.close();
			}
		} catch (SQLException e) {
			System.err.println("Erreur lors de la fermeture de la base!");
		} finally {
			// Always drop the reference so a pooled/reused thread starts fresh.
			CONNECTION.remove();
		}
	}

	public static Connection getConn() {
		connect();
		return CONNECTION.get();
	}

}
