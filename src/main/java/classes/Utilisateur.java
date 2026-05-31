package classes;

import java.util.ArrayList;
import java.util.List;

public class Utilisateur {
	private int id;
	private String nom, prenom;
	private String login, email;
	private List<String> experiences;
	private String password;
	private String dateCreationCompte;
	private String type_utilisateur;
	
	public Utilisateur() {
		experiences = new ArrayList<>();
	}
	
	public Utilisateur(int id, String nom, String prenom, String login, String email, List<String> experiences,
			String password, String dateCreationCompte, String type_utilisateur) {
		this.id = id;
		this.nom = nom;
		this.prenom = prenom;
		this.login = login;
		this.email = email;
		this.experiences = new ArrayList<>(experiences);
		this.password = password;
		this.dateCreationCompte = dateCreationCompte;
		this.type_utilisateur = type_utilisateur;
	}

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getNom() {
		return nom;
	}

	public void setNom(String nom) {
		this.nom = nom;
	}

	public String getPrenom() {
		return prenom;
	}

	public void setPrenom(String prenom) {
		this.prenom = prenom;
	}

	public String getLogin() {
		return login;
	}

	public void setLogin(String login) {
		this.login = login;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public List<String> getExperiences() {
		return experiences;
	}

	public void setExperiences(List<String> expériences) {
		this.experiences = expériences;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getDateCreationCompte() {
		return dateCreationCompte;
	}

	public void setDateCreationCompte(String dateCreationCompte) {
		this.dateCreationCompte = dateCreationCompte;
	}
	

	public String getType_utilisateur() {
		return type_utilisateur;
	}

	public void setType_utilisateur(String type_utilisateur) {
		this.type_utilisateur = type_utilisateur;
	}

	@Override
	public String toString() {
		return "Utilisateur [id=" + id + ", nom=" + nom + ", prenom=" + prenom + ", login=" + login + ", email=" + email
				+ ", expériences=" + experiences + ", password=" + password + ", dateCreationCompte="
				+ dateCreationCompte + "]";
	}
	
}
