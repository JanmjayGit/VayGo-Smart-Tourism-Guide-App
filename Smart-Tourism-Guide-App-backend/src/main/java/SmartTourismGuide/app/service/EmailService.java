package SmartTourismGuide.app.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @org.springframework.beans.factory.annotation.Value("${spring.mail.properties.mail.smtp.from}")
    private String fromAddress;

    /**
     * Sends a password-reset link to the given email address.
     *
     * @param toEmail   recipient address
     * @param resetLink full URL including the token, e.g.
     *                  http://localhost:5173/reset-password?token=xyz
     */
    public void sendPasswordResetEmail(String toEmail, String resetLink) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(toEmail);
        message.setSubject("VayGo – Reset your password");
        message.setText(
                "Hi,\n\n" +
                        "We received a request to reset your VayGo account password.\n\n" +
                        "Click the link below to set a new password. This link expires in 30 minutes:\n\n" +
                        resetLink + "\n\n" +
                        "If you did not request a password reset, you can safely ignore this email.\n\n" +
                        "– The VayGo Team");
        mailSender.send(message);
    }
}
