package learn.java.billingsoftware;

import com.fasterxml.jackson.databind.ObjectMapper;
import learn.java.billingsoftware.entity.UserEntity;
import learn.java.billingsoftware.io.AuthRequest;
import learn.java.billingsoftware.repository.UserRepository;
import learn.java.billingsoftware.service.RefreshTokenService;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class AuthAndMenubarIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private RefreshTokenService refreshTokenService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private UserEntity testUser;

    @BeforeEach
    void setUp() {
        testUser = userRepository.save(UserEntity.builder()
                .userId(UUID.randomUUID().toString())
                .name("Nguyen Van Cashier")
                .email("cashier" + System.currentTimeMillis() + "@test.com")
                .password(passwordEncoder.encode("Secret123"))
                .role("ROLE_STAFF")
                .build());
    }

    @Test
    void testLoginWithWrongPasswordReturns401() throws Exception {
        AuthRequest request = new AuthRequest(testUser.getEmail(), "WrongPassword");

        mockMvc.perform(post("/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testLoginWithNonExistentEmailReturns401() throws Exception {
        AuthRequest request = new AuthRequest("nonexistent@domain.com", "anyPassword");

        mockMvc.perform(post("/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testLoginSuccessReturnsNameAndRole() throws Exception {
        AuthRequest request = new AuthRequest(testUser.getEmail(), "Secret123");

        mockMvc.perform(post("/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(testUser.getEmail()))
                .andExpect(jsonPath("$.role").value("ROLE_STAFF"))
                .andExpect(jsonPath("$.name").value("Nguyen Van Cashier"))
                .andExpect(jsonPath("$.token").isNotEmpty());
    }

     @Test
    void testRefreshReturnsNameAndRole() throws Exception {
        RefreshTokenService.IssuedRefreshToken issued = refreshTokenService.issue(testUser.getEmail());

        mockMvc.perform(post("/auth/refresh")
                        .cookie(new Cookie("refreshToken", issued.getRawToken())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(testUser.getEmail()))
                .andExpect(jsonPath("$.role").value("ROLE_STAFF"))
                .andExpect(jsonPath("$.name").value("Nguyen Van Cashier"))
                .andExpect(jsonPath("$.token").isNotEmpty());
    }
}
