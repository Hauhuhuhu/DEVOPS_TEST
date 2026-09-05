package learn.java.billingsoftware.repository;

import learn.java.billingsoftware.entity.ModifierEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ModifierRepository extends JpaRepository<ModifierEntity, Long> {
    Optional<ModifierEntity> findByModifierId(String modifierId);
}
