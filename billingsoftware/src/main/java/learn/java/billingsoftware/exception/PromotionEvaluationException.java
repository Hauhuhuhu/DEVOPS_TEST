package learn.java.billingsoftware.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@Getter
public class PromotionEvaluationException extends ResponseStatusException {

    private final String code;

    public PromotionEvaluationException(HttpStatus status, String code, String message) {
        super(status, message);
        this.code = code;
    }
}
