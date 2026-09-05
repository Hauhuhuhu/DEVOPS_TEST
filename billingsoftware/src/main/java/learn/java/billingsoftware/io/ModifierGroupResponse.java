package learn.java.billingsoftware.io;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ModifierGroupResponse {
    private String groupId;
    private String name;
    private String description;
    private Integer minSelections;
    private Integer maxSelections;
    private List<ModifierResponse> modifiers;
    private Timestamp createdAt;
    private Timestamp updatedAt;
}
