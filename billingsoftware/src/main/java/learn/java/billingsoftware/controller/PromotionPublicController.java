package learn.java.billingsoftware.controller;

import learn.java.billingsoftware.io.PromotionResponse;
import learn.java.billingsoftware.service.PromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/promotions")
@RequiredArgsConstructor
public class PromotionPublicController {

    private final PromotionService promotionService;

    @GetMapping("/active")
    public List<PromotionResponse> fetchActive() {
        return promotionService.fetchActivePromotions();
    }
}
