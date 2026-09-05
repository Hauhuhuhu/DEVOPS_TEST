package learn.java.billingsoftware.repository;

import learn.java.billingsoftware.entity.ModifierGroupEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface ModifierGroupRepository extends JpaRepository<ModifierGroupEntity, Long> {
    Optional<ModifierGroupEntity> findByGroupId(String groupId);
    List<ModifierGroupEntity> findAllByOrderByCreatedAtDesc();
    List<ModifierGroupEntity> findByGroupIdIn(Collection<String> groupIds);
}
