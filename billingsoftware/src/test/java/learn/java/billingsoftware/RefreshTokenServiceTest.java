package learn.java.billingsoftware;

import learn.java.billingsoftware.entity.RefreshTokenEntity;
import learn.java.billingsoftware.repository.RefreshTokenRepository;
import learn.java.billingsoftware.service.RefreshTokenService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    private RefreshTokenService refreshTokenService;

    @BeforeEach
    void setUp() {
        refreshTokenService = new RefreshTokenService(refreshTokenRepository);
        ReflectionTestUtils.setField(refreshTokenService, "refreshTokenExpirationMs", 604800000L);
    }

    @Test
    void rotate_revokesPreviousTokenAndKeepsFamily() {
        when(refreshTokenRepository.save(any(RefreshTokenEntity.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        RefreshTokenService.IssuedRefreshToken issued = refreshTokenService.issue("cashier@example.com");

        ArgumentCaptor<RefreshTokenEntity> savedTokens = ArgumentCaptor.forClass(RefreshTokenEntity.class);
        verify(refreshTokenRepository).save(savedTokens.capture());
        RefreshTokenEntity storedToken = savedTokens.getValue();
        when(refreshTokenRepository.findByTokenHashForUpdate(anyString())).thenReturn(Optional.of(storedToken));

        RefreshTokenService.IssuedRefreshToken rotated = refreshTokenService.rotate(issued.getRawToken());

        assertThat(storedToken.getRevokedAt()).isNotNull();
        assertThat(rotated.getUserEmail()).isEqualTo("cashier@example.com");
        verify(refreshTokenRepository).findByTokenHashForUpdate(anyString());
        verify(refreshTokenRepository, times(3)).save(any(RefreshTokenEntity.class));
        verify(refreshTokenRepository).save(org.mockito.ArgumentMatchers.argThat(token ->
                storedToken.getFamilyId().equals(token.getFamilyId())
                        && !storedToken.getTokenHash().equals(token.getTokenHash())));
    }

    @Test
    void rotate_reusedTokenRevokesWholeFamilyAndReturnsUnauthorized() {
        RefreshTokenEntity revokedToken = RefreshTokenEntity.builder()
                .tokenHash("already-used")
                .userEmail("cashier@example.com")
                .familyId("family-1")
                .issuedAt(Timestamp.from(Instant.now().minusSeconds(60)))
                .expiresAt(Timestamp.from(Instant.now().plusSeconds(60)))
                .revokedAt(Timestamp.from(Instant.now().minusSeconds(1)))
                .build();
        when(refreshTokenRepository.findByTokenHashForUpdate(anyString())).thenReturn(Optional.of(revokedToken));

        assertThatThrownBy(() -> refreshTokenService.rotate("replayed-token"))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("401 UNAUTHORIZED");

        verify(refreshTokenRepository).revokeActiveByFamilyId(eq("family-1"), any(Timestamp.class));
    }
}
