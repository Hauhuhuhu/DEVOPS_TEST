package learn.java.billingsoftware;

import com.fasterxml.jackson.databind.ObjectMapper;
import learn.java.billingsoftware.entity.CategoryEntity;
import learn.java.billingsoftware.entity.ItemEntity;
import learn.java.billingsoftware.entity.TransactionType;
import learn.java.billingsoftware.entity.VariantEntity;
import learn.java.billingsoftware.io.InventoryTransactionRequest;
import learn.java.billingsoftware.repository.CategoryRepository;
import learn.java.billingsoftware.repository.InventoryTransactionRepository;
import learn.java.billingsoftware.repository.ItemRepository;
import learn.java.billingsoftware.repository.VariantRepository;
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
import java.util.Map;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class InventoryLedgerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private VariantRepository variantRepository;

    @Autowired
    private InventoryTransactionRepository inventoryTransactionRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private CategoryEntity testCategory;
    private ItemEntity testItem;
    private VariantEntity testVariant;

    @BeforeEach
    void setUp() {
        testCategory = categoryRepository.save(CategoryEntity.builder()
                .categoryId("CAT-" + UUID.randomUUID().toString().substring(0, 8))
                .name("Test Category")
                .description("Desc")
                .bgColor("#FFFFFF")
                .build());

        testItem = itemRepository.save(ItemEntity.builder()
                .itemId("ITEM-" + UUID.randomUUID().toString().substring(0, 8))
                .name("Polo Shirt")
                .price(new BigDecimal("150000.00"))
                .description("Classic Polo")
                .category(testCategory)
                .build());

        testVariant = variantRepository.save(VariantEntity.builder()
                .variantId("VAR-" + UUID.randomUUID().toString().substring(0, 8))
                .sku("SKU-POLO-L-RED")
                .basePrice(new BigDecimal("150000.00"))
                .cachedStockQuantity(0)
                .attributes(Map.of("Color", "Red", "Size", "L"))
                .item(testItem)
                .build());
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testStockInCreatesLedgerEntryAndUpdatesCachedStock() throws Exception {
        InventoryTransactionRequest request = InventoryTransactionRequest.builder()
                .variantId(testVariant.getVariantId())
                .transactionType(TransactionType.IN)
                .quantity(20)
                .referenceId("PO-2026-001")
                .note("Initial bulk purchase")
                .build();

        mockMvc.perform(post("/admin/inventory/transactions")
                        .with(user("admin").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.transactionId", notNullValue()))
                .andExpect(jsonPath("$.variantId", is(testVariant.getVariantId())))
                .andExpect(jsonPath("$.sku", is(testVariant.getSku())))
                .andExpect(jsonPath("$.itemName", is("Polo Shirt")))
                .andExpect(jsonPath("$.transactionType", is("IN")))
                .andExpect(jsonPath("$.quantity", is(20)))
                .andExpect(jsonPath("$.referenceId", is("PO-2026-001")))
                .andExpect(jsonPath("$.balanceAfter", is(20)));

        // Verify variant in DB has updated cached stock
        VariantEntity updatedVariant = variantRepository.findByVariantId(testVariant.getVariantId()).orElseThrow();
        org.junit.jupiter.api.Assertions.assertEquals(20, updatedVariant.getCachedStockQuantity());
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testStockOutReducesCachedStock() throws Exception {
        // First, stock in 25 items
        InventoryTransactionRequest inRequest = InventoryTransactionRequest.builder()
                .variantId(testVariant.getVariantId())
                .transactionType(TransactionType.IN)
                .quantity(25)
                .referenceId("PO-INITIAL")
                .build();

        mockMvc.perform(post("/admin/inventory/transactions")
                        .with(user("admin").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(inRequest)))
                .andExpect(status().isCreated());

        // Now, stock out (wastage) 7 items
        InventoryTransactionRequest outRequest = InventoryTransactionRequest.builder()
                .variantId(testVariant.getVariantId())
                .transactionType(TransactionType.OUT)
                .quantity(7)
                .referenceId("WASTAGE-001")
                .note("Water damaged packaging")
                .build();

        mockMvc.perform(post("/admin/inventory/transactions")
                        .with(user("admin").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(outRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.transactionType", is("OUT")))
                .andExpect(jsonPath("$.quantity", is(-7)))
                .andExpect(jsonPath("$.balanceAfter", is(18)));

        VariantEntity updatedVariant = variantRepository.findByVariantId(testVariant.getVariantId()).orElseThrow();
        org.junit.jupiter.api.Assertions.assertEquals(18, updatedVariant.getCachedStockQuantity());
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testStockOutAllowsNegativeStock() throws Exception {
        // Starting with 0 stock, stock out 5 items
        InventoryTransactionRequest outRequest = InventoryTransactionRequest.builder()
                .variantId(testVariant.getVariantId())
                .transactionType(TransactionType.OUT)
                .quantity(5)
                .referenceId("OFFLINE-SYNC-ADJUST")
                .note("Offline stock deduction")
                .build();

        mockMvc.perform(post("/admin/inventory/transactions")
                        .with(user("admin").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(outRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.transactionType", is("OUT")))
                .andExpect(jsonPath("$.quantity", is(-5)))
                .andExpect(jsonPath("$.balanceAfter", is(-5)));

        VariantEntity updatedVariant = variantRepository.findByVariantId(testVariant.getVariantId()).orElseThrow();
        org.junit.jupiter.api.Assertions.assertEquals(-5, updatedVariant.getCachedStockQuantity());
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testRejectInvalidQuantity() throws Exception {
        InventoryTransactionRequest zeroQtyRequest = InventoryTransactionRequest.builder()
                .variantId(testVariant.getVariantId())
                .transactionType(TransactionType.IN)
                .quantity(0)
                .build();

        mockMvc.perform(post("/admin/inventory/transactions")
                        .with(user("admin").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(zeroQtyRequest)))
                .andExpect(status().isBadRequest());

        InventoryTransactionRequest negativeQtyRequest = InventoryTransactionRequest.builder()
                .variantId(testVariant.getVariantId())
                .transactionType(TransactionType.IN)
                .quantity(-10)
                .build();

        mockMvc.perform(post("/admin/inventory/transactions")
                        .with(user("admin").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(negativeQtyRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testRejectNonExistentVariant() throws Exception {
        InventoryTransactionRequest request = InventoryTransactionRequest.builder()
                .variantId("NON-EXISTENT-VAR")
                .transactionType(TransactionType.IN)
                .quantity(10)
                .build();

        mockMvc.perform(post("/admin/inventory/transactions")
                        .with(user("admin").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(username = "user", roles = {"USER"})
    void testFetchVariantTransactionsHistory() throws Exception {
        // Create 2 transactions
        InventoryTransactionRequest tx1 = InventoryTransactionRequest.builder()
                .variantId(testVariant.getVariantId())
                .transactionType(TransactionType.IN)
                .quantity(30)
                .referenceId("PO-1")
                .build();

        InventoryTransactionRequest tx2 = InventoryTransactionRequest.builder()
                .variantId(testVariant.getVariantId())
                .transactionType(TransactionType.OUT)
                .quantity(10)
                .referenceId("OUT-1")
                .build();

        mockMvc.perform(post("/admin/inventory/transactions")
                        .with(user("admin").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(tx1)))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/admin/inventory/transactions")
                        .with(user("admin").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(tx2)))
                .andExpect(status().isCreated());

        // Fetch history as USER
        mockMvc.perform(get("/inventory/variants/" + testVariant.getVariantId() + "/transactions")
                        .with(user("user").roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].transactionType", is("OUT")))
                .andExpect(jsonPath("$[0].quantity", is(-10)))
                .andExpect(jsonPath("$[1].transactionType", is("IN")))
                .andExpect(jsonPath("$[1].quantity", is(30)));
    }
}
