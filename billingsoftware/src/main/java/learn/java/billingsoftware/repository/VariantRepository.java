package learn.java.billingsoftware.repository;

import learn.java.billingsoftware.entity.VariantEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VariantRepository extends JpaRepository<VariantEntity, Long> {
    Optional<VariantEntity> findByVariantId(String variantId);
    Optional<VariantEntity> findBySku(String sku);
    boolean existsBySku(String sku);
    List<VariantEntity> findByItem_ItemId(String itemId);
}
