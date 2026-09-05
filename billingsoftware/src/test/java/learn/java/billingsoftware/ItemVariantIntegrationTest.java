package learn.java.billingsoftware;

import com.fasterxml.jackson.databind.ObjectMapper;
import learn.java.billingsoftware.entity.CategoryEntity;
import learn.java.billingsoftware.io.ItemRequest;
import learn.java.billingsoftware.io.VariantRequest;
import learn.java.billingsoftware.repository.CategoryRepository;
import learn.java.billingsoftware.repository.ItemRepository;
import learn.java.billingsoftware.repository.VariantRepository;
import learn.java.billingsoftware.service.FileUploadService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.mock.web.MockPart;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class ItemVariantIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private VariantRepository variantRepository;

    @MockitoBean
    private FileUploadService fileUploadService;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private CategoryEntity testCategory;

    @BeforeEach
    void setUp() {
        when(fileUploadService.uploadFile(any())).thenReturn("https://test-s3.com/image.png");

        testCategory = CategoryEntity.builder()
                .categoryId("CAT-" + UUID.randomUUID().toString().substring(0, 8))
                .name("Apparel")
                .description("Clothing and Apparel")
                .bgColor("#FFFFFF")
                .build();
        testCategory = categoryRepository.save(testCategory);
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testCreateItemWithVariantsAndRetrieve() throws Exception {
        String sku1 = "SKU-RED-M-" + UUID.randomUUID().toString().substring(0, 5);
        String sku2 = "SKU-BLUE-L-" + UUID.randomUUID().toString().substring(0, 5);

        ItemRequest itemRequest = ItemRequest.builder()
                .name("T-Shirt Premium")
                .description("High quality cotton t-shirt")
                .price(new BigDecimal("150000.00"))
                .categoryId(testCategory.getCategoryId())
                .variants(List.of(
                        VariantRequest.builder()
                                .sku(sku1)
                                .basePrice(new BigDecimal("150000.00"))
                                .attributes(Map.of("color", "Red", "size", "M"))
                                .initialStock(50)
                                .build(),
                        VariantRequest.builder()
                                .sku(sku2)
                                .basePrice(new BigDecimal("160000.00"))
                                .attributes(Map.of("color", "Blue", "size", "L"))
                                .initialStock(30)
                                .build()
                ))
                .build();

        String itemJson = objectMapper.writeValueAsString(itemRequest);
        MockMultipartFile file = new MockMultipartFile("file", "test.png", "image/png", "dummy".getBytes());

        mockMvc.perform(multipart("/admin/items")
                        .file(file)
                        .part(new MockPart("item", itemJson.getBytes()))
                        .contentType(MediaType.MULTIPART_FORM_DATA)
                        .with(user("admin").roles("ADMIN")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name", is("T-Shirt Premium")))
                .andExpect(jsonPath("$.variants", hasSize(2)))
                .andExpect(jsonPath("$.variants[0].sku", anyOf(is(sku1), is(sku2))))
                .andExpect(jsonPath("$.variants[0].attributes", notNullValue()));

        // Also test retrieving item via GET /items
        mockMvc.perform(get("/items").with(user("admin").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[?(@.name == 'T-Shirt Premium')].variants", hasSize(1)));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testLegacyItemCreationWithoutVariantsCreatesDefaultVariant() throws Exception {
        ItemRequest legacyRequest = ItemRequest.builder()
                .name("Basic Hat")
                .description("Simple baseball hat")
                .price(new BigDecimal("80000.00"))
                .categoryId(testCategory.getCategoryId())
                .build();

        String itemJson = objectMapper.writeValueAsString(legacyRequest);
        MockMultipartFile file = new MockMultipartFile("file", "hat.png", "image/png", "dummy".getBytes());

        mockMvc.perform(multipart("/admin/items")
                        .file(file)
                        .part(new MockPart("item", itemJson.getBytes()))
                        .contentType(MediaType.MULTIPART_FORM_DATA)
                        .with(user("admin").roles("ADMIN")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name", is("Basic Hat")))
                .andExpect(jsonPath("$.variants", hasSize(1)))
                .andExpect(jsonPath("$.variants[0].basePrice", is(80000.00)))
                .andExpect(jsonPath("$.variants[0].sku", startsWith("SKU-")));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testRejectDuplicateSkuInRequest() throws Exception {
        String duplicateSku = "SKU-DUP-1";

        ItemRequest itemRequest = ItemRequest.builder()
                .name("Duplicate Test Item")
                .description("Item with duplicate SKUs")
                .price(new BigDecimal("50000.00"))
                .categoryId(testCategory.getCategoryId())
                .variants(List.of(
                        VariantRequest.builder()
                                .sku(duplicateSku)
                                .basePrice(new BigDecimal("50000.00"))
                                .build(),
                        VariantRequest.builder()
                                .sku(duplicateSku)
                                .basePrice(new BigDecimal("55000.00"))
                                .build()
                ))
                .build();

        String itemJson = objectMapper.writeValueAsString(itemRequest);
        MockMultipartFile file = new MockMultipartFile("file", "test.png", "image/png", "dummy".getBytes());

        mockMvc.perform(multipart("/admin/items")
                        .file(file)
                        .part(new MockPart("item", itemJson.getBytes()))
                        .contentType(MediaType.MULTIPART_FORM_DATA)
                        .with(user("admin").roles("ADMIN")))
                .andExpect(status().isBadRequest());
    }
}
