package lk.ijse.springboot.nexus_retail_ecosystem.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Find the absolute path to your uploads folder
        String uploadPath = "file:///" + System.getProperty("user.dir") + "/uploads/";

        // Tell Spring: "If a URL starts with /uploads/, go look inside this physical folder!"
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadPath);
    }
}