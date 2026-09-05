package learn.java.billingsoftware.repository;

import learn.java.billingsoftware.entity.PromotionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PromotionRepository extends JpaRepository<PromotionEntity, Long> {

    Optional<PromotionEntity> findByPromotionId(String promotionId);

    Optional<PromotionEntity> findByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCase(String code);

    List<PromotionEntity> findAllByOrderByCreatedAtDesc();

    List<PromotionEntity> findByIsActiveTrueOrderByCreatedAtDesc();
}
