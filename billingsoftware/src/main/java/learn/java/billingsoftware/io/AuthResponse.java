package learn.java.billingsoftware.io;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {

    private String email;
    private String token;
    private String role;
    private String name;

    public AuthResponse(String email, String token, String role) {
        this.email = email;
        this.token = token;
        this.role = role;
        this.name = null;
    }
}
