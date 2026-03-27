package lk.ijse.springboot.nexus_retail_ecosystem.controller;

import jakarta.validation.Valid;
import lk.ijse.springboot.nexus_retail_ecosystem.dto.APIResponse;
import lk.ijse.springboot.nexus_retail_ecosystem.dto.OrderRequestDTO;
import lk.ijse.springboot.nexus_retail_ecosystem.dto.OrderResponseDTO;
import lk.ijse.springboot.nexus_retail_ecosystem.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;

    // 1. PLACE A NEW ORDER
    @PostMapping
    @PreAuthorize("hasAnyAuthority('CUSTOMER','ADMIN')") // Only logged-in customers can checkout!
    public ResponseEntity<APIResponse> placeOrder(@Valid @RequestBody OrderRequestDTO requestDTO) {

        // Pass the validated cart data to the service engine
        OrderResponseDTO savedOrder = orderService.placeOrder(requestDTO);

        // Wrap the result in your standardized APIResponse
        APIResponse response = new APIResponse(
                HttpStatus.CREATED.value(),
                "Order placed successfully",
                savedOrder
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
