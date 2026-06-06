package controllers.agile;

import jakarta.servlet.ServletConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import structures_DAO.TaskDAO;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;

import com.google.gson.Gson;
import classes.Task;

@WebServlet("/UpdateTask")
public class UpdateTask extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private TaskDAO taskDAO;

    @Override
    public void init(ServletConfig config) throws ServletException {
        taskDAO = new TaskDAO();
    }

    @Override
    protected void doOptions(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");
        response.setStatus(HttpServletResponse.SC_OK);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");

        BufferedReader reader = request.getReader();
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            sb.append(line);
        }

        Gson gson = new Gson();
        Task task = gson.fromJson(sb.toString(), Task.class);
        int nb;
        if (task.getTitre() == null && task.getTypeTache() != null) {
            nb = taskDAO.updateTaskType(task.getIdTask(), task.getTypeTache());
        } else {
            nb = taskDAO.updateTask(task);
        }

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();
        if (nb > 0) {
            out.print("{\"message\":\"success\"}");
        } else {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"message\":\"error\"}");
        }
    }
}
