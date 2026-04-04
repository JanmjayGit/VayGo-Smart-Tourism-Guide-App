package SmartTourismGuide.app.dto.response;

import SmartTourismGuide.app.enums.EventCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventSummaryDto implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;
    private String name;
    private EventCategory category;
    private LocalDate eventDate;
    private String city;
    private String venue;
    private Boolean isFree;
    private String imageUrl;
    private List<String> imageUrls;
}
