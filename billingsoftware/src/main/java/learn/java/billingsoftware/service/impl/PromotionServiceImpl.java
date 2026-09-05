package learn.java.billingsoftware.service.impl;

import learn.java.billingsoftware.entity.DiscountType;
import learn.java.billingsoftware.entity.PromotionEntity;
import learn.java.billingsoftware.entity.PromotionType;
import learn.java.billingsoftware.io.*;
import learn.java.billingsoftware.repository.PromotionRepository;
import learn.java.billingsoftware.service.PromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
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

    @Override
    @Transactional(readOnly = true)
    public PromotionEvaluationResponse evaluatePromotion(PromotionEvaluationRequest request) {
        return evaluatePromotion(request, LocalDate.now(), LocalTime.now());
    }

    public PromotionEvaluationResponse evaluatePromotion(PromotionEvaluationRequest request, LocalDate today, LocalTime nowTime) {
        BigDecimal subtotal = BigDecimal.ZERO;
        if (request != null && request.getCartItems() != null) {
            for (EvaluationCartItem item : request.getCartItems()) {
                BigDecimal itemPrice = item.getPrice() != null ? item.getPrice() : (item.getBasePrice() != null ? item.getBasePrice() : BigDecimal.ZERO);
                int qty = item.getQuantity() != null ? item.getQuantity() : 1;
                subtotal = subtotal.add(itemPrice.multiply(BigDecimal.valueOf(qty)));
            }
        }
        subtotal = subtotal.setScale(2, RoundingMode.HALF_UP);

        if (subtotal.compareTo(BigDecimal.ZERO) <= 0) {
            if (request != null && request.getCouponCode() != null && !request.getCouponCode().trim().isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Giỏ hàng trống, không thể áp dụng mã giảm giá");
            }
            return PromotionEvaluationResponse.builder()
                    .subtotal(BigDecimal.ZERO)
                    .discountAmount(BigDecimal.ZERO)
                    .discountedSubtotal(BigDecimal.ZERO)
                    .tax(BigDecimal.ZERO)
                    .grandTotal(BigDecimal.ZERO)
                    .candidates(Collections.emptyList())
                    .message("Giỏ hàng trống")
                    .build();
        }

        DayOfWeek todayDow = today.getDayOfWeek();
        List<PromotionCandidateDto> candidates = new ArrayList<>();

        // 1. Evaluate HAPPY_HOUR
        List<PromotionEntity> activePromotions = promotionRepository.findByIsActiveTrueOrderByCreatedAtDesc();
        for (PromotionEntity promo : activePromotions) {
            if (promo.getType() == PromotionType.HAPPY_HOUR) {
                if (promo.getStartDate() != null && today.isBefore(promo.getStartDate())) continue;
                if (promo.getEndDate() != null && today.isAfter(promo.getEndDate())) continue;

                if (promo.getDaysOfWeek() != null && !promo.getDaysOfWeek().trim().isEmpty()) {
                    List<String> days = Arrays.stream(promo.getDaysOfWeek().split(","))
                            .map(String::trim)
                            .map(String::toUpperCase)
                            .collect(Collectors.toList());
                    if (!days.contains(todayDow.name())) continue;
                }

                if (promo.getStartTime() != null && nowTime.isBefore(promo.getStartTime())) continue;
                if (promo.getEndTime() != null && nowTime.isAfter(promo.getEndTime())) continue;

                if (promo.getMinOrderAmount() != null && subtotal.compareTo(promo.getMinOrderAmount()) < 0) continue;

                BigDecimal discount = BigDecimal.ZERO;
                if (promo.getDiscountType() == DiscountType.PERCENTAGE) {
                    discount = subtotal.multiply(promo.getDiscountValue()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                    if (promo.getMaxDiscountAmount() != null && discount.compareTo(promo.getMaxDiscountAmount()) > 0) {
                        discount = promo.getMaxDiscountAmount();
                    }
                } else if (promo.getDiscountType() == DiscountType.FIXED_AMOUNT) {
                    discount = promo.getDiscountValue() != null ? promo.getDiscountValue().min(subtotal) : BigDecimal.ZERO;
                }

                if (discount.compareTo(BigDecimal.ZERO) > 0) {
                    candidates.add(PromotionCandidateDto.builder()
                            .promotionId(promo.getPromotionId())
                            .name(promo.getName())
                            .type(promo.getType())
                            .discountAmount(discount.setScale(2, RoundingMode.HALF_UP))
                            .description("Khung giờ vàng: " + promo.getName())
                            .build());
                }
            } else if (promo.getType() == PromotionType.BOGO) {
                if (promo.getStartDate() != null && today.isBefore(promo.getStartDate())) continue;
                if (promo.getEndDate() != null && today.isAfter(promo.getEndDate())) continue;
                if (promo.getMinOrderAmount() != null && subtotal.compareTo(promo.getMinOrderAmount()) < 0) continue;

                String buyId = promo.getBuyVariantId();
                String getId = promo.getGetVariantId();

                if (buyId != null && getId != null && request != null && request.getCartItems() != null) {
                    int buyQty = 0;
                    int getQty = 0;
                    BigDecimal getPrice = BigDecimal.ZERO;

                    for (EvaluationCartItem item : request.getCartItems()) {
                        boolean matchesBuy = (item.getVariantId() != null && item.getVariantId().equalsIgnoreCase(buyId))
                                || (item.getItemId() != null && item.getItemId().equalsIgnoreCase(buyId));
                        boolean matchesGet = (item.getVariantId() != null && item.getVariantId().equalsIgnoreCase(getId))
                                || (item.getItemId() != null && item.getItemId().equalsIgnoreCase(getId));

                        if (matchesBuy) {
                            buyQty += (item.getQuantity() != null ? item.getQuantity() : 1);
                        }
                        if (matchesGet) {
                            getQty += (item.getQuantity() != null ? item.getQuantity() : 1);
                            BigDecimal p = item.getPrice() != null ? item.getPrice() : (item.getBasePrice() != null ? item.getBasePrice() : BigDecimal.ZERO);
                            if (p.compareTo(BigDecimal.ZERO) > 0) {
                                getPrice = p;
                            }
                        }
                    }

                    int eligibleFreeUnits = 0;
                    if (buyId.equalsIgnoreCase(getId)) {
                        eligibleFreeUnits = buyQty / 2;
                    } else {
                        eligibleFreeUnits = Math.min(buyQty, getQty);
                    }

                    if (eligibleFreeUnits > 0 && getPrice.compareTo(BigDecimal.ZERO) > 0) {
                        BigDecimal bogoPercent = promo.getBogoDiscountPercent() != null ? promo.getBogoDiscountPercent() : BigDecimal.valueOf(100.0);
                        BigDecimal discount = getPrice.multiply(BigDecimal.valueOf(eligibleFreeUnits))
                                .multiply(bogoPercent).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                        if (promo.getMaxDiscountAmount() != null && discount.compareTo(promo.getMaxDiscountAmount()) > 0) {
                            discount = promo.getMaxDiscountAmount();
                        }
                        if (discount.compareTo(BigDecimal.ZERO) > 0) {
                            candidates.add(PromotionCandidateDto.builder()
                                    .promotionId(promo.getPromotionId())
                                    .name(promo.getName())
                                    .type(promo.getType())
                                    .discountAmount(discount.setScale(2, RoundingMode.HALF_UP))
                                    .description("Mua " + eligibleFreeUnits + " tặng " + eligibleFreeUnits + " (" + promo.getName() + ")")
                                    .build());
                        }
                    }
                }
            }
        }

        // 2. Evaluate COUPON (if provided)
        PromotionCandidateDto couponCandidate = null;
        if (request != null && request.getCouponCode() != null && !request.getCouponCode().trim().isEmpty()) {
            String code = request.getCouponCode().trim().toUpperCase();
            PromotionEntity couponPromo = promotionRepository.findByCodeIgnoreCase(code)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã giảm giá '" + code + "' không tồn tại"));

            if (!Boolean.TRUE.equals(couponPromo.getIsActive())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã giảm giá '" + code + "' đang tạm ngưng hoạt động");
            }
            if (couponPromo.getStartDate() != null && today.isBefore(couponPromo.getStartDate())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã giảm giá chưa đến ngày áp dụng");
            }
            if (couponPromo.getEndDate() != null && today.isAfter(couponPromo.getEndDate())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã giảm giá đã hết hạn sử dụng");
            }
            if (couponPromo.getUsageLimit() != null && couponPromo.getTimesUsed() != null && couponPromo.getTimesUsed() >= couponPromo.getUsageLimit()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã giảm giá đã hết lượt sử dụng");
            }
            if (couponPromo.getMinOrderAmount() != null && subtotal.compareTo(couponPromo.getMinOrderAmount()) < 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Đơn hàng tối thiểu phải đạt " + couponPromo.getMinOrderAmount().stripTrailingZeros().toPlainString() + "đ để áp dụng mã này");
            }

            BigDecimal discount = BigDecimal.ZERO;
            if (couponPromo.getDiscountType() == DiscountType.PERCENTAGE) {
                discount = subtotal.multiply(couponPromo.getDiscountValue()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                if (couponPromo.getMaxDiscountAmount() != null && discount.compareTo(couponPromo.getMaxDiscountAmount()) > 0) {
                    discount = couponPromo.getMaxDiscountAmount();
                }
            } else if (couponPromo.getDiscountType() == DiscountType.FIXED_AMOUNT) {
                discount = couponPromo.getDiscountValue() != null ? couponPromo.getDiscountValue().min(subtotal) : BigDecimal.ZERO;
            }

            couponCandidate = PromotionCandidateDto.builder()
                    .promotionId(couponPromo.getPromotionId())
                    .name(couponPromo.getName())
                    .type(couponPromo.getType())
                    .discountAmount(discount.setScale(2, RoundingMode.HALF_UP))
                    .description("Mã " + couponPromo.getCode())
                    .build();
            candidates.add(couponCandidate);
        }

        // 3. ADR-0003: Select the Single Best Promotion (No stacking!)
        BigDecimal bestDiscount = BigDecimal.ZERO;
        PromotionCandidateDto bestCandidate = null;

        for (PromotionCandidateDto candidate : candidates) {
            if (candidate.getDiscountAmount().compareTo(bestDiscount) > 0) {
                bestDiscount = candidate.getDiscountAmount();
                bestCandidate = candidate;
            } else if (candidate.getDiscountAmount().compareTo(bestDiscount) == 0 && bestCandidate != null) {
                if (candidate.getType() == PromotionType.COUPON) {
                    bestCandidate = candidate;
                }
            }
        }

        BigDecimal discountedSubtotal = subtotal.subtract(bestDiscount).max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
        BigDecimal tax = discountedSubtotal.multiply(BigDecimal.valueOf(0.1)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal grandTotal = discountedSubtotal.add(tax).setScale(2, RoundingMode.HALF_UP);

        String message;
        if (bestCandidate != null) {
            message = "Đã áp dụng: " + bestCandidate.getName() + " (-" + bestCandidate.getDiscountAmount().stripTrailingZeros().toPlainString() + "đ)";
        } else if (request != null && request.getCouponCode() != null && !request.getCouponCode().trim().isEmpty()) {
            message = "Mã giảm giá hợp lệ nhưng không mang lại giảm giá";
        } else {
            message = "Không có khuyến mãi nào phù hợp";
        }

        return PromotionEvaluationResponse.builder()
                .subtotal(subtotal)
                .discountAmount(bestDiscount)
                .discountedSubtotal(discountedSubtotal)
                .tax(tax)
                .grandTotal(grandTotal)
                .appliedPromotionId(bestCandidate != null ? bestCandidate.getPromotionId() : null)
                .appliedPromotionName(bestCandidate != null ? bestCandidate.getName() : null)
                .appliedPromotionType(bestCandidate != null ? bestCandidate.getType() : null)
                .message(message)
                .candidates(candidates)
                .build();
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
