package SmartTourismGuide.app.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "user_preferences")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserPreferences {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @NotNull
    @Column(length = 10)
    private String language = "en";

    @NotNull
    @Column(length = 10)
    private String currency = "USD";

    @NotNull
    private Boolean notificationsEnabled = true;

    @NotNull
    @Column(length = 10)
    private String theme = "light";

    @Column(columnDefinition = "TEXT")
    private String travelInterests; // JSON array stored as text
}
