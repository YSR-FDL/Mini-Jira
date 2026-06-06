package classes;

public class Sprint {
    private int idSprint;
    private String nomSprint;
    private String objectif;
    private String dateDebut;
    private String dateFin;
    private String statut;
    private int idProject;

    public Sprint() {

    }

    public int getIdSprint() { return idSprint; }
    public void setIdSprint(int idSprint) { this.idSprint = idSprint; }

    public String getNomSprint() { return nomSprint; }
    public void setNomSprint(String nomSprint) { this.nomSprint = nomSprint; }

    public String getObjectif() { return objectif; }
    public void setObjectif(String objectif) { this.objectif = objectif; }

    public String getDateDebut() { return dateDebut; }
    public void setDateDebut(String dateDebut) { this.dateDebut = dateDebut; }

    public String getDateFin() { return dateFin; }
    public void setDateFin(String dateFin) { this.dateFin = dateFin; }

    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }

    public int getIdProject() { return idProject; }
    public void setIdProject(int idProject) { this.idProject = idProject; }


}
