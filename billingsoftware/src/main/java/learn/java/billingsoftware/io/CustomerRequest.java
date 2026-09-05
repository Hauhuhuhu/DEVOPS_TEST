package learn.java.billingsoftware.io;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CustomerRequest {
    private String name;
    private String phoneNumber;
    private String email;
}
