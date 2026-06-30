package utils;

/**
 * Small helpers for safely reading request parameters.
 * Keeps servlets from throwing uncaught NumberFormatExceptions (HTTP 500)
 * when clients send missing or non-numeric values.
 */
public class RequestUtils {

    private RequestUtils() {
    }

    /**
     * Parses an integer from a raw request parameter.
     * Returns null when the value is missing, blank, or not a valid integer,
     * letting the caller decide how to respond (typically HTTP 400).
     */
    public static Integer parseIntOrNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        if (trimmed.isEmpty()) {
            return null;
        }
        try {
            return Integer.parseInt(trimmed);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    /**
     * Extracts the authenticated caller's user id from a JSON request body.
     * The frontend attaches {@code requesterId} to every mutating request so the
     * backend can enforce role-based access control. Returns null when absent or
     * not a valid integer.
     */
    public static Integer getRequesterId(com.google.gson.JsonObject body) {
        if (body == null || !body.has("requesterId") || body.get("requesterId").isJsonNull()) {
            return null;
        }
        try {
            return body.get("requesterId").getAsInt();
        } catch (NumberFormatException | UnsupportedOperationException e) {
            return null;
        }
    }

    /**
     * Writes a standardized JSON error response with the given HTTP status.
     */
    public static void writeJsonError(jakarta.servlet.http.HttpServletResponse response,
                                      int status, String message) throws java.io.IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().print("{\"message\":\"error\",\"error\":\"" + jsonEscape(message) + "\"}");
    }

    private static String jsonEscape(String s) {
        if (s == null) {
            return "";
        }
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
