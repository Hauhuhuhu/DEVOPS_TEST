package learn.java.billingsoftware.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;

@Entity
@Table(name = "refresh_tokens", indexes = {
        @Index(name = "idx_refresh_token_family", columnList = "familyId"),
        @Index(name = "idx_refresh_token_user", columnList = "userEmail")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefreshTokenEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 128)
    private String tokenHash;

    @Column(nullable = false)
    private String userEmail;

    @Column(nullable = false, length = 36)
    private String familyId;

    @Column(nullable = false)
    private Timestamp issuedAt;

    @Column(nullable = false)
    private Timestamp expiresAt;

    private Timestamp revokedAt;
}
