package learn.java.billingsoftware.exception;

import learn.java.billingsoftware.io.ApiErrorResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class PromotionEvaluationExceptionHandler {

    @ExceptionHandler(PromotionEvaluationException.class)
    public ResponseEntity<ApiErrorResponse> handle(PromotionEvaluationException exception) {
        return ResponseEntity.status(exception.getStatus())
                .body(new ApiErrorResponse(exception.getCode(), exception.getMessage()));
    }
}
