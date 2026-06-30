package utils;

import java.util.Set;

import classes.Project;
import classes.Sprint;
import classes.Task;
import structures_DAO.TeamDao;

/**
 * Centralised Role-Based Access Control for a project workspace.
 *
 * Roles are derived per-project from the {@link Project} record and team
 * membership:
 *   - Administrateur : the project creator (idCreateur). Owns the workspace
 *                      (create project, assign roles, archive/delete) but is
 *                      explicitly forbidden from touching Sprints, Epics,
 *                      Stories or Sub-tasks.
 *   - Product Owner  : project idPO. Full CRUD on Epics; creates/defines and
 *                      prioritises Stories; links Stories to Epics. Defines the
 *                      Sprint Goal (objectif) and helps finalise the sprint
 *                      backlog by assigning stories to sprints. Read-only on
 *                      Sub-tasks; cannot estimate or otherwise manage Sprints.
 *   - Scrum Master   : project idSM. Manages Sprints, moves Stories between
 *                      Sprints and the Backlog, deletes rogue Stories. Does NOT
 *                      assign stories (Agile pull system) nor estimate story
 *                      points (developers' responsibility). Read-only on Epics
 *                      and Sub-tasks.
 *   - Développeur    : a team member who is none of the above. Self-assigns
 *                      unassigned Stories (pull system), estimates story points
 *                      collectively, and may move ANY team ticket on the board
 *                      (collective responsibility). Full CRUD on Sub-tasks of
 *                      stories they own, including submitting the deliverable
 *                      (GitHub link) of their sub-tasks. Read-only on Epics;
 *                      cannot create or delete Stories.
 *
 * Every decision method returns {@code null} when the action is allowed, or a
 * human-readable reason string when it is denied (so controllers can return a
 * 403 with a useful message).
 */
public final class Rbac {

    private Rbac() {
    }

    /** Effective roles a user holds within a single project. */
    public static final class Roles {
        public final int userId;
        public final boolean isAdmin; // project creator
        public final boolean isSM;
        public final boolean isPO;
        public final boolean isDev;   // team member, not Admin/SM/PO
        public final boolean isMember; // has any relationship with the project

        private Roles(int userId, boolean isAdmin, boolean isSM, boolean isPO, boolean isDev) {
            this.userId = userId;
            this.isAdmin = isAdmin;
            this.isSM = isSM;
            this.isPO = isPO;
            this.isDev = isDev;
            this.isMember = isAdmin || isSM || isPO || isDev;
        }
    }

    /**
     * Resolves the roles a user holds for the given project. A pure team member
     * (not creator/SM/PO) is treated as a Développeur. The Admin/SM/PO roles are
     * mutually exclusive of the Dev role so that, e.g., a Scrum Master who also
     * sits on the team does not inherit developer privileges.
     */
    public static Roles resolve(int userId, Project project, TeamDao teamDao) {
        if (project == null || userId <= 0) {
            return new Roles(userId, false, false, false, false);
        }
        boolean admin = project.getIdCreateur() == userId;
        boolean sm = project.getIdSM() == userId;
        boolean po = project.getIdPO() == userId;
        boolean member = teamDao != null && teamDao.isTeamMember(project.getIdTeam(), userId);
        boolean dev = member && !admin && !sm && !po;
        return new Roles(userId, admin, sm, po, dev);
    }

    // Task type helpers
    public static boolean isEpic(Task t) {
        return t != null && "Epic".equalsIgnoreCase(t.getTypeTache());
    }

    public static boolean isSubtask(Task t) {
        if (t == null || t.getTypeTache() == null) return false;
        String type = t.getTypeTache().toLowerCase();
        return type.equals("subtask") || type.equals("sub-task") || type.equals("sous-tache");
    }

    /** A Bug report — any project member can signal one. */
    public static boolean isBug(Task t) {
        return t != null && "Bug".equalsIgnoreCase(t.getTypeTache());
    }

