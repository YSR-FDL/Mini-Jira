package utils;

import java.util.HashMap;
import java.util.Map;

/**
 * Generates assignee display metadata (initials, color) dynamically.
 * Colors are deterministic based on user ID — same user always gets the same color.
 * This keeps UI-specific data out of the database.
 */
public class AssigneeHelper {

    private static final String[] COLOR_PALETTE = {
        "#185fa5", "#ef9f27", "#10b981", "#8b5cf6",
        "#ec4899", "#f97316", "#06b6d4", "#dc2626",
        "#84cc16", "#6366f1", "#14b8a6", "#f43f5e"
    };

    /**
     * Generates initials from first name and last name.
     * e.g. "Yasser" + "Fathi" → "YF"
     *      "Khalid" + null → "KL"
     */
    public static String getInitials(String prenom, String nom) {
        StringBuilder initials = new StringBuilder();
        if (prenom != null && !prenom.isEmpty()) {
            initials.append(Character.toUpperCase(prenom.charAt(0)));
        }
        if (nom != null && !nom.isEmpty()) {
            initials.append(Character.toUpperCase(nom.charAt(0)));
        }
        // Fallback if both are empty
        if (initials.length() == 0) {
            return "??";
        }
        // If only one letter, duplicate it (e.g. "Khalid" alone → "KH" using first 2 chars)
        if (initials.length() == 1 && prenom != null && prenom.length() > 1) {
            initials.append(Character.toUpperCase(prenom.charAt(1)));
        }
        return initials.toString();
    }

    /**
     * Returns a deterministic color for a given user ID.
     * Same user ID always maps to the same color.
     */
    public static String getColor(int userId) {
        return COLOR_PALETTE[Math.abs(userId) % COLOR_PALETTE.length];
    }

    /**
     * Builds a complete assignee map ready for JSON serialization.
     * Returns null if userId is 0 (no assignee).
     */
    public static Map<String, Object> buildAssigneeMap(int userId, String prenom, String nom) {
        if (userId == 0) return null;

        Map<String, Object> assignee = new HashMap<>();
        String fullName = (prenom != null ? prenom : "") + (nom != null ? " " + nom : "");
        assignee.put("id", userId);
        assignee.put("name", fullName.trim());
        assignee.put("initials", getInitials(prenom, nom));
        assignee.put("bgColor", getColor(userId));
        assignee.put("textColor", "#FFF");
        return assignee;
    }
}
