package lk.ijse.springboot.nexus_retail_ecosystem;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@EnableAsync
@SpringBootApplication
public class NexusRetailEcoSystemApplication {

    public static void main(String[] args) {
        SpringApplication.run(NexusRetailEcoSystemApplication.class, args);
    }

}