    /** A "Story" is any work item that is neither an Epic, a Sub-task, nor a Bug. */
    public static boolean isStory(Task t) {
        return t != null && !isEpic(t) && !isSubtask(t) && !isBug(t);
    }

    //  Project workspace (Administrateur only)
    public static String authorizeProjectAdmin(Roles roles, String action) {
        if (roles != null && roles.isAdmin) {
            return null;
        }
        return "Seul l'administrateur du projet peut " + action + ".";
    }

    // Team assignment (Admin or Scrum Master)
    public static String authorizeTeamAssignment(Roles roles) {
        if (roles != null && (roles.isAdmin || roles.isSM)) {
            return null;
        }
        return "Seul l'administrateur ou le Scrum Master peut assigner une équipe au projet.";
    }


    // Board columns management (Admin or Scrum Master)
    public static String authorizeBoardManagement(Roles roles) {
        if (roles != null && (roles.isAdmin || roles.isSM)) {
            return null;
        }
        return "Seul l'administrateur ou le Scrum Master peut modifier les colonnes du projet.";
    }

    // Sprints (Scrum Master only)
    public static String authorizeSprintManagement(Roles roles) {
        if (roles != null && roles.isSM) {
            return null;
        }
        return "Seul le Scrum Master peut gérer les sprints.";
    }

    //  Sprint backlog : affectation des stories aux sprints
    /**
     * Finalisation du sprint backlog (Sprint Planning). D'après la matrice
     * RACI, le Product Owner et le Scrum Master sont responsables/accountable
     * de l'identification des stories pour le sprint. L'affectation d'une story
     * à un sprint (ou son retour au backlog) est donc ouverte au SM et au PO.
     */
    public static String authorizeSprintBacklog(Roles roles) {
        if (roles != null && (roles.isSM || roles.isPO)) {
            return null;
        }
        return "Seul le Scrum Master ou le Product Owner peut affecter des stories aux sprints.";
    }

    // Édition d'un sprint (niveau champ)
    /**
     * Édition d'un sprint. Le Scrum Master peut tout modifier (nom, dates,
     * capacité, objectif). D'après la RACI « Define Sprint Goals » (PO=R,
     * SM=RA), le Product Owner ne peut modifier QUE l'objectif du sprint.
     */
    public static String authorizeSprintUpdate(Roles roles, Sprint existing, Sprint incoming) {
        if (roles == null) {
            return "Action non autorisée.";
        }
        if (roles.isSM) {
            return null;
        }
        if (roles.isPO) {
            if (onlyObjectifChanged(existing, incoming)) {
                return null;
            }
            return "Le Product Owner ne peut modifier que l'objectif du sprint.";
        }
        return "Seul le Scrum Master peut gérer les sprints.";
    }

    /** Vrai si seul l'objectif du sprint diffère (nom, dates et capacité inchangés). */
    private static boolean onlyObjectifChanged(Sprint existing, Sprint incoming) {
        if (existing == null || incoming == null) {
            return false;
        }
        return eq(existing.getNomSprint(), incoming.getNomSprint())
                && eq(existing.getDateDebut(), incoming.getDateDebut())
                && eq(existing.getDateFin(), incoming.getDateFin())
                && eq(existing.getCapacite(), incoming.getCapacite());
    }

    //  Livrable d'une sous-tache (lien GitHub)
    /**
     * Dépôt/édition du livrable (dépôt GitHub) d'une sous-tache. Seul le
     * développeur propriétaire de la sous-tache (assignée à lui, ou rattachée à
     * une story qu'il possède) peut déposer son livrable. Le Product Owner peut
     * rejeter (supprimer) un livrable.
     */
    public static String authorizeDeliverableSubmit(Roles roles, Task subtask, Task parent, boolean isRemoval) {
        if (roles == null || subtask == null || !roles.isMember) {
            return "Action non autorisée.";
        }
        if (!isSubtask(subtask)) {
            return "Le livrable ne peut être déposé que sur une sous-tache.";
        }
        if (isRemoval && roles.isPO) {
            return null; // Product Owner may reject/remove the deliverable
        }
        if (roles.isDev && ownsTaskOrParent(roles, subtask, parent)) {
            return null;
        }
        return "Seul le développeur propriétaire de la sous-tache peut déposer le livrable.";
    }

