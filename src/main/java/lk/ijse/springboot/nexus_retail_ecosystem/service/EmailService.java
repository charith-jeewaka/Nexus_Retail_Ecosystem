package lk.ijse.springboot.nexus_retail_ecosystem.service;

import jakarta.mail.internet.MimeMessage;
import lk.ijse.springboot.nexus_retail_ecosystem.entity.Order;
import lk.ijse.springboot.nexus_retail_ecosystem.entity.OrderDetail;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
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

    //plain text email

//    @Async
//    public void sendOrderConfirmationText(String toEmail, String customerName, Order order) {
//        try {
//            SimpleMailMessage message = new SimpleMailMessage();
//            message.setFrom(senderEmail);
//            message.setTo(toEmail);
//            message.setSubject("Order Confirmation - #" + order.getId());
//
//            // Build the receipt text dynamically
//            StringBuilder body = new StringBuilder();
//            body.append("Hello ").append(customerName).append(",\n\n");
//            body.append("Thank you for shopping with Nexus Retail Ecosystem! Here are your order details:\n\n");
//
//            body.append("Order ID: #").append(order.getId()).append("\n");
//            body.append("Date: ").append(order.getOrderDate().toString()).append("\n");
//            body.append("Status: ").append(order.getStatus()).append("\n\n");
//
//            body.append("Items Ordered:\n");
//            body.append("--------------------------------------------------\n");
//
//            // Loop through the items!
//            for (OrderDetail item : order.getOrderDetails()) {
//                body.append("- ")
//                        .append(item.getProduct().getName())
//                        .append(" (x").append(item.getQuantity()).append(") ")
//                        .append("........ Rs. ").append(item.getSubtotal())
//                        .append("\n");
//            }
//
//            body.append("--------------------------------------------------\n");
//            body.append("Grand Total: Rs. ").append(order.getTotalAmount()).append("\n\n");
//            body.append("We will notify you once your order is processing.\n\n");
//            body.append("Best Regards,\nNexus POS Team");
//
//            message.setText(body.toString());
//            mailSender.send(message);
//
//            System.out.println("Order confirmation sent to " + toEmail);
//
//        } catch (Exception e) {
//            System.err.println("Failed to send order email to " + toEmail + ": " + e.getMessage());
//        }
//    }

    @Async
    public void sendOrderConfirmationHtml(String toEmail, String customerName, Order order) {
        try {
            // MimeMessage allows for HTML content!
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(senderEmail);
            helper.setTo(toEmail);
            helper.setSubject("Your Nexus Order Receipt - #" + order.getId());

            // Build an HTML table for the receipt
            StringBuilder html = new StringBuilder();
            html.append("<h2 style='color: #0d6efd;'>Thank you for your order, ").append(customerName).append("!</h2>");
            html.append("<p>Your order <b>#").append(order.getId()).append("</b> has been placed successfully.</p>");

            html.append("<table style='width: 100%; border-collapse: collapse; margin-top: 20px;'>");
            html.append("<tr style='background-color: #f8f9fa; border-bottom: 2px solid #dee2e6;'>");
            html.append("<th style='padding: 10px; text-align: left;'>Item</th>");
            html.append("<th style='padding: 10px; text-align: center;'>Qty</th>");
            html.append("<th style='padding: 10px; text-align: right;'>Price</th>");
            html.append("</tr>");

            for (OrderDetail item : order.getOrderDetails()) {
                html.append("<tr style='border-bottom: 1px solid #dee2e6;'>");
                html.append("<td style='padding: 10px;'>").append(item.getProduct().getName()).append("</td>");
                html.append("<td style='padding: 10px; text-align: center;'>").append(item.getQuantity()).append("</td>");
                html.append("<td style='padding: 10px; text-align: right;'>Rs. ").append(item.getSubtotal()).append("</td>");
                html.append("</tr>");
            }

            html.append("<tr>");
            html.append("<td colspan='2' style='padding: 10px; text-align: right; font-weight: bold;'>Grand Total:</td>");
            html.append("<td style='padding: 10px; text-align: right; font-weight: bold; color: #198754;'>Rs. ").append(order.getTotalAmount()).append("</td>");
            html.append("</tr>");
            html.append("</table>");

            html.append("<p style='margin-top: 20px; color: #6c757d;'>We will notify you when your order is processing.</p>");

            helper.setText(html.toString(), true);

            mailSender.send(message);
            System.out.println("HTML Order confirmation sent to " + toEmail);

        } catch (Exception e) {
            System.err.println("Failed to send HTML order email to " + toEmail + ": " + e.getMessage());
        }
    }
}
