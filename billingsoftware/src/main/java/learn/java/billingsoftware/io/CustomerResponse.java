package learn.java.billingsoftware.io;

import lombok.*;

import java.sql.Timestamp;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CustomerResponse {
    private String customerId;
    private String name;
    private String phoneNumber;
    private String email;
    private Double totalSpent;
    private Integer orderCount;
    private Timestamp createdAt;
    private Timestamp updatedAt;
}
