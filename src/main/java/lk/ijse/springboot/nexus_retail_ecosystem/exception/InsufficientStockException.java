package lk.ijse.springboot.nexus_retail_ecosystem.exception;

public class InsufficientStockException extends RuntimeException {
    public InsufficientStockException(String message) {
        super(message);
    }
}
