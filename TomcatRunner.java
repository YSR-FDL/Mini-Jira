import org.apache.catalina.startup.Tomcat;
import java.io.File;

public class TomcatRunner {
    public static void main(String[] args) throws Exception {
        Tomcat tomcat = new Tomcat();
        tomcat.setPort(8080);
        tomcat.getConnector();
        String webappDir = "src/main/webapp";
        tomcat.addWebapp("/Backend_PFA", new File(webappDir).getAbsolutePath());
        System.out.println("Starting embedded Tomcat on port 8080...");
        tomcat.start();
        tomcat.getServer().await();
    }
}
