import axios from 'axios';

const API = 'http://localhost:8080/Backend_PFA';

const toRawId = (id) => parseInt(String(id).replace(/^[A-Z]+-/, ''), 10);

const mapComment = (c) => ({
    id: c.idCommentaire,
    taskId: c.idTask,
    contenu: c.contenu,
    dateCreation: c.dateCreation,
    authorId: c.idAuteur,
    author: c.auteur, // { id, name, initials, bgColor, textColor } ou null
});

export const commentService = {
    // Commentaires d'une tâche, du plus ancien au plus récent.
    getByTask: (taskId) =>
        axios.get(`${API}/GetTaskComments?taskId=${toRawId(taskId)}`)
            .then(r => (r.data || []).map(mapComment)),

    add: ({ taskId, authorId, contenu }) =>
        axios.post(`${API}/AddComment`, {
            idTask: toRawId(taskId),
            idAuteur: authorId != null ? parseInt(authorId, 10) : null,
            contenu,
        }).then(r => r.data),

    remove: (commentId) =>
        axios.post(`${API}/DeleteComment`, { commentId: parseInt(commentId, 10) })
            .then(r => r.data),
};
