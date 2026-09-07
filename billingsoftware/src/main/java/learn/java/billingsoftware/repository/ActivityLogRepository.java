package learn.java.billingsoftware.repository;

import learn.java.billingsoftware.entity.ActivityLogEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface ActivityLogRepository extends JpaRepository<ActivityLogEntity, Long> {

    @Query(value = "SELECT a FROM ActivityLogEntity a WHERE " +
            "(:userEmail IS NULL OR a.userEmail = :userEmail) AND " +
            "(:action IS NULL OR :action = '' OR a.action = :action) AND " +
            "(:startDateTime IS NULL OR a.createdAt >= :startDateTime) AND " +
            "(:endDateTime IS NULL OR a.createdAt <= :endDateTime)",
            countQuery = "SELECT COUNT(a) FROM ActivityLogEntity a WHERE " +
            "(:userEmail IS NULL OR a.userEmail = :userEmail) AND " +
            "(:action IS NULL OR :action = '' OR a.action = :action) AND " +
            "(:startDateTime IS NULL OR a.createdAt >= :startDateTime) AND " +
            "(:endDateTime IS NULL OR a.createdAt <= :endDateTime)")
    Page<ActivityLogEntity> findLogsWithFilter(
            @Param("userEmail") String userEmail,
            @Param("action") String action,
            @Param("startDateTime") LocalDateTime startDateTime,
            @Param("endDateTime") LocalDateTime endDateTime,
            Pageable pageable);
}
