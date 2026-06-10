package classes;

public class Task {
    private int idTask;
    private String titre;
    private String description;
    private String statut;
    private String priorite;
    private int storyPoints;
    private int position;
    private String dateCreation;
    private int idProject;
    private Integer idSprint;
    private Integer idAssignee;
    private Integer idParent;
    private String typeTache;

    public Task() {
        this.typeTache = "Feature";
    }

    public int getIdTask() { return idTask; }
    public void setIdTask(int idTask) { this.idTask = idTask; }

    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }

    public String getPriorite() { return priorite; }
    public void setPriorite(String priorite) { this.priorite = priorite; }

    public int getStoryPoints() { return storyPoints; }
    public void setStoryPoints(int storyPoints) { this.storyPoints = storyPoints; }

    public int getPosition() { return position; }
    public void setPosition(int position) { this.position = position; }

    public String getDateCreation() { return dateCreation; }
    public void setDateCreation(String dateCreation) { this.dateCreation = dateCreation; }

    public int getIdProject() { return idProject; }
    public void setIdProject(int idProject) { this.idProject = idProject; }

    public Integer getIdSprint() { return idSprint; }
    public void setIdSprint(Integer idSprint) { this.idSprint = idSprint; }

    public Integer getIdAssignee() { return idAssignee; }
    public void setIdAssignee(Integer idAssignee) { this.idAssignee = idAssignee; }

    public Integer getIdParent() { return idParent; }
    public void setIdParent(Integer idParent) { this.idParent = idParent; }

    public String getTypeTache() { return typeTache; }
    public void setTypeTache(String typeTache) { this.typeTache = typeTache; }
    
}
