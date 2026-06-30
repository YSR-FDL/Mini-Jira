// Centralised front-end RBAC — mirrors the backend `utils.Rbac`.
//
// Use this everywhere instead of re-deriving isSM/isPO/etc. so the UI shows
// exactly the controls each role is allowed to use:
//   - Administrateur (project creator) : workspace + role/team assignment.
//   - Product Owner (PO)               : Epics CRUD, Story scope, backlog order.
//   - Scrum Master (SM)                : Sprints, sprint↔backlog moves, board.
//                                        Does NOT assign or estimate (Agile).
//   - Développeur (Dev)                : pull-assign, collective estimation,
//                                        collective board movement, own sub-tasks.
import { getRequesterId } from "./authHelper";

const toInt = (v) => (v === null || v === undefined || v === "" ? null : parseInt(v, 10));

/**
 * Resolve a user's roles within a project.
 * @param {object} project  project record (idCreateur, idSM, idPO, idTeam)
 * @param {Array}  teamMembers list of members ({id}) of the project's team
 * @param {number} userId current user id
 */
export const resolveRoles = (project, teamMembers, userId) => {
  const uid = toInt(userId);
  const empty = {
    userId: uid,
    isAdmin: false,
    isSM: false,
    isPO: false,
    isDev: false,
    isMember: false,
  };
  if (!project || uid === null) return empty;

  const isAdmin = toInt(project.idCreateur) === uid;
  const isSM = toInt(project.idSM) === uid;
  const isPO = toInt(project.idPO) === uid;
  const isTeamMember =
    Array.isArray(teamMembers) &&
    teamMembers.some((m) => toInt(m.id) === uid);
  const isDev = isTeamMember && !isAdmin && !isSM && !isPO;
  return {
    userId: uid,
    isAdmin,
    isSM,
    isPO,
    isDev,
    isMember: isAdmin || isSM || isPO || isDev,
  };
};

/** Convenience: resolve roles for the currently logged-in user. */
export const currentRoles = (project, teamMembers) =>
  resolveRoles(project, teamMembers, getRequesterId());

// ── Task type ──────────────────────────────────────────────────────────
export const taskType = (task) => {
  const t =
    (task && (task.type || (task.tags && task.tags[0]))) || "Feature";
  if (/^epic$/i.test(t)) return "Epic";
  if (/^(subtask|sub-task|sous-tache|sous-tâche)$/i.test(t)) return "Subtask";
  return "Story";
};

const assigneeId = (task) => {
  if (!task) return null;
  if (task.assignee && task.assignee.id !== undefined)
    return toInt(task.assignee.id);
  if (task.idAssignee !== undefined) return toInt(task.idAssignee);
  return null;
};

const devOwns = (roles, task, parentTask) => {
  const a = assigneeId(task);
  if (a !== null) return a === roles.userId;
  // Unassigned: ownership flows from the parent story.
  const pa = assigneeId(parentTask);
  return pa !== null && pa === roles.userId;
};

// ── Project-level predicates ─────────────────────────────────────────────
export const canManageSprints = (roles) => !!roles && roles.isSM;
// Sprint Goal (objectif) — SM or PO (RACI: Define Sprint Goals PO=R, SM=RA).
export const canEditSprintGoal = (roles) => !!roles && (roles.isSM || roles.isPO);
export const canCreateEpic = (roles) => !!roles && roles.isPO;
export const canManageEpics = (roles) => !!roles && roles.isPO; // create/attach/detach/delete
export const canCreateStory = (roles) => !!roles && roles.isPO;
export const canReorderBacklog = (roles) => !!roles && (roles.isSM || roles.isPO);
// Sprint backlog placement (assign a story to a sprint / backlog) — SM or PO.
export const canAssignStoryToSprint = (roles) => !!roles && (roles.isSM || roles.isPO);
export const canEditProjectSettings = (roles) => !!roles && roles.isAdmin;
export const canArchiveOrDeleteProject = (roles) => !!roles && roles.isAdmin;
export const canAssignTeamOrRoles = (roles) => !!roles && roles.isAdmin;

