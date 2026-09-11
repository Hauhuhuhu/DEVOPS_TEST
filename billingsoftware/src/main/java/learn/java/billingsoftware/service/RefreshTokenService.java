package learn.java.billingsoftware.service;

import learn.java.billingsoftware.entity.RefreshTokenEntity;
import learn.java.billingsoftware.repository.RefreshTokenRepository;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.Base64;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${jwt.refresh-token.expiration-ms:604800000}")
    private long refreshTokenExpirationMs;

    @Transactional
    public IssuedRefreshToken issue(String userEmail) {
        return issue(userEmail, UUID.randomUUID().toString());
    }

    @Transactional
    public IssuedRefreshToken rotate(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            throw invalidRefreshToken();
        }

        Timestamp now = Timestamp.from(Instant.now());
        RefreshTokenEntity existing = refreshTokenRepository.findByTokenHash(hash(rawToken))
                .orElseThrow(this::invalidRefreshToken);

        if (existing.getRevokedAt() != null) {
            // Reuse of a rotated token indicates replay. Revoke the whole family.
            refreshTokenRepository.revokeActiveByFamilyId(existing.getFamilyId(), now);
            throw invalidRefreshToken();
        }

        if (!existing.getExpiresAt().after(now)) {
            existing.setRevokedAt(now);
            refreshTokenRepository.save(existing);
            throw invalidRefreshToken();
        }

        existing.setRevokedAt(now);
        refreshTokenRepository.save(existing);
        return issue(existing.getUserEmail(), existing.getFamilyId());
    }

    @Transactional
    public void revoke(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            return;
        }

        refreshTokenRepository.findByTokenHash(hash(rawToken)).ifPresent(token -> {
            if (token.getRevokedAt() == null) {
                token.setRevokedAt(Timestamp.from(Instant.now()));
                refreshTokenRepository.save(token);
            }
        });
    }

    private IssuedRefreshToken issue(String userEmail, String familyId) {
        String rawToken = generateRawToken();
        Timestamp issuedAt = Timestamp.from(Instant.now());
        Timestamp expiresAt = Timestamp.from(issuedAt.toInstant().plusMillis(refreshTokenExpirationMs));

        refreshTokenRepository.save(RefreshTokenEntity.builder()
                .tokenHash(hash(rawToken))
                .userEmail(userEmail)
                .familyId(familyId)
                .issuedAt(issuedAt)
                .expiresAt(expiresAt)
                .build());

        return new IssuedRefreshToken(rawToken, expiresAt, userEmail);
    }

    private String generateRawToken() {
        byte[] bytes = new byte[48];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hash(String rawToken) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(digest);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is not available", exception);
        }
    }

    private ResponseStatusException invalidRefreshToken() {
        return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token is invalid or expired");
    }

    @Getter
    @AllArgsConstructor
    public static class IssuedRefreshToken {
        private final String rawToken;
        private final Timestamp expiresAt;
        private final String userEmail;
    }
}
