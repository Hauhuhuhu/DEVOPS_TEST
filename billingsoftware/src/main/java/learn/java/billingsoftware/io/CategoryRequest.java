package learn.java.billingsoftware.io;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@NoArgsConstructor // Tạo constructor rỗng cho Jackson
@AllArgsConstructor // Bắt buộc phải có để @Builder hoạt động cùng @NoArgsConstructor
public class CategoryRequest {
    private String name;
    private String description;
    private String bgColor;

}
