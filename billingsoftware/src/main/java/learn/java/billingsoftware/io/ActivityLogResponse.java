package learn.java.billingsoftware.io;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityLogResponse {
    private Long id;
    private String logId;
    private String userEmail;
    private String action;
    private String entityType;
    private String entityId;
    private String description;
    private LocalDateTime timestamp;
    private LocalDateTime createdAt;
}
