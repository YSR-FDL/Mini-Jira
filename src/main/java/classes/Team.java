package classes;

import java.util.ArrayList;
import java.util.List;

public class Team {
    private int id, idCreateur;
    private String nom;
    private String objectif;
    private boolean isArchived;
    private String dateCreation;
    private List<Utilisateur> membres;
    
    public Team() {
		this.membres = new ArrayList<Utilisateur>();
	}
    
	public Team(int id, String nom, String objectif, boolean isArchived, List<Utilisateur> membres) {
		this.id = id;
		this.nom = nom;
		this.objectif = objectif;
		this.isArchived = isArchived;
		this.membres = new ArrayList<Utilisateur>(membres);
	}
	
	public Team(int id, int idCreateur, String nom, String objectif, boolean isArchived, List<Utilisateur> membres) {
		this.id = id;
		this.idCreateur = idCreateur;
		this.nom = nom;
		this.objectif = objectif;
		this.isArchived = isArchived;
		this.membres = new ArrayList<Utilisateur>(membres);
	}
	
	public Team(int id, int idCreateur, String nom, String objectif, boolean isArchived, List<Utilisateur> membres, String dateCreation) {
		this.id = id;
		this.idCreateur = idCreateur;
		this.nom = nom;
		this.objectif = objectif;
		this.isArchived = isArchived;
		this.dateCreation = dateCreation;
		this.membres = new ArrayList<Utilisateur>(membres);
	}
	
	public int getId() {
		return id;
	}
	public void setId(int id) {
		this.id = id;
	}
	public int getIdCreateur() {
		return idCreateur;
	}
	public void setIdCreateur(int idCreateur) {
		this.idCreateur = idCreateur;
	}
	public String getNom() {
		return nom;
	}
	public void setNom(String nom) {
		this.nom = nom;
	}
	public String getObjectif() {
		return objectif;
	}
	public void setObjectif(String objectif) {
		this.objectif = objectif;
	}
	public List<Utilisateur> getMembres() {
		return membres;
	}
	public void setMembres(List<Utilisateur> membres) {
		this.membres = new ArrayList<Utilisateur>(membres);
	}
	
	public boolean isArchived() {
	    return isArchived;
	}
	public void setArchived(boolean isArchived) {
	    this.isArchived = isArchived;
	}
	public String getDateCreation() {
		return dateCreation;
	}
	public void setDateCreation(String dateCreation) {
		this.dateCreation = dateCreation;
	}

	@Override
	public String toString() {
	    return "Team [id=" + id + ", idCreateur=" + idCreateur + ", nom=" + nom + ", objectif=" + objectif + ", membres=" + membres + "]";
	}
}