    //  Backlog reordering
    /**
     * Reordering / sprint placement: the Scrum Master and the Product Owner may
     * reorder any container (backlog or sprint) and thereby place stories into a
     * sprint, consistent with their shared responsibility for finalising the
     * sprint backlog (RACI: PO=R, SM=A).
     */
    public static String authorizeReorder(Roles roles, Integer sprintId) {
        if (roles == null) {
            return "Action non autorisée.";
        }
        if (roles.isSM || roles.isPO) {
            return null;
        }
        return "Seul le Scrum Master ou le Product Owner peut réordonner les tickets.";
    }

    //  Task creation
    /**
     * @param newTask the task being created (type + intended assignee)
     * @param parent  the parent task when creating a Sub-task (may be null)
     */
    public static String authorizeTaskCreate(Roles roles, Task newTask, Task parent) {
        if (roles == null || !roles.isMember) {
            return "Action non autorisée.";
        }
        if (isEpic(newTask)) {
            return roles.isPO ? null : "Seul le Product Owner peut créer des Epics.";
        }
        if (isSubtask(newTask)) {
            if (!roles.isDev) {
                return "Seuls les développeurs peuvent créer des sous-taches.";
            }
            // A developer may only add sub-tasks under a story assigned to them.
            if (parent == null) {
                return "Une sous-tache doit être rattachée à une story.";
            }
            if (parent.getIdAssignee() == null || parent.getIdAssignee() != roles.userId) {
                return "Vous ne pouvez ajouter des sous-taches qu'aux stories qui vous sont assignées.";
            }
            return null;
        }
        // Bug report: tout membre du projet peut signaler un bug.
        if (isBug(newTask)) {
            return null; // any project member can report a bug
        }
        // Standard Story (Feature, Tech, etc.) → Product Owner only.
        return roles.isPO ? null : "Seul le Product Owner peut créer des stories.";
    }

    //  Task deletion
    public static String authorizeTaskDelete(Roles roles, Task existing, Task parent) {
        if (roles == null || existing == null || !roles.isMember) {
            return "Action non autorisée.";
        }
        if (isEpic(existing)) {
            return roles.isPO ? null : "Seul le Product Owner peut supprimer des Epics.";
        }
        if (isSubtask(existing)) {
            // A developer may delete a sub-task of a story assigned to them
            // (or one already assigned to them).
            if (roles.isDev && ownsTaskOrParent(roles, existing, parent)) {
                return null;
            }
            return "Seul le développeur propriétaire peut supprimer cette sous-tache.";
        }
        // Bug report: the SM, PO, or the assignee (reporter) can delete it.
        if (isBug(existing)) {
            if (roles.isSM || roles.isPO) {
                return null;
            }
            if (roles.isDev && existing.getIdAssignee() != null && existing.getIdAssignee() == roles.userId) {
                return null;
            }
            return "Seul le Scrum Master, le Product Owner ou l'assigné peut supprimer ce bug report.";
        }
        // Story: the Scrum Master removes rogue/invalid stories; the Product
        // Owner owns the story lifecycle.
        if (roles.isSM || roles.isPO) {
            return null;
        }
        return "Seul le Scrum Master ou le Product Owner peut supprimer une story.";
    }

