package classes;

public class Commentaire {
    private int idCommentaire;
    private int idTask;
    private Integer idAuteur;
    private String contenu;
    private String dateCreation;

    public Commentaire() {}

    public int getIdCommentaire() { return idCommentaire; }
    public void setIdCommentaire(int idCommentaire) { this.idCommentaire = idCommentaire; }

    public int getIdTask() { return idTask; }
    public void setIdTask(int idTask) { this.idTask = idTask; }

    public Integer getIdAuteur() { return idAuteur; }
    public void setIdAuteur(Integer idAuteur) { this.idAuteur = idAuteur; }

    public String getContenu() { return contenu; }
    public void setContenu(String contenu) { this.contenu = contenu; }

    public String getDateCreation() { return dateCreation; }
    public void setDateCreation(String dateCreation) { this.dateCreation = dateCreation; }
}
