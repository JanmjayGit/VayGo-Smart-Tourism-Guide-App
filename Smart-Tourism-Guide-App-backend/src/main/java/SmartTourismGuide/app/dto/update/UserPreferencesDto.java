package SmartTourismGuide.app.dto.update;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPreferencesDto {
    @NotBlank(message = "Language is required")
    @Size(max = 10, message = "Language code must not exceed 10 characters")
    private String language;

    @NotBlank(message = "Currency is required")
    @Size(max = 10, message = "Currency code must not exceed 10 characters")
    private String currency;

    @NotNull(message = "Notifications enabled flag is required")
    private Boolean notificationsEnabled;

    @NotBlank(message = "Theme is required")
    @Size(max = 10, message = "Theme must not exceed 10 characters")
    private String theme;

    private String travelInterests; // JSON array as string
}
