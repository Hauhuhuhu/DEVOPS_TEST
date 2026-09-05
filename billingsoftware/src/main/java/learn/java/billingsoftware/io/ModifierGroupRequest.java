package learn.java.billingsoftware.io;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ModifierGroupRequest {
    private String name;
    private String description;
    private Integer minSelections;
    private Integer maxSelections;
    private List<ModifierRequest> modifiers;
}
