package learn.java.billingsoftware.service;

import learn.java.billingsoftware.io.PromotionEvaluationRequest;
import learn.java.billingsoftware.io.PromotionEvaluationResponse;
import learn.java.billingsoftware.io.PromotionRequest;
import learn.java.billingsoftware.io.PromotionResponse;

import java.util.List;

public interface PromotionService {

    PromotionResponse createPromotion(PromotionRequest request);

    List<PromotionResponse> fetchAllPromotions();

    List<PromotionResponse> fetchActivePromotions();

    PromotionResponse fetchByPromotionId(String promotionId);

    PromotionResponse updatePromotion(String promotionId, PromotionRequest request);

    PromotionResponse toggleActiveStatus(String promotionId);

    void deletePromotion(String promotionId);

    PromotionEvaluationResponse evaluatePromotion(PromotionEvaluationRequest request);
}
