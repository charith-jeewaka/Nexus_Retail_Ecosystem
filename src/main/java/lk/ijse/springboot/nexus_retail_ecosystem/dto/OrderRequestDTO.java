package lk.ijse.springboot.nexus_retail_ecosystem.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderRequestDTO {

    @NotNull(message = "Customer id is required")
    private Long customerId;

    @NotEmpty(message = "Order must contain at least 1 item")
    private List<OrderItemRequestDTO> items;
}
