import org.apache.catalina.startup.Tomcat;
import java.io.File;

public class TomcatRunner {
    public static void main(String[] args) throws Exception {
        Tomcat tomcat = new Tomcat();
        tomcat.setPort(8080);
        tomcat.getConnector(); // trigger connector creation

        String webappDirLocation = "src/main/webapp";
        tomcat.addWebapp("", new File(webappDirLocation).getAbsolutePath());

        System.out.println("Starting embedded Tomcat on port 8080...");
        tomcat.start();
        tomcat.getServer().await();
    }
}
