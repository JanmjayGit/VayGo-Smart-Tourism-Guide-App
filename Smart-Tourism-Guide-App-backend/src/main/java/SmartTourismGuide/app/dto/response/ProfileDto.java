package SmartTourismGuide.app.dto.response;

import SmartTourismGuide.app.dto.update.UserPreferencesDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileDto {
    private Long id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String bio;
    private String profilePictureUrl;
    private String role;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private UserPreferencesDto preferences;
}
