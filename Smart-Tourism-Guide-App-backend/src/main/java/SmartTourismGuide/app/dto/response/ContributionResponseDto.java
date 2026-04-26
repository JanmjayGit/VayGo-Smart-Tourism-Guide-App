package SmartTourismGuide.app.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContributionResponseDto {
    private Long id;
    private String type;          // "PLACE" | "EVENT" | "HOTEL"
    private String name;
    private String city;
    private String imageUrl;
    private List<String> imageUrls;
    private String category;
    private String status;        // "PENDING" | "APPROVED" | "REJECTED"
    private Boolean verified;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}