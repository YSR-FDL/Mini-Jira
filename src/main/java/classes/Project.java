package classes;

import java.util.ArrayList;
import java.util.List;

public class Project {
	private int idProject;
    private String nomProjet;
    private String cle;
    List<String> etats;
    private String dateCreation;
    private boolean isArchived;
    private int idCreateur;
    private int idTeam;
    private int idSM;
    private int idPO;

    public Project() {
    	this.etats = new ArrayList<String>();
    }
	public Project(int idProject, String nomProjet, String cle, List<String> etats, String dateCreation, int idCreateur, boolean isArchived) {
		this.idProject = idProject;
		this.nomProjet = nomProjet;
		this.cle = cle;
		this.etats = new ArrayList<String>(etats);
		this.dateCreation = dateCreation;
		this.idCreateur = idCreateur;
		this.isArchived = isArchived;
	}
	
	public Project(int idProject, String nomProjet, String cle, List<String> etats, String dateCreation, boolean isArchived, int idCreateur, 
			int idTeam, int idSM, int idPO) {
		this.idProject = idProject;
		this.nomProjet = nomProjet;
		this.cle = cle;
		this.etats = new ArrayList<String>(etats);
		this.dateCreation = dateCreation;
		this.idCreateur = idCreateur;
		this.isArchived = isArchived;
		this.idTeam = idTeam;
		this.idSM = idSM;
		this.idPO = idPO;
	}
	
	public int getIdProject() {
		return idProject;
	}
	public void setIdProject(int idProject) {
		this.idProject = idProject;
	}
	public String getNomProjet() {
		return nomProjet;
	}
	public void setNomProjet(String nomProjet) {
		this.nomProjet = nomProjet;
	}
	public String getCle() {
		return cle;
	}
	public void setCle(String cle) {
		this.cle = cle;
	}
	public List<String> getEtats() {
		return etats;
	}
	public void setEtats(List<String> etats) {
		this.etats = etats;
	}
	public String getDateCreation() {
		return dateCreation;
	}
	public void setDateCreation(String dateCreation) {
		this.dateCreation = dateCreation;
	}
	public boolean isArchived() {
		return isArchived;
	}
	public void setArchived(boolean isArchived) {
		this.isArchived = isArchived;
	}
	public int getIdCreateur() {
		return idCreateur;
	}
	public void setIdCreateur(int idCreateur) {
		this.idCreateur = idCreateur;
	}
	public int getIdTeam() {
		return idTeam;
	}
	public void setIdTeam(int idTeam) {
		this.idTeam = idTeam;
	}
	public int getIdSM() {
		return idSM;
	}
	public void setIdSM(int idSM) {
		this.idSM = idSM;
	}
	public int getIdPO() {
		return idPO;
	}
	public void setIdPO(int idPO) {
		this.idPO = idPO;
	}
	@Override
	public String toString() {
		return "Project [idProject=" + idProject + ", nomProjet=" + nomProjet + ", cle=" + cle + ", etats=" + etats
				+ ", dateCreation=" + dateCreation + ", isArchived=" + isArchived + ", idCreateur=" + idCreateur
				+ ", idTeam=" + idTeam + ", idSM=" + idSM + ", idPO=" + idPO + "]";
	}
	
}