    // Task update (field-level)
    /**
     * Computes which task fields are *actually* being changed.
     *
     * The frontend often resends the whole task on every edit, so presence of a
     * JSON key does not imply intent to change it. A field counts as changed
     * only when it is present in the request body AND its value differs from the
     * stored task. This keeps RBAC from rejecting a legitimate single-field edit
     * just because unrelated fields were echoed back unchanged.
     */
    public static Set<String> computeChangedTaskFields(Set<String> presentKeys, Task existing, Task incoming) {
        Set<String> changed = new java.util.HashSet<>();
        if (presentKeys == null || existing == null || incoming == null) {
            return changed;
        }
        if (presentKeys.contains("titre") && !eq(existing.getTitre(), incoming.getTitre()))
            changed.add("titre");
        if (presentKeys.contains("description") && !eq(existing.getDescription(), incoming.getDescription()))
            changed.add("description");
        if (presentKeys.contains("statut") && !eq(existing.getStatut(), incoming.getStatut()))
            changed.add("statut");
        if (presentKeys.contains("priorite") && !eq(existing.getPriorite(), incoming.getPriorite()))
            changed.add("priorite");
        if (presentKeys.contains("typeTache") && !eq(existing.getTypeTache(), incoming.getTypeTache()))
            changed.add("typeTache");
        if (presentKeys.contains("storyPoints") && existing.getStoryPoints() != incoming.getStoryPoints())
            changed.add("storyPoints");
        if (presentKeys.contains("idSprint") && !eq(existing.getIdSprint(), incoming.getIdSprint()))
            changed.add("idSprint");
        if (presentKeys.contains("idAssignee") && !eq(existing.getIdAssignee(), incoming.getIdAssignee()))
            changed.add("idAssignee");
        if (presentKeys.contains("idParent") && !eq(existing.getIdParent(), incoming.getIdParent()))
            changed.add("idParent");
        return changed;
    }

    private static boolean eq(Object a, Object b) {
        return a == null ? b == null : a.equals(b);
    }

    /**
     * Authorises a partial task update.
     *
     * @param roles         caller roles
     * @param existing      the task as currently stored
     * @param incoming      the task carrying the new values (for ownership/self-assign checks)
     * @param changedFields the JSON keys actually present in the request (already
     *                      stripped of {@code idTask}/{@code requesterId})
     * @param parent        parent of {@code existing} when it is a Sub-task (may be null)
     */
    public static String authorizeTaskUpdate(Roles roles, Project project, Task existing, Task incoming,
                                             Set<String> changedFields, Task parent) {
        if (roles == null || existing == null || !roles.isMember) {
            return "Action non autorisée.";
        }
        if (changedFields == null || changedFields.isEmpty()) {
            return null; // nothing to change
        }

        if (isEpic(existing)) {
            // Epics: Product Owner full control; everyone else read-only.
            return roles.isPO ? null : "Les Epics sont en lecture seule pour votre rôle.";
        }

        if (isSubtask(existing)) {
            if (!roles.isDev) {
                return "Les sous-taches sont en lecture seule pour votre rôle.";
            }
            if (!ownsTaskOrParent(roles, existing, parent)) {
                return "Vous ne pouvez pas modifier une sous-tache assignée à un autre développeur.";
            }
            // A developer cannot reassign a sub-task to someone else.
            if (changedFields.contains("idAssignee")
                    && incoming.getIdAssignee() != null
                    && incoming.getIdAssignee() != roles.userId) {
                return "Vous ne pouvez pas assigner une sous-tache à un autre utilisateur.";
            }
            return null;
        }

        // Bug report: any project member can update a bug (status, description,
        // priority, assignment). The PO/SM retain full control; Devs can
        // self-assign or update status (same pull-system logic as stories).
        if (isBug(existing)) {
            if (roles.isPO || roles.isSM) {
                return null; // full control
            }
            // Developers: same assignment rules as stories (self-assign only)
            if (changedFields.contains("idAssignee")) {
                boolean currentlyUnassigned = existing.getIdAssignee() == null;
                boolean selfAssign = incoming.getIdAssignee() != null
                        && incoming.getIdAssignee() == roles.userId;
                boolean selfUnassign = existing.getIdAssignee() != null
                        && existing.getIdAssignee() == roles.userId
                        && incoming.getIdAssignee() == null;
                if (!(currentlyUnassigned && selfAssign) && !selfUnassign) {
                    return "Vous ne pouvez vous attribuer que des bugs non assignés.";
                }
            }
            return null; // other fields (statut, description, priorite) are open
        }

        //  Standard Story
        for (String field : changedFields) {
            String denial = authorizeStoryField(roles, project, existing, incoming, field);
            if (denial != null) {
                return denial;
            }
        }
        return null;
    }

