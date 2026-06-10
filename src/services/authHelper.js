// Reads the currently logged-in user's id from localStorage.
// The backend uses this `requesterId` to enforce role-based access control
// (Administrateur / Product Owner / Scrum Master / Développeur).
export const getRequesterId = () => {
    try {
        const userString = localStorage.getItem('user');
        if (!userString) return null;
        const user = JSON.parse(userString);
        if (user && user.id !== undefined && user.id !== null) {
            return parseInt(user.id, 10);
        }
        return null;
    } catch (e) {
        return null;
    }
};
