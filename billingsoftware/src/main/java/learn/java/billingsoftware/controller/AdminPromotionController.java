package learn.java.billingsoftware.controller;

import learn.java.billingsoftware.io.PromotionRequest;
import learn.java.billingsoftware.io.PromotionResponse;
import learn.java.billingsoftware.service.PromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/promotions")
@RequiredArgsConstructor
public class AdminPromotionController {

    private final PromotionService promotionService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PromotionResponse create(@RequestBody PromotionRequest request) {
        return promotionService.createPromotion(request);
    }

    @GetMapping
    public List<PromotionResponse> fetchAll() {
        return promotionService.fetchAllPromotions();
    }

    @GetMapping("/{promotionId}")
    public PromotionResponse fetchById(@PathVariable String promotionId) {
        return promotionService.fetchByPromotionId(promotionId);
    }

    @PutMapping("/{promotionId}")
    public PromotionResponse update(@PathVariable String promotionId, @RequestBody PromotionRequest request) {
        return promotionService.updatePromotion(promotionId, request);
    }

    @PatchMapping("/{promotionId}/toggle")
    public PromotionResponse toggleActive(@PathVariable String promotionId) {
        return promotionService.toggleActiveStatus(promotionId);
    }

    @DeleteMapping("/{promotionId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String promotionId) {
        promotionService.deletePromotion(promotionId);
    }
}
