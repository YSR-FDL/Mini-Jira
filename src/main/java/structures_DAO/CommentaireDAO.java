package structures_DAO;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import classes.Commentaire;
import connexion_BD.DBInteraction;
import utils.AssigneeHelper;

public class CommentaireDAO {

    private static final String COMMENT_SELECT =
        "SELECT c.*, u.nom AS nom_auteur, u.prenom AS prenom_auteur " +
        "FROM commentaires c LEFT JOIN utilisateurs u ON c.id_auteur = u.id ";

    private Map<String, Object> buildCommentMap(ResultSet rs) throws SQLException {
        Map<String, Object> map = new HashMap<>();
        map.put("idCommentaire", rs.getInt("id_commentaire"));
        map.put("idTask", rs.getInt("id_task"));
        map.put("contenu", rs.getString("contenu"));
        map.put("dateCreation", rs.getString("date_creation"));

        int auteurId = rs.getInt("id_auteur");
        if (!rs.wasNull() && auteurId > 0) {
            String prenom = rs.getString("prenom_auteur");
            String nom = rs.getString("nom_auteur");
            map.put("idAuteur", auteurId);
            map.put("auteur", AssigneeHelper.buildAssigneeMap(auteurId, prenom, nom));
        } else {
            map.put("idAuteur", null);
            map.put("auteur", null);
        }
        return map;
    }

    /** Commentaires d'une tâche, du plus ancien au plus récent. */
    public List<Map<String, Object>> getByTask(int taskId) {
        List<Map<String, Object>> comments = new ArrayList<>();
        DBInteraction.connect();
        String sql = COMMENT_SELECT + "WHERE c.id_task = ? ORDER BY c.date_creation ASC, c.id_commentaire ASC";
        try {
            PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql);
            ps.setInt(1, taskId);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                comments.add(buildCommentMap(rs));
            }
            rs.close();
            ps.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        DBInteraction.disconnect();
        return comments;
    }

    /** Ajoute un commentaire et renseigne son id généré. */
    public int add(Commentaire comment) {
        int nb = 0;
        DBInteraction.connect();
        String sql = "INSERT INTO commentaires(id_task, id_auteur, contenu) VALUES (?, ?, ?)";
        try {
            PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql, PreparedStatement.RETURN_GENERATED_KEYS);
            ps.setInt(1, comment.getIdTask());
            if (comment.getIdAuteur() != null) {
                ps.setInt(2, comment.getIdAuteur());
            } else {
                ps.setNull(2, java.sql.Types.INTEGER);
            }
            ps.setString(3, comment.getContenu());
            nb = ps.executeUpdate();
            if (nb > 0) {
                ResultSet keys = ps.getGeneratedKeys();
                if (keys.next()) {
                    comment.setIdCommentaire(keys.getInt(1));
                }
                keys.close();
            }
            ps.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        DBInteraction.disconnect();
        return nb;
    }

    public int delete(int commentId) {
        int nb = 0;
        DBInteraction.connect();
        String sql = "DELETE FROM commentaires WHERE id_commentaire = ?";
        try {
            PreparedStatement ps = DBInteraction.getConn().prepareStatement(sql);
            ps.setInt(1, commentId);
            nb = ps.executeUpdate();
            ps.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        DBInteraction.disconnect();
        return nb;
    }
}
