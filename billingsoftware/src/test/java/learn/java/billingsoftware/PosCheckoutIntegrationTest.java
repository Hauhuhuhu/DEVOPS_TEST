package learn.java.billingsoftware;

import com.fasterxml.jackson.databind.ObjectMapper;
import learn.java.billingsoftware.entity.*;
import learn.java.billingsoftware.io.InventoryTransactionRequest;
import learn.java.billingsoftware.io.OrderRequest;
import learn.java.billingsoftware.io.SelectedModifier;
import learn.java.billingsoftware.repository.*;
import learn.java.billingsoftware.service.InventoryService;
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
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class PosCheckoutIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private VariantRepository variantRepository;

    @Autowired
    private ModifierGroupRepository modifierGroupRepository;

    @Autowired
    private InventoryTransactionRepository inventoryTransactionRepository;

    @Autowired
    private InventoryService inventoryService;

    @Autowired
    private OrderEntityRepository orderEntityRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private CategoryEntity testCategory;
    private ItemEntity testItem;
    private VariantEntity testVariant;
    private ModifierGroupEntity testGroup;

    @BeforeEach
    void setUp() {
        testCategory = categoryRepository.save(CategoryEntity.builder()
                .categoryId("CAT-" + UUID.randomUUID().toString().substring(0, 8))
                .name("Beverages")
                .description("Cold and hot drinks")
                .bgColor("#EEEEEE")
                .build());

        testItem = itemRepository.save(ItemEntity.builder()
                .itemId("ITEM-" + UUID.randomUUID().toString().substring(0, 8))
                .name("Brown Sugar Milk Tea")
                .price(new BigDecimal("35000.00"))
                .description("Rich flavor")
                .category(testCategory)
                .build());

        testVariant = variantRepository.save(VariantEntity.builder()
                .variantId("VAR-" + UUID.randomUUID().toString().substring(0, 8))
                .sku("SKU-BSMT-L")
                .basePrice(new BigDecimal("35000.00"))
                .cachedStockQuantity(0)
                .attributes(Map.of("Size", "L"))
                .item(testItem)
                .build());

        // Stock in 10 units via inventory ledger
        inventoryService.recordTransaction(InventoryTransactionRequest.builder()
                .variantId(testVariant.getVariantId())
                .transactionType(TransactionType.IN)
                .quantity(10)
                .referenceId("PO-INIT")
                .build());

        testGroup = ModifierGroupEntity.builder()
                .groupId(UUID.randomUUID().toString())
                .name("Toppings")
                .description("Extra toppings")
                .minSelections(0)
                .maxSelections(3)
                .build();

        ModifierEntity modifier = ModifierEntity.builder()
                .modifierId(UUID.randomUUID().toString())
                .name("Boba Pearls")
                .priceAdjustment(new BigDecimal("5000.00"))
                .modifierGroup(testGroup)
                .build();
        testGroup.setModifiers(List.of(modifier));
        testGroup = modifierGroupRepository.save(testGroup);
    }

    @Test
    @WithMockUser(username = "cashier", roles = {"USER"})
    void testCheckoutWithVariantAndModifiersSavesDetailsAndDeductsStock() throws Exception {
        SelectedModifier selectedMod = SelectedModifier.builder()
                .modifierId(testGroup.getModifiers().get(0).getModifierId())
                .name("Boba Pearls")
                .priceAdjustment(new BigDecimal("5000.00"))
                .build();

        OrderRequest.OrderItemRequest itemRequest = OrderRequest.OrderItemRequest.builder()
                .itemId(testItem.getItemId())
                .variantId(testVariant.getVariantId())
                .name("Brown Sugar Milk Tea (L)")
                .basePrice(35000.00)
                .price(40000.00) // 35000 + 5000
                .quantity(2)
                .selectedModifiers(List.of(selectedMod))
                .build();

        OrderRequest orderRequest = OrderRequest.builder()
                .customerName("John Doe")
                .phoneNumber("0912345678")
                .cartItems(List.of(itemRequest))
                .subtotal(80000.00)
                .tax(8000.00)
                .grandTotal(88000.00)
                .paymentMethod("CASH")
                .build();

        String responseJson = mockMvc.perform(post("/orders")
                        .with(user("cashier").roles("USER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(orderRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.orderId", notNullValue()))
                .andExpect(jsonPath("$.items", hasSize(1)))
                .andExpect(jsonPath("$.items[0].variantId", is(testVariant.getVariantId())))
                .andExpect(jsonPath("$.items[0].basePrice", is(35000.00)))
                .andExpect(jsonPath("$.items[0].price", is(40000.00)))
                .andExpect(jsonPath("$.items[0].quantity", is(2)))
                .andExpect(jsonPath("$.items[0].selectedModifiers", hasSize(1)))
                .andExpect(jsonPath("$.items[0].selectedModifiers[0].name", is("Boba Pearls")))
                .andReturn().getResponse().getContentAsString();

        String orderId = objectMapper.readTree(responseJson).get("orderId").asText();

        // Verify ledger record created
        List<InventoryTransactionEntity> transactions = inventoryTransactionRepository
                .findByVariant_VariantIdOrderByCreatedAtDesc(testVariant.getVariantId());
        
        // Should have 2 transactions: initial IN (+10) and order OUT (-2)
        assertEquals(2, transactions.size());
        InventoryTransactionEntity latestTx = transactions.get(0);
        assertEquals(TransactionType.OUT, latestTx.getTransactionType());
        assertEquals(-2, latestTx.getQuantity());
        assertEquals(orderId, latestTx.getReferenceId());

        // Verify cachedStockQuantity updated from 10 down to 8
        VariantEntity updatedVariant = variantRepository.findByVariantId(testVariant.getVariantId()).orElseThrow();
        assertEquals(8, updatedVariant.getCachedStockQuantity());
    }

    @Test
    @WithMockUser(username = "cashier", roles = {"USER"})
    void testCheckoutAllowsNegativeStock() throws Exception {
        // Stock is currently 10. Order 15 items to trigger negative stock.
        OrderRequest.OrderItemRequest itemRequest = OrderRequest.OrderItemRequest.builder()
                .itemId(testItem.getItemId())
                .variantId(testVariant.getVariantId())
                .name("Brown Sugar Milk Tea (L)")
                .basePrice(35000.00)
                .price(35000.00)
                .quantity(15)
                .build();

        OrderRequest orderRequest = OrderRequest.builder()
                .customerName("Jane Doe")
                .phoneNumber("0987654321")
                .cartItems(List.of(itemRequest))
                .subtotal(525000.00)
                .tax(52500.00)
                .grandTotal(577500.00)
                .paymentMethod("CASH")
                .build();

        mockMvc.perform(post("/orders")
                        .with(user("cashier").roles("USER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(orderRequest)))
                .andExpect(status().isCreated());

        // Stock was 10, sold 15 -> cachedStockQuantity must now be -5
        VariantEntity updatedVariant = variantRepository.findByVariantId(testVariant.getVariantId()).orElseThrow();
        assertEquals(-5, updatedVariant.getCachedStockQuantity());
    }
}
