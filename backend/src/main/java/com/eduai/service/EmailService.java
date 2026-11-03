package com.eduai.service;

import com.eduai.model.entity.Feedback;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.owner-email}")
    private String ownerEmail;

    @Async
    public void sendFeedbackEmail(Feedback feedback) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(ownerEmail);
            helper.setSubject("New Feedback [" + feedback.getCategory() + "]: " + feedback.getSubject());

            String htmlContent = String.format("""
                    <html>
                    <body>
                        <h2>New Feedback Received</h2>
                        <p><strong>From:</strong> %s (%s)</p>
                        <p><strong>Category:</strong> %s</p>
                        <hr/>
                        <p>%s</p>
                    </body>
                    </html>
                    """,
                    feedback.getSenderName() != null ? feedback.getSenderName() : "Anonymous",
                    feedback.getSenderEmail() != null ? feedback.getSenderEmail() : "No Email",
                    feedback.getCategory(),
                    feedback.getMessage().replace("\n", "<br/>"));

            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Feedback email sent to owner for feedback ID: {}", feedback.getId());
        } catch (MessagingException e) {
            log.error("Failed to send feedback email", e);
        }
    }
}
