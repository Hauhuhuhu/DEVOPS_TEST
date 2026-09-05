package learn.java.billingsoftware.service.impl;

import learn.java.billingsoftware.entity.CategoryEntity;
import learn.java.billingsoftware.entity.ItemEntity;
import learn.java.billingsoftware.entity.ModifierGroupEntity;
import learn.java.billingsoftware.entity.VariantEntity;
import learn.java.billingsoftware.io.*;
import learn.java.billingsoftware.repository.CategoryRepository;
import learn.java.billingsoftware.repository.ItemRepository;
import learn.java.billingsoftware.repository.ModifierGroupRepository;
import learn.java.billingsoftware.repository.VariantRepository;
import learn.java.billingsoftware.service.FileUploadService;
import learn.java.billingsoftware.service.ItemService;
import learn.java.billingsoftware.service.ModifierGroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ItemServiceImpl implements ItemService {
    private final FileUploadService fileUploadService;
    private final CategoryRepository categoryRepository;
    private final ItemRepository itemRepository;
    private final VariantRepository variantRepository;
    private final ModifierGroupRepository modifierGroupRepository;
    private final ModifierGroupService modifierGroupService;

    @Override
    @Transactional
    public ItemResponse add(ItemRequest request, MultipartFile file) throws IOException {
        String imgUrl = null;
        if (file != null && !file.isEmpty()) {
            imgUrl = fileUploadService.uploadFile(file);
        }

        ItemEntity newItem = convertToEntity(request);
        CategoryEntity existingCategory = categoryRepository.findByCategoryId(request.getCategoryId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found: " + request.getCategoryId()));
        newItem.setCategory(existingCategory);
        newItem.setImgUrl(imgUrl);

        // Handle variants (Ticket 01)
        List<VariantEntity> variants = new ArrayList<>();
        if (request.getVariants() != null && !request.getVariants().isEmpty()) {
            Set<String> seenSkus = new HashSet<>();
            for (VariantRequest vReq : request.getVariants()) {
                if (vReq.getSku() == null || vReq.getSku().trim().isEmpty()) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Variant SKU is required");
                }
                String trimmedSku = vReq.getSku().trim();
                if (!seenSkus.add(trimmedSku.toLowerCase())) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Duplicate SKU in request: " + trimmedSku);
                }
                if (variantRepository.existsBySku(trimmedSku)) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "SKU already exists: " + trimmedSku);
                }

                BigDecimal basePrice = vReq.getBasePrice() != null ? vReq.getBasePrice() : request.getPrice();
                if (basePrice == null) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Variant base price is required");
                }

                VariantEntity variant = VariantEntity.builder()
                        .variantId(UUID.randomUUID().toString())
                        .sku(trimmedSku)
                        .basePrice(basePrice)
                        .attributes(vReq.getAttributes() != null ? vReq.getAttributes() : new HashMap<>())
                        .cachedStockQuantity(0)
                        .item(newItem)
                        .build();
                variants.add(variant);
            }
            newItem.setVariants(variants);
            if (newItem.getPrice() == null && !variants.isEmpty()) {
                newItem.setPrice(variants.get(0).getBasePrice());
            }
        } else {
            // Legacy client support: auto-create a default variant
            BigDecimal price = request.getPrice() != null ? request.getPrice() : BigDecimal.ZERO;
            VariantEntity defaultVariant = VariantEntity.builder()
                    .variantId(UUID.randomUUID().toString())
                    .sku("SKU-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                    .basePrice(price)
                    .attributes(new HashMap<>())
                    .cachedStockQuantity(0)
                    .item(newItem)
                    .build();
            variants.add(defaultVariant);
            newItem.setVariants(variants);
        }

        // Handle modifier groups (Ticket 02)
        if (request.getModifierGroupIds() != null && !request.getModifierGroupIds().isEmpty()) {
            List<ModifierGroupEntity> groups = modifierGroupRepository.findByGroupIdIn(request.getModifierGroupIds());
            newItem.setModifierGroups(groups);
        }

        newItem = itemRepository.save(newItem);
        return convertToResponse(newItem);
    }

    private ItemResponse convertToResponse(ItemEntity item) {
        List<VariantResponse> variantResponses = item.getVariants() != null
                ? item.getVariants().stream()
                .map(v -> VariantResponse.builder()
                        .variantId(v.getVariantId())
                        .sku(v.getSku())
                        .basePrice(v.getBasePrice())
                        .attributes(v.getAttributes() != null ? v.getAttributes() : Collections.emptyMap())
                        .cachedStockQuantity(v.getCachedStockQuantity())
                        .createdAt(v.getCreatedAt())
                        .updatedAt(v.getUpdatedAt())
                        .build())
                .collect(Collectors.toList())
                : Collections.emptyList();

        List<ModifierGroupResponse> modifierGroupResponses = item.getModifierGroups() != null
                ? item.getModifierGroups().stream()
                .map(modifierGroupService::convertToResponse)
                .collect(Collectors.toList())
                : Collections.emptyList();

        return ItemResponse.builder()
                .itemId(item.getItemId())
                .name(item.getName())
                .description(item.getDescription())
                .price(item.getPrice())
                .imgUrl(item.getImgUrl())
                .categoryName(item.getCategory() != null ? item.getCategory().getName() : null)
                .categoryId(item.getCategory() != null ? item.getCategory().getCategoryId() : null)
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .variants(variantResponses)
                .modifierGroups(modifierGroupResponses)
                .build();
    }

    private ItemEntity convertToEntity(ItemRequest request) {
        return ItemEntity.builder()
                .itemId(UUID.randomUUID().toString())
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ItemResponse> fetchItems() {
        return itemRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ItemResponse fetchItem(String itemId) {
        ItemEntity item = itemRepository.findByItemId(itemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Item not found: " + itemId));
        return convertToResponse(item);
    }

    @Override
    @Transactional
    public void deleteItem(String id) {
        ItemEntity existingItem = itemRepository.findByItemId(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Item not found: " + id));

        existingItem.getModifierGroups().clear();
        itemRepository.save(existingItem);

        if (existingItem.getImgUrl() != null && !existingItem.getImgUrl().isEmpty()) {
            try {
                fileUploadService.deleteFile(existingItem.getImgUrl());
            } catch (Exception ignored) {
            }
        }
        itemRepository.delete(existingItem);
    }
}
