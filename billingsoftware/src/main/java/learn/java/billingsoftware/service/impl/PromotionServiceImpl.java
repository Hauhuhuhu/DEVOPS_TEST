package learn.java.billingsoftware.service.impl;

import learn.java.billingsoftware.entity.DiscountType;
import learn.java.billingsoftware.entity.PromotionEntity;
import learn.java.billingsoftware.entity.PromotionType;
import learn.java.billingsoftware.io.PromotionRequest;
import learn.java.billingsoftware.io.PromotionResponse;
import learn.java.billingsoftware.repository.PromotionRepository;
import learn.java.billingsoftware.service.PromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PromotionServiceImpl implements PromotionService {

    private final PromotionRepository promotionRepository;

    @Override
    @Transactional
    public PromotionResponse createPromotion(PromotionRequest request) {
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Promotion name is required");
        }
        if (request.getType() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Promotion type is required");
        }

        String normalizedCode = null;
        if (request.getType() == PromotionType.COUPON) {
            if (request.getCode() == null || request.getCode().trim().isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Coupon code is required for COUPON promotion");
            }
            normalizedCode = request.getCode().trim().toUpperCase();
            if (promotionRepository.existsByCodeIgnoreCase(normalizedCode)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Coupon code already exists: " + normalizedCode);
            }
        } else if (request.getCode() != null && !request.getCode().trim().isEmpty()) {
            normalizedCode = request.getCode().trim().toUpperCase();
            if (promotionRepository.existsByCodeIgnoreCase(normalizedCode)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Coupon code already exists: " + normalizedCode);
            }
        }

        PromotionEntity entity = PromotionEntity.builder()
                .promotionId(UUID.randomUUID().toString())
                .name(request.getName().trim())
                .description(request.getDescription())
                .type(request.getType())
                .code(normalizedCode)
                .discountType(request.getDiscountType() != null ? request.getDiscountType() : DiscountType.PERCENTAGE)
                .discountValue(request.getDiscountValue() != null ? request.getDiscountValue() : BigDecimal.ZERO)
                .maxDiscountAmount(request.getMaxDiscountAmount())
                .minOrderAmount(request.getMinOrderAmount() != null ? request.getMinOrderAmount() : BigDecimal.ZERO)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .daysOfWeek(request.getDaysOfWeek())
                .buyVariantId(request.getBuyVariantId())
                .getVariantId(request.getGetVariantId())
                .bogoDiscountPercent(request.getBogoDiscountPercent() != null ? request.getBogoDiscountPercent() : BigDecimal.valueOf(100.0))
                .usageLimit(request.getUsageLimit())
                .timesUsed(0)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        PromotionEntity saved = promotionRepository.save(entity);
        return convertToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PromotionResponse> fetchAllPromotions() {
        return promotionRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PromotionResponse> fetchActivePromotions() {
        return promotionRepository.findByIsActiveTrueOrderByCreatedAtDesc()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PromotionResponse fetchByPromotionId(String promotionId) {
        PromotionEntity entity = promotionRepository.findByPromotionId(promotionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Promotion not found: " + promotionId));
        return convertToResponse(entity);
    }

    @Override
    @Transactional
    public PromotionResponse updatePromotion(String promotionId, PromotionRequest request) {
        PromotionEntity entity = promotionRepository.findByPromotionId(promotionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Promotion not found: " + promotionId));

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            entity.setName(request.getName().trim());
        }
        if (request.getDescription() != null) {
            entity.setDescription(request.getDescription());
        }
        if (request.getType() != null) {
            entity.setType(request.getType());
        }

        if (request.getCode() != null && !request.getCode().trim().isEmpty()) {
            String newCode = request.getCode().trim().toUpperCase();
            if (!newCode.equalsIgnoreCase(entity.getCode()) && promotionRepository.existsByCodeIgnoreCase(newCode)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Coupon code already exists: " + newCode);
            }
            entity.setCode(newCode);
        } else if (request.getType() != PromotionType.COUPON) {
            entity.setCode(null);
        }

        if (request.getDiscountType() != null) {
            entity.setDiscountType(request.getDiscountType());
        }
        if (request.getDiscountValue() != null) {
            entity.setDiscountValue(request.getDiscountValue());
        }
        entity.setMaxDiscountAmount(request.getMaxDiscountAmount());
        if (request.getMinOrderAmount() != null) {
            entity.setMinOrderAmount(request.getMinOrderAmount());
        }
        entity.setStartDate(request.getStartDate());
        entity.setEndDate(request.getEndDate());
        entity.setStartTime(request.getStartTime());
        entity.setEndTime(request.getEndTime());
        entity.setDaysOfWeek(request.getDaysOfWeek());
        entity.setBuyVariantId(request.getBuyVariantId());
        entity.setGetVariantId(request.getGetVariantId());
        if (request.getBogoDiscountPercent() != null) {
            entity.setBogoDiscountPercent(request.getBogoDiscountPercent());
        }
        entity.setUsageLimit(request.getUsageLimit());
        if (request.getIsActive() != null) {
            entity.setIsActive(request.getIsActive());
        }

        PromotionEntity saved = promotionRepository.save(entity);
        return convertToResponse(saved);
    }

    @Override
    @Transactional
    public PromotionResponse toggleActiveStatus(String promotionId) {
        PromotionEntity entity = promotionRepository.findByPromotionId(promotionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Promotion not found: " + promotionId));
        entity.setIsActive(!Boolean.TRUE.equals(entity.getIsActive()));
        PromotionEntity saved = promotionRepository.save(entity);
        return convertToResponse(saved);
    }

    @Override
    @Transactional
    public void deletePromotion(String promotionId) {
        PromotionEntity entity = promotionRepository.findByPromotionId(promotionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Promotion not found: " + promotionId));
        promotionRepository.delete(entity);
    }

    public PromotionResponse convertToResponse(PromotionEntity entity) {
        return PromotionResponse.builder()
                .promotionId(entity.getPromotionId())
                .name(entity.getName())
                .description(entity.getDescription())
                .type(entity.getType())
                .code(entity.getCode())
                .discountType(entity.getDiscountType())
                .discountValue(entity.getDiscountValue())
                .maxDiscountAmount(entity.getMaxDiscountAmount())
                .minOrderAmount(entity.getMinOrderAmount())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .startTime(entity.getStartTime())
                .endTime(entity.getEndTime())
                .daysOfWeek(entity.getDaysOfWeek())
                .buyVariantId(entity.getBuyVariantId())
                .getVariantId(entity.getGetVariantId())
                .bogoDiscountPercent(entity.getBogoDiscountPercent())
                .usageLimit(entity.getUsageLimit())
                .timesUsed(entity.getTimesUsed())
                .isActive(entity.getIsActive())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
