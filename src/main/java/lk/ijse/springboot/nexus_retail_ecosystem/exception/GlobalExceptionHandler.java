package lk.ijse.springboot.nexus_retail_ecosystem.exception;

import lk.ijse.springboot.nexus_retail_ecosystem.dto.APIResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // 1. Handle our custom Duplicate Username/Email exception (409 Conflict)
    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<APIResponse> handleDuplicateResource(DuplicateResourceException ex) {
        APIResponse response = new APIResponse(
                HttpStatus.CONFLICT.value(),
                ex.getMessage(),
                null
        );
        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }

    // 2. Handle Login Failures (Wrong password) (401 Unauthorized)
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<APIResponse> handleBadCredentials(BadCredentialsException ex) {
        APIResponse response = new APIResponse(
                HttpStatus.UNAUTHORIZED.value(),
                "Invalid username or password",
                null
        );
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    // 3. Handle Login Failures (Wrong username) (404 Not Found)
    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<APIResponse> handleUserNotFound(UsernameNotFoundException ex) {
        APIResponse response = new APIResponse(
                HttpStatus.NOT_FOUND.value(),
                ex.getMessage(),
                null
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    // 4. Global Fallback for any other unexpected errors (500 Internal Server Error)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<APIResponse> handleGlobalException(Exception ex) {
        APIResponse response = new APIResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "An unexpected error occurred: " + ex.getMessage(),
                null
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<APIResponse> handleValidationExceptions(MethodArgumentNotValidException ex) {
        // Collect all the field errors into a Map (e.g., "email" -> "Please provide a valid email")
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
                errors.put(error.getField(), error.getDefaultMessage())
        );

        // Wrap the map in your APIResponse
        APIResponse response = new APIResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Validation failed",
                errors // We pass the map of errors into the 'data' field!
        );

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    // 5. Handle Resource Not Found (404 Not Found)
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<APIResponse> handleResourceNotFound(ResourceNotFoundException ex) {
        APIResponse response = new APIResponse(
                HttpStatus.NOT_FOUND.value(),
                ex.getMessage(),
                null
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }
}