package learn.java.billingsoftware;

import com.fasterxml.jackson.databind.ObjectMapper;
import learn.java.billingsoftware.entity.DiscountType;
import learn.java.billingsoftware.entity.PromotionEntity;
import learn.java.billingsoftware.entity.PromotionType;
import learn.java.billingsoftware.io.PromotionRequest;
import learn.java.billingsoftware.repository.PromotionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class PromotionIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PromotionRepository promotionRepository;

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    private PromotionEntity existingCoupon;

    @BeforeEach
    void setUp() {
        existingCoupon = promotionRepository.save(PromotionEntity.builder()
                .promotionId(UUID.randomUUID().toString())
                .name("Winter Sale 2026")
                .description("Get 20K off orders over 100K")
                .type(PromotionType.COUPON)
                .code("WINTER20K")
                .discountType(DiscountType.FIXED_AMOUNT)
                .discountValue(BigDecimal.valueOf(20000.0))
                .minOrderAmount(BigDecimal.valueOf(100000.0))
                .startDate(LocalDate.now().minusDays(5))
                .endDate(LocalDate.now().plusDays(10))
                .usageLimit(100)
                .timesUsed(5)
                .isActive(true)
                .build());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testCreateCouponPromotionSuccess() throws Exception {
        PromotionRequest request = PromotionRequest.builder()
                .name("Summer Splash 10%")
                .description("10% off for all summer orders")
                .type(PromotionType.COUPON)
                .code("summer10") // lowercase should be normalized to UPPERCASE
                .discountType(DiscountType.PERCENTAGE)
                .discountValue(BigDecimal.valueOf(10.0))
                .maxDiscountAmount(BigDecimal.valueOf(50000.0))
                .minOrderAmount(BigDecimal.valueOf(50000.0))
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusMonths(1))
                .usageLimit(500)
                .isActive(true)
                .build();

        mockMvc.perform(post("/admin/promotions")
                        .with(user("admin").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.promotionId", notNullValue()))
                .andExpect(jsonPath("$.name", is("Summer Splash 10%")))
                .andExpect(jsonPath("$.code", is("SUMMER10")))
                .andExpect(jsonPath("$.type", is("COUPON")))
                .andExpect(jsonPath("$.discountType", is("PERCENTAGE")))
                .andExpect(jsonPath("$.discountValue", is(10.0)))
                .andExpect(jsonPath("$.timesUsed", is(0)))
                .andExpect(jsonPath("$.isActive", is(true)));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testCreateHappyHourPromotionSuccess() throws Exception {
        PromotionRequest request = PromotionRequest.builder()
                .name("Happy Afternoon")
                .description("15% off drinks from 14:00 to 17:00 weekdays")
                .type(PromotionType.HAPPY_HOUR)
                .discountType(DiscountType.PERCENTAGE)
                .discountValue(BigDecimal.valueOf(15.0))
                .startTime(LocalTime.of(14, 0))
                .endTime(LocalTime.of(17, 0))
                .daysOfWeek("MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY")
                .isActive(true)
                .build();

        mockMvc.perform(post("/admin/promotions")
                        .with(user("admin").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.promotionId", notNullValue()))
                .andExpect(jsonPath("$.type", is("HAPPY_HOUR")))
                .andExpect(jsonPath("$.daysOfWeek", is("MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY")))
                .andExpect(jsonPath("$.startTime", is("14:00:00")));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testCreateBogoPromotionSuccess() throws Exception {
        PromotionRequest request = PromotionRequest.builder()
                .name("Buy Milk Tea Get Topping Free")
                .type(PromotionType.BOGO)
                .buyVariantId("VAR-TEA-001")
                .getVariantId("VAR-TOP-001")
                .bogoDiscountPercent(BigDecimal.valueOf(100.0))
                .isActive(true)
                .build();

        mockMvc.perform(post("/admin/promotions")
                        .with(user("admin").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.type", is("BOGO")))
                .andExpect(jsonPath("$.buyVariantId", is("VAR-TEA-001")))
                .andExpect(jsonPath("$.bogoDiscountPercent", is(100.0)));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testTogglePromotionActiveStatus() throws Exception {
        mockMvc.perform(patch("/admin/promotions/" + existingCoupon.getPromotionId() + "/toggle")
                        .with(user("admin").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isActive", is(false)));

        mockMvc.perform(patch("/admin/promotions/" + existingCoupon.getPromotionId() + "/toggle")
                        .with(user("admin").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isActive", is(true)));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testDuplicateCouponCodeThrowsConflict() throws Exception {
        PromotionRequest duplicateRequest = PromotionRequest.builder()
                .name("Another Winter Sale")
                .type(PromotionType.COUPON)
                .code("winter20k") // Case-insensitive duplicate
                .discountValue(BigDecimal.valueOf(10000.0))
                .build();

        mockMvc.perform(post("/admin/promotions")
                        .with(user("admin").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicateRequest)))
                .andExpect(status().isConflict());
    }

    @Test
    @WithMockUser(roles = "USER")
    void testNonAdminAccessToAdminPromotionsThrowsForbidden() throws Exception {
        mockMvc.perform(get("/admin/promotions")
                        .with(user("cashier").roles("USER")))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "USER")
    void testUserCanAccessActivePromotions() throws Exception {
        mockMvc.perform(get("/promotions/active")
                        .with(user("cashier").roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].code", is("WINTER20K")));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testDeletePromotion() throws Exception {
        mockMvc.perform(delete("/admin/promotions/" + existingCoupon.getPromotionId())
                        .with(user("admin").roles("ADMIN")))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/admin/promotions/" + existingCoupon.getPromotionId())
                        .with(user("admin").roles("ADMIN")))
                .andExpect(status().isNotFound());
    }
}
