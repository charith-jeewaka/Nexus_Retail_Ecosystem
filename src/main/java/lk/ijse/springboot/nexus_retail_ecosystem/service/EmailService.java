package lk.ijse.springboot.nexus_retail_ecosystem.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    // Spring Boot automatically configures this based on your application.properties!
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String senderEmail;

    @Async // Runs this in the background
    public void sendWelcomeEmail(String toEmail, String username) {
        try {
            //if we didnt use new it will conflict when two users register the same time
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(senderEmail);
            message.setTo(toEmail);
            message.setSubject("Welcome to Nexus Retail Ecosystem!");
            message.setText("Hello " + username + ",\n\n" +
                    "Your account has been successfully created. Welcome aboard!\n\n" +
                    "Best Regards,\nNexus POS Team");

            mailSender.send(message);
            System.out.println("Welcome email sent successfully to " + toEmail);

        } catch (Exception e) {
            System.err.println("Failed to send email to " + toEmail + ": " + e.getMessage());
        }
    }
}
