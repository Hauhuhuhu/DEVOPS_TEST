package learn.java.billingsoftware;

import com.fasterxml.jackson.databind.ObjectMapper;
import learn.java.billingsoftware.entity.DiscountType;
import learn.java.billingsoftware.entity.PromotionEntity;
import learn.java.billingsoftware.entity.PromotionType;
import learn.java.billingsoftware.io.EvaluationCartItem;
import learn.java.billingsoftware.io.PromotionEvaluationRequest;
import learn.java.billingsoftware.repository.PromotionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class PromotionEvaluationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PromotionRepository promotionRepository;

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    private PromotionEntity happyHourPromo;
    private PromotionEntity coupon20PercentPromo;
    private PromotionEntity fixedCouponPromo;

    @BeforeEach
    void setUp() {
        promotionRepository.deleteAll();

        // 1. Happy Hour (all day, all days of week, 10% off)
        happyHourPromo = promotionRepository.save(PromotionEntity.builder()
                .promotionId(UUID.randomUUID().toString())
                .name("Daily Happy Hour")
                .description("10% off all items")
                .type(PromotionType.HAPPY_HOUR)
                .discountType(DiscountType.PERCENTAGE)
                .discountValue(BigDecimal.valueOf(10.0))
                .startTime(LocalTime.MIN)
                .endTime(LocalTime.MAX)
                .startDate(LocalDate.now().minusDays(1))
                .endDate(LocalDate.now().plusDays(1))
                .isActive(true)
                .build());

        // 2. Coupon 20% off with 50K max discount cap
        coupon20PercentPromo = promotionRepository.save(PromotionEntity.builder()
                .promotionId(UUID.randomUUID().toString())
                .name("VIP 20% Off")
                .description("20% off capped at 50,000 VND")
                .type(PromotionType.COUPON)
                .code("VIP20")
                .discountType(DiscountType.PERCENTAGE)
                .discountValue(BigDecimal.valueOf(20.0))
                .maxDiscountAmount(BigDecimal.valueOf(50000.0))
                .startDate(LocalDate.now().minusDays(2))
                .endDate(LocalDate.now().plusDays(5))
                .usageLimit(100)
                .timesUsed(0)
                .isActive(true)
                .build());

        // 3. Fixed coupon 30K off with 150K min spend
        fixedCouponPromo = promotionRepository.save(PromotionEntity.builder()
                .promotionId(UUID.randomUUID().toString())
                .name("Save 30K")
                .description("30,000 VND off on orders above 150,000 VND")
                .type(PromotionType.COUPON)
                .code("SAVE30K")
                .discountType(DiscountType.FIXED_AMOUNT)
                .discountValue(BigDecimal.valueOf(30000.0))
                .minOrderAmount(BigDecimal.valueOf(150000.0))
                .startDate(LocalDate.now().minusDays(2))
                .endDate(LocalDate.now().plusDays(5))
                .usageLimit(50)
                .timesUsed(0)
                .isActive(true)
                .build());
    }

    @Test
    void evaluate_emptyCart_returnsZero() throws Exception {
        PromotionEvaluationRequest request = PromotionEvaluationRequest.builder()
                .cartItems(List.of())
                .build();

        mockMvc.perform(post("/promotions/evaluate")
                        .with(user("cashier").roles("USER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.subtotal", is(0)))
                .andExpect(jsonPath("$.discountAmount", is(0)))
                .andExpect(jsonPath("$.grandTotal", is(0)));
    }

    @Test
    void evaluate_happyHourActive_appliesHappyHour() throws Exception {
        EvaluationCartItem item = EvaluationCartItem.builder()
                .itemId("item-1")
                .name("Espresso")
                .price(BigDecimal.valueOf(100000.0))
                .quantity(2)
                .build();

        PromotionEvaluationRequest request = PromotionEvaluationRequest.builder()
                .cartItems(List.of(item))
                .build();

        // Subtotal = 200,000; Happy hour 10% = 20,000; Discounted = 180,000; Tax 10% = 18,000; GrandTotal = 198,000
        mockMvc.perform(post("/promotions/evaluate")
                        .with(user("cashier").roles("USER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.subtotal", is(200000.0)))
                .andExpect(jsonPath("$.discountAmount", is(20000.0)))
                .andExpect(jsonPath("$.discountedSubtotal", is(180000.0)))
                .andExpect(jsonPath("$.tax", is(18000.0)))
                .andExpect(jsonPath("$.grandTotal", is(198000.0)))
                .andExpect(jsonPath("$.appliedPromotionName", is("Daily Happy Hour")))
                .andExpect(jsonPath("$.appliedPromotionType", is("HAPPY_HOUR")));
    }

    @Test
    void evaluate_percentageCouponWithCap_appliesCappedDiscount() throws Exception {
        // Subtotal = 300,000. 20% = 60,000, capped at 50,000.
        EvaluationCartItem item = EvaluationCartItem.builder()
                .itemId("item-1")
                .name("Signature Drink")
                .price(BigDecimal.valueOf(300000.0))
                .quantity(1)
                .build();

        PromotionEvaluationRequest request = PromotionEvaluationRequest.builder()
                .couponCode("VIP20")
                .cartItems(List.of(item))
                .build();

        // Happy Hour would give 10% = 30,000. Coupon VIP20 gives 50,000.
        // ADR-0003: VIP20 (50,000) is chosen, no stacking!
        mockMvc.perform(post("/promotions/evaluate")
                        .with(user("cashier").roles("USER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.subtotal", is(300000.0)))
                .andExpect(jsonPath("$.discountAmount", is(50000.0)))
                .andExpect(jsonPath("$.discountedSubtotal", is(250000.0)))
                .andExpect(jsonPath("$.tax", is(25000.0)))
                .andExpect(jsonPath("$.grandTotal", is(275000.0)))
                .andExpect(jsonPath("$.appliedPromotionName", is("VIP 20% Off")))
                .andExpect(jsonPath("$.appliedPromotionType", is("COUPON")))
                .andExpect(jsonPath("$.candidates", hasSize(2))); // Both Happy Hour and Coupon were candidates
    }

    @Test
    void evaluate_adr0003_happyHourBetterThanCoupon_picksHappyHourWithoutStacking() throws Exception {
        // Subtotal = 400,000.
        // Happy Hour 10% = 40,000.
        // Coupon SAVE30K = 30,000.
        // ADR-0003: Best promotion is Happy Hour (40,000). Total discount = 40,000, NOT 70,000!
        EvaluationCartItem item = EvaluationCartItem.builder()
                .itemId("item-1")
                .name("Special Meal")
                .price(BigDecimal.valueOf(400000.0))
                .quantity(1)
                .build();

        PromotionEvaluationRequest request = PromotionEvaluationRequest.builder()
                .couponCode("SAVE30K")
                .cartItems(List.of(item))
                .build();

        mockMvc.perform(post("/promotions/evaluate")
                        .with(user("cashier").roles("USER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.subtotal", is(400000.0)))
                .andExpect(jsonPath("$.discountAmount", is(40000.0))) // strictly 40,000, NOT 70,000
                .andExpect(jsonPath("$.discountedSubtotal", is(360000.0)))
                .andExpect(jsonPath("$.tax", is(36000.0)))
                .andExpect(jsonPath("$.grandTotal", is(396000.0)))
                .andExpect(jsonPath("$.appliedPromotionName", is("Daily Happy Hour")))
                .andExpect(jsonPath("$.appliedPromotionType", is("HAPPY_HOUR")));
    }

    @Test
    void evaluate_invalidCoupon_throwsBadRequest() throws Exception {
        EvaluationCartItem item = EvaluationCartItem.builder()
                .itemId("item-1")
                .name("Coffee")
                .price(BigDecimal.valueOf(50000.0))
                .quantity(1)
                .build();

        PromotionEvaluationRequest request = PromotionEvaluationRequest.builder()
                .couponCode("NONEXISTENT_CODE")
                .cartItems(List.of(item))
                .build();

        mockMvc.perform(post("/promotions/evaluate")
                        .with(user("cashier").roles("USER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code", is("PROMOTION_NOT_FOUND")))
                .andExpect(jsonPath("$.message", is("Mã giảm giá không tồn tại")));
    }

    @Test
    void evaluate_expiredCoupon_throwsBadRequest() throws Exception {
        PromotionEntity expired = promotionRepository.save(PromotionEntity.builder()
                .promotionId(UUID.randomUUID().toString())
                .name("Expired Promo")
                .type(PromotionType.COUPON)
                .code("EXPIRED")
                .discountType(DiscountType.FIXED_AMOUNT)
                .discountValue(BigDecimal.valueOf(10000.0))
                .startDate(LocalDate.now().minusDays(10))
                .endDate(LocalDate.now().minusDays(1))
                .isActive(true)
                .build());

        EvaluationCartItem item = EvaluationCartItem.builder()
                .itemId("item-1")
                .name("Tea")
                .price(BigDecimal.valueOf(50000.0))
                .quantity(1)
                .build();

        PromotionEvaluationRequest request = PromotionEvaluationRequest.builder()
                .couponCode("EXPIRED")
                .cartItems(List.of(item))
                .build();

        mockMvc.perform(post("/promotions/evaluate")
                        .with(user("cashier").roles("USER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code", is("PROMOTION_EXPIRED")))
                .andExpect(jsonPath("$.message", is("Mã giảm giá đã hết hạn sử dụng")));
    }

    @Test
    void evaluate_usageLimitExceeded_throwsBadRequest() throws Exception {
        PromotionEntity maxedOut = promotionRepository.save(PromotionEntity.builder()
                .promotionId(UUID.randomUUID().toString())
                .name("Limited Promo")
                .type(PromotionType.COUPON)
                .code("MAXED")
                .discountType(DiscountType.FIXED_AMOUNT)
                .discountValue(BigDecimal.valueOf(10000.0))
                .usageLimit(10)
                .timesUsed(10)
                .isActive(true)
                .build());

        EvaluationCartItem item = EvaluationCartItem.builder()
                .itemId("item-1")
                .name("Juice")
                .price(BigDecimal.valueOf(50000.0))
                .quantity(1)
                .build();

        PromotionEvaluationRequest request = PromotionEvaluationRequest.builder()
                .couponCode("MAXED")
                .cartItems(List.of(item))
                .build();

        mockMvc.perform(post("/promotions/evaluate")
                        .with(user("cashier").roles("USER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code", is("PROMOTION_USAGE_EXHAUSTED")))
                .andExpect(jsonPath("$.message", is("Mã giảm giá đã hết lượt sử dụng")));
    }

    @Test
    void evaluate_minSpendNotMet_throwsBadRequest() throws Exception {
        // SAVE30K requires min spend 150,000 VND
        EvaluationCartItem item = EvaluationCartItem.builder()
                .itemId("item-1")
                .name("Croissant")
                .price(BigDecimal.valueOf(60000.0))
                .quantity(1)
                .build();

        PromotionEvaluationRequest request = PromotionEvaluationRequest.builder()
                .couponCode("SAVE30K")
                .cartItems(List.of(item))
                .build();

        mockMvc.perform(post("/promotions/evaluate")
                        .with(user("cashier").roles("USER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code", is("PROMOTION_MIN_ORDER_NOT_MET")))
                .andExpect(jsonPath("$.message", is("Đơn hàng chưa đạt giá trị tối thiểu để áp dụng mã này")));
    }

    @Test
    void evaluate_bogoPromotion_appliesDiscount() throws Exception {
        // Save BOGO promo: Buy variant "var-a", get variant "var-a" 100% off
        promotionRepository.save(PromotionEntity.builder()
                .promotionId(UUID.randomUUID().toString())
                .name("Buy 1 Get 1 Milk Tea")
                .type(PromotionType.BOGO)
                .buyVariantId("var-tea")
                .getVariantId("var-tea")
                .bogoDiscountPercent(BigDecimal.valueOf(100.0))
                .isActive(true)
                .build());

        EvaluationCartItem item = EvaluationCartItem.builder()
                .itemId("item-tea")
                .variantId("var-tea")
                .name("Milk Tea L")
                .price(BigDecimal.valueOf(50000.0))
                .quantity(2)
                .build();

        PromotionEvaluationRequest request = PromotionEvaluationRequest.builder()
                .cartItems(List.of(item))
                .build();

        // Subtotal = 100,000.
        // Happy hour 10% gives 10,000.
        // BOGO gives 50,000 (1 free).
        // ADR-0003: BOGO (50,000) chosen!
        mockMvc.perform(post("/promotions/evaluate")
                        .with(user("cashier").roles("USER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.subtotal", is(100000.0)))
                .andExpect(jsonPath("$.discountAmount", is(50000.0)))
                .andExpect(jsonPath("$.discountedSubtotal", is(50000.0)))
                .andExpect(jsonPath("$.tax", is(5000.0)))
                .andExpect(jsonPath("$.grandTotal", is(55000.0)))
                .andExpect(jsonPath("$.appliedPromotionName", is("Buy 1 Get 1 Milk Tea")))
                .andExpect(jsonPath("$.appliedPromotionType", is("BOGO")));
    }
}
