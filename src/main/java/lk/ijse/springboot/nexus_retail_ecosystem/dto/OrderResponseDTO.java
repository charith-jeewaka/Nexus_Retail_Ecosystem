package lk.ijse.springboot.nexus_retail_ecosystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderResponseDTO {

    private Long orderId;
    private String customerName; // <-- NEW FIELD!
    private String status;
    private BigDecimal totalAmount;
    private LocalDateTime orderDate;
    private String message;
}