/** Can this user create a sub-task under the given parent story? */
export const canCreateSubtaskUnder = (roles, parentStory) =>
  !!roles && roles.isDev && assigneeId(parentStory) === roles.userId;

/** Can this user submit the deliverable (GitHub link) of the given sub-task? */
export const canSubmitDeliverable = (roles, subtask, parentTask) =>
  !!roles && roles.isDev && taskType(subtask) === "Subtask" && devOwns(roles, subtask, parentTask);

/** Can this user move the given task on the board (status change)? */
export const canMoveOnBoard = (roles, task, parentTask) => {
  if (!roles) return false;
  const type = taskType(task);
  if (type === "Epic") return roles.isPO;
  // Responsabilité collective : tout Dev peut déplacer n'importe quel ticket.
  if (type === "Subtask") return roles.isDev;
  // Story
  return roles.isSM || roles.isDev;
};

/**
 * Field-level permissions for a task, keyed by the matrix. Returns booleans the
 * UI uses to show/enable each control. `parentTask` is the parent story when
 * `task` is a sub-task (optional).
 */
export const taskPermissions = (roles, task, parentTask) => {
  const type = taskType(task);
  const none = {
    type,
    canEditTitle: false,
    canEditDescription: false,
    canEditType: false,
    canEditPriority: false,
    canEditStatus: false,
    canEditPoints: false,
    canEditParent: false,
    canEditAssignee: false,
    canDelete: false,
    canManageSubtasks: false,
    canToggleSubtask: false,
    canSubmitDeliverable: false,
    canRejectDeliverable: false,
    assigneeScope: "none", // 'team' | 'self' | 'none'
  };
  if (!roles || !roles.isMember) return none;

  if (type === "Epic") {
    const po = roles.isPO;
    return {
      ...none,
      canEditTitle: po,
      canEditDescription: po,
      canEditPriority: po,
      canEditStatus: po,
      canDelete: po,
    };
  }

  if (type === "Subtask") {
    const owns = roles.isDev && devOwns(roles, task, parentTask);
    const po = roles.isPO;
    const canMove = roles.isSM || roles.isDev || roles.isPO;
    return {
      ...none,
      canEditTitle: owns || roles.isPO, // Allow PO to edit title if needed, or just owns
      canEditDescription: owns || roles.isPO,
      canEditPriority: owns || roles.isPO,
      canEditStatus: canMove,
      canEditPoints: owns || roles.isDev,
      canEditAssignee: roles.isDev,
      canDelete: owns || roles.isSM || roles.isPO,
      canToggleSubtask: canMove,
      canSubmitDeliverable: owns,
      canRejectDeliverable: po,
      assigneeScope: roles.isDev ? "team" : "none",
    };
  }

  // ── Story ──
  const ownsStory = assigneeId(task) === roles.userId;
  const unassigned = assigneeId(task) === null;
  return {
    ...none,
    // Scope & prioritisation → Product Owner.
    canEditTitle: roles.isPO,
    canEditDescription: roles.isPO,
    canEditType: roles.isPO,
    canEditPriority: roles.isPO,
    canEditParent: roles.isPO,
    // Estimation → Développeurs (estimation collective en Sprint Planning).
    canEditPoints: roles.isDev,
    // Board → SM ou tout Dev (responsabilité collective).
    canEditStatus: roles.isSM || roles.isDev,
    // Assignment → Système pull : Dev s'auto-assigne ou se désassigne.
    canEditAssignee: roles.isDev && (unassigned || ownsStory),
    assigneeScope: roles.isDev && (unassigned || ownsStory) ? "self" : "none",
    // Deletion → Scrum Master or Product Owner.
    canDelete: roles.isSM || roles.isPO,
    // Sub-tasks belong to the Dev who owns the story.
    canManageSubtasks: roles.isDev && ownsStory,
    canToggleSubtask: roles.isDev && ownsStory,
  };
};