    /** Per-field rule for editing a Story. Returns null if the field edit is allowed. */
    private static String authorizeStoryField(Roles roles, Project project, Task existing, Task incoming, String field) {
        switch (field) {
            // Scope definition & prioritisation → Product Owner.
            case "titre":
            case "description":
            case "priorite":
            case "typeTache":
            case "idParent":
                return roles.isPO ? null
                        : "Seul le Product Owner peut modifier la portée des stories.";

            // Estimation → Développeurs (estimation collective en Sprint Planning).
            case "storyPoints":
                return roles.isDev ? null
                        : "Seuls les développeurs peuvent estimer les story points.";
            case "idSprint":
                return (roles.isSM || roles.isPO) ? null
                        : "Seul le Scrum Master ou le Product Owner peut déplacer une story entre sprints et backlog.";

            // Assignment → Système pull Agile : seul le Dev peut s'auto-assigner
            // une story non assignée, ou se désassigner de sa propre story.
            case "idAssignee": {
                if (roles.isDev) {
                    boolean currentlyUnassigned = existing.getIdAssignee() == null;
                    boolean selfAssign = incoming.getIdAssignee() != null
                            && incoming.getIdAssignee() == roles.userId;
                    if (currentlyUnassigned && selfAssign) {
                        return null;
                    }
                    // Un dev peut se désassigner de sa propre story (remettre en pool).
                    boolean selfUnassign = existing.getIdAssignee() != null
                            && existing.getIdAssignee() == roles.userId
                            && incoming.getIdAssignee() == null;
                    if (selfUnassign) {
                        return null;
                    }
                    return "Vous ne pouvez vous attribuer que des stories non assignées.";
                }
                return "Seuls les développeurs peuvent s'auto-assigner des stories (système pull).";
            }

            // Board movement (status) → Scrum Master, ou tout Développeur
            // (responsabilité collective de l'équipe face à l'objectif du sprint).
            case "statut": {
                String newStatus = incoming.getStatut();
                if (newStatus != null && project != null) {
                    java.util.List<String> etats = project.getEtats();
                    if (etats != null && !etats.isEmpty()) {
                        String finalStatus = etats.get(etats.size() - 1).trim();
                        if (newStatus.equalsIgnoreCase(finalStatus)) {
                            if (!"APPROVED".equals(existing.getPoValidation())) {
                                return "Impossible de déplacer vers " + finalStatus + " : la tâche doit d'abord être validée (voyant vert) par le Product Owner.";
                            }
                        }
                    }
                }
                if (roles.isPO) {
                    return null;
                }
                if (roles.isSM) {
                    return null;
                }
                if (roles.isDev) {
                    return null; // Responsabilité collective : tout Dev peut déplacer
                }
                return "Vous n'êtes pas autorisé à déplacer cette story.";
            }

            default:
                // Unknown / ignorable fields (e.g. position handled elsewhere).
                return null;
        }
    }

    /**
     * True when a developer owns a sub-task directly (assigned to them) or owns
     * the parent story it belongs to (covering an unassigned sub-task of their
     * own story). A sub-task assigned to another developer is never owned.
     */
    private static boolean ownsTaskOrParent(Roles roles, Task task, Task parent) {
        if (task.getIdAssignee() != null) {
            return task.getIdAssignee() == roles.userId;
        }
        // Unassigned sub-task: ownership flows from the parent story.
        return parent != null && parent.getIdAssignee() != null
                && parent.getIdAssignee() == roles.userId;
    }
}
