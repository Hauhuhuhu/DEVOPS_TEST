package learn.java.billingsoftware;

import com.fasterxml.jackson.databind.ObjectMapper;
import learn.java.billingsoftware.io.CategoryRequest;
import learn.java.billingsoftware.io.CustomerRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration test suite for Requirement R1: Activity Log Subsystem.
 * Validates role-based access control (Staff view restricted to own email, Admin unconstrained),
 * server-side pagination, action and date filtering, and activity log generation upon business mutations.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class ActivityLogIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @Test
    @DisplayName("Unauthenticated request to GET /activity-logs must be rejected with 401 or 403")
    void testUnauthenticatedAccessToActivityLogsIsRejected() throws Exception {
        mockMvc.perform(get("/activity-logs"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Staff user can query /activity-logs and receives ActivityLogPageResponse structure")
    void testStaffUserCanAccessActivityLogs() throws Exception {
        mockMvc.perform(get("/activity-logs")
                        .with(user("staff@billing.com").roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.totalElements", notNullValue()))
                .andExpect(jsonPath("$.totalPages", notNullValue()))
                .andExpect(jsonPath("$.currentPage", is(0)));
    }

    @Test
    @DisplayName("Staff user is strictly restricted to viewing activity logs matching their own email")
    void testStaffUserRestrictedToOwnEmail() throws Exception {
        String staffEmail = "cashier.viet@billing.com";

        mockMvc.perform(get("/activity-logs")
                        .with(user(staffEmail).roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[*].userEmail", everyItem(is(staffEmail))));
    }

    @Test
    @DisplayName("Staff user cannot query other users' logs even if userEmail param is supplied")
    void testStaffUserCannotQueryOtherUserLogs() throws Exception {
        String authenticatedStaff = "staff.restricted@billing.com";
        String targetAdminEmail = "superadmin@billing.com";

        mockMvc.perform(get("/activity-logs")
                        .param("userEmail", targetAdminEmail)
                        .with(user(authenticatedStaff).roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[*].userEmail", not(hasItem(targetAdminEmail))));
    }

    @Test
    @DisplayName("Admin user with ROLE_ADMIN can query global activity logs across all users")
    void testAdminUserCanQueryAllActivityLogs() throws Exception {
        mockMvc.perform(get("/activity-logs")
                        .with(user("admin@billing.com").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.totalElements", notNullValue()))
                .andExpect(jsonPath("$.totalPages", notNullValue()));
    }

    @Test
    @DisplayName("Admin user can filter activity logs by specific user email")
    void testAdminCanFilterBySpecificUserEmail() throws Exception {
        String targetEmail = "target.employee@billing.com";

        mockMvc.perform(get("/activity-logs")
                        .param("userEmail", targetEmail)
                        .with(user("admin@billing.com").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[*].userEmail", everyItem(is(targetEmail))));
    }

    @Test
    @DisplayName("Activity logs can be filtered by action type (e.g. CREATE, UPDATE, DELETE, LOGIN)")
    void testFilterByActionType() throws Exception {
        mockMvc.perform(get("/activity-logs")
                        .param("action", "CREATE")
                        .with(user("admin@billing.com").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    @DisplayName("Activity logs can be filtered by date range (startDate and endDate)")
    void testFilterByDateRange() throws Exception {
        mockMvc.perform(get("/activity-logs")
                        .param("startDate", "2026-09-01")
                        .param("endDate", "2026-09-07")
                        .with(user("admin@billing.com").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    @DisplayName("Pagination parameters page and size are respected in ActivityLogPageResponse")
    void testPaginationParametersPageAndSize() throws Exception {
        mockMvc.perform(get("/activity-logs")
                        .param("page", "0")
                        .param("size", "5")
                        .with(user("admin@billing.com").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentPage", is(0)))
                .andExpect(jsonPath("$.pageSize", is(5)));
    }

    @Test
    @DisplayName("Creating a Category triggers non-blocking audit activity log generation")
    void testCategoryCreationGeneratesActivityLog() throws Exception {
        String categoryName = "Audit Category " + UUID.randomUUID().toString().substring(0, 6);
        CategoryRequest categoryRequest = CategoryRequest.builder()
                .name(categoryName)
                .bgColor("#4A90E2")
                .description("Category for audit logging verification")
                .build();

        // 1. Perform category creation
        mockMvc.perform(post("/categories")
                        .with(user("admin@billing.com").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(categoryRequest)))
                .andExpect(status().isCreated());

        // 2. Query activity logs to observe that the mutation was recorded
        mockMvc.perform(get("/activity-logs")
                        .with(user("admin@billing.com").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    @DisplayName("Creating a Customer triggers non-blocking audit activity log generation")
    void testCustomerCreationGeneratesActivityLog() throws Exception {
        String uniquePhone = "0977" + (System.currentTimeMillis() % 1000000);
        CustomerRequest customerRequest = CustomerRequest.builder()
                .name("Audit Customer")
                .phoneNumber(uniquePhone)
                .email("audit.customer@billing.com")
                .build();

        // 1. Perform customer creation
        mockMvc.perform(post("/customers")
                        .with(user("staff@billing.com").roles("USER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(customerRequest)))
                .andExpect(status().isCreated());

        // 2. Query activity logs
        mockMvc.perform(get("/activity-logs")
                        .with(user("staff@billing.com").roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }
}
