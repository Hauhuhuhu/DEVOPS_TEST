package learn.java.billingsoftware;

import com.fasterxml.jackson.databind.ObjectMapper;
import learn.java.billingsoftware.entity.OrderEntity;
import learn.java.billingsoftware.io.PaymentDetails;
import learn.java.billingsoftware.io.PaymentMethod;
import learn.java.billingsoftware.repository.OrderEntityRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration test suite for Requirement R5: Order History Scalability.
 * Validates server-side pagination, search filtering across Order ID, Customer Name,
 * and Phone Number, payment status filtering, and boundary conditions for GET /orders.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class OrderPaginationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private OrderEntityRepository orderEntityRepository;

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    private OrderEntity orderAlpha;
    private OrderEntity orderBeta;
    private OrderEntity orderGamma;

    @BeforeEach
    void setUp() {
        orderAlpha = orderEntityRepository.save(OrderEntity.builder()
                .orderId("ORD-ALPHA-" + UUID.randomUUID().toString().substring(0, 8))
                .customerName("Alpha Nguyen")
                .phoneNumber("0911000001")
                .subtotal(100000.0)
                .tax(10000.0)
                .grandTotal(110000.0)
                .paymentMethod(PaymentMethod.CASH)
                .paymentDetails(PaymentDetails.builder()
                        .status(PaymentDetails.PaymentStatus.COMPLETED)
                        .build())
                .createdAt(LocalDateTime.now().minusHours(2))
                .build());

        orderBeta = orderEntityRepository.save(OrderEntity.builder()
                .orderId("ORD-BETA-" + UUID.randomUUID().toString().substring(0, 8))
                .customerName("Beta Tran")
                .phoneNumber("0922000002")
                .subtotal(200000.0)
                .tax(20000.0)
                .grandTotal(220000.0)
                .paymentMethod(PaymentMethod.PAYOS)
                .paymentDetails(PaymentDetails.builder()
                        .status(PaymentDetails.PaymentStatus.PENDING)
                        .build())
                .createdAt(LocalDateTime.now().minusHours(1))
                .build());

        orderGamma = orderEntityRepository.save(OrderEntity.builder()
                .orderId("ORD-GAMMA-" + UUID.randomUUID().toString().substring(0, 8))
                .customerName("Gamma Le")
                .phoneNumber("0933000003")
                .subtotal(300000.0)
                .tax(30000.0)
                .grandTotal(330000.0)
                .paymentMethod(PaymentMethod.CASH)
                .paymentDetails(PaymentDetails.builder()
                        .status(PaymentDetails.PaymentStatus.FAILED)
                        .build())
                .createdAt(LocalDateTime.now())
                .build());
    }

    @Test
    @DisplayName("Unauthenticated request to GET /orders should be rejected with 401 or 403")
    void testUnauthenticatedAccessToOrdersIsRejected() throws Exception {
        mockMvc.perform(get("/orders"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Default GET /orders returns page 0 with default size and OrderPageResponse structure")
    void testDefaultPaginationReturnsFirstPage() throws Exception {
        mockMvc.perform(get("/orders")
                        .with(user("staff@example.com").roles("USER"))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content", hasSize(greaterThanOrEqualTo(3))))
                .andExpect(jsonPath("$.totalElements", greaterThanOrEqualTo(3)))
                .andExpect(jsonPath("$.totalPages", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.currentPage", is(0)))
                .andExpect(jsonPath("$.pageSize", is(10)));
    }

    @Test
    @DisplayName("Custom page and size query parameters return expected page slice")
    void testCustomPageAndSizePagination() throws Exception {
        mockMvc.perform(get("/orders")
                        .param("page", "0")
                        .param("size", "2")
                        .with(user("admin@example.com").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(2)))
                .andExpect(jsonPath("$.currentPage", is(0)))
                .andExpect(jsonPath("$.pageSize", is(2)))
                .andExpect(jsonPath("$.totalElements", greaterThanOrEqualTo(3)))
                .andExpect(jsonPath("$.totalPages", greaterThanOrEqualTo(2)));
    }

    @Test
    @DisplayName("Search filter matches orderId code")
    void testSearchFilterByOrderId() throws Exception {
        String targetOrderId = orderAlpha.getOrderId();
        mockMvc.perform(get("/orders")
                        .param("search", targetOrderId)
                        .with(user("staff@example.com").roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.content[0].orderId", is(targetOrderId)))
                .andExpect(jsonPath("$.content[0].customerName", is("Alpha Nguyen")));
    }

    @Test
    @DisplayName("Search filter matches customer name (case-insensitive substring)")
    void testSearchFilterByCustomerName() throws Exception {
        mockMvc.perform(get("/orders")
                        .param("search", "Beta Tran")
                        .with(user("staff@example.com").roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.content[0].customerName", is("Beta Tran")))
                .andExpect(jsonPath("$.content[0].phoneNumber", is("0922000002")));
    }

    @Test
    @DisplayName("Search filter matches customer phone number")
    void testSearchFilterByPhoneNumber() throws Exception {
        mockMvc.perform(get("/orders")
                        .param("search", "0933000003")
                        .with(user("admin@example.com").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.content[0].phoneNumber", is("0933000003")))
                .andExpect(jsonPath("$.content[0].customerName", is("Gamma Le")));
    }

    @Test
    @DisplayName("Filter orders by payment status COMPLETED")
    void testFilterByPaymentStatusCompleted() throws Exception {
        mockMvc.perform(get("/orders")
                        .param("status", "COMPLETED")
                        .with(user("staff@example.com").roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.content[*].paymentDetails.status", everyItem(is("COMPLETED"))));
    }

    @Test
    @DisplayName("Filter orders by payment status PENDING")
    void testFilterByPaymentStatusPending() throws Exception {
        mockMvc.perform(get("/orders")
                        .param("status", "PENDING")
                        .with(user("staff@example.com").roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.content[*].paymentDetails.status", everyItem(is("PENDING"))));
    }

    @Test
    @DisplayName("Combined search and status filter returns intersection only")
    void testCombinedSearchAndStatusFilter() throws Exception {
        mockMvc.perform(get("/orders")
                        .param("search", "Alpha")
                        .param("status", "COMPLETED")
                        .with(user("admin@example.com").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].orderId", is(orderAlpha.getOrderId())));
    }

    @Test
    @DisplayName("Search with non-matching keyword returns empty content with 0 total elements")
    void testSearchNonMatchingTermReturnsEmptyResult() throws Exception {
        mockMvc.perform(get("/orders")
                        .param("search", "NON_EXISTENT_ORDER_CODE_XYZ_999")
                        .with(user("staff@example.com").roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(0)))
                .andExpect(jsonPath("$.totalElements", is(0)));
    }

    @Test
    @DisplayName("Boundary condition: page index beyond total pages returns empty content")
    void testPaginationOutOfBoundsReturnsEmptyContent() throws Exception {
        mockMvc.perform(get("/orders")
                        .param("page", "999")
                        .param("size", "10")
                        .with(user("staff@example.com").roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(0)))
                .andExpect(jsonPath("$.currentPage", is(999)));
    }
}