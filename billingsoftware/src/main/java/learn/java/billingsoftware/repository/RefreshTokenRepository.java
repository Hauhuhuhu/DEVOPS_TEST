package learn.java.billingsoftware.repository;

import learn.java.billingsoftware.entity.RefreshTokenEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.sql.Timestamp;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshTokenEntity, Long> {

    Optional<RefreshTokenEntity> findByTokenHash(String tokenHash);

    @Modifying
    @Query("update RefreshTokenEntity token set token.revokedAt = :revokedAt "
            + "where token.familyId = :familyId and token.revokedAt is null")
    int revokeActiveByFamilyId(@Param("familyId") String familyId, @Param("revokedAt") Timestamp revokedAt);
}
