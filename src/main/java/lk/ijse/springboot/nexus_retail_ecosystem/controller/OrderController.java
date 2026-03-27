package lk.ijse.springboot.nexus_retail_ecosystem.controller;

import jakarta.validation.Valid;
import lk.ijse.springboot.nexus_retail_ecosystem.dto.APIResponse;
import lk.ijse.springboot.nexus_retail_ecosystem.dto.OrderItemResponseDTO;
import lk.ijse.springboot.nexus_retail_ecosystem.dto.OrderRequestDTO;
import lk.ijse.springboot.nexus_retail_ecosystem.dto.OrderResponseDTO;
import lk.ijse.springboot.nexus_retail_ecosystem.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    // ... existing placeOrder endpoint ...

    // 2. GET ALL ORDERS (Admin/Cashier only)
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'CASHIER')")
    public ResponseEntity<APIResponse> getAllOrders() {

        List<OrderResponseDTO> orders = orderService.getAllOrders();

        APIResponse response = new APIResponse(
                HttpStatus.OK.value(),
                "Orders retrieved successfully",
                orders
        );
        return ResponseEntity.ok(response);
    }

    // 3. UPDATE ORDER STATUS (Admin/Cashier only)
    @PutMapping("/{orderId}/status")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'CASHIER')")
    public ResponseEntity<APIResponse> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam String status) { // We catch the status from the URL query parameter

        OrderResponseDTO updatedOrder = orderService.updateOrderStatus(orderId, status);

        APIResponse response = new APIResponse(
                HttpStatus.OK.value(),
                "Order status updated",
                updatedOrder
        );
        return ResponseEntity.ok(response);
    }

    // 4. GET SPECIFIC ORDER ITEMS (Admin/Cashier only)
    @GetMapping("/{orderId}/items")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'CASHIER')")
    public ResponseEntity<APIResponse> getOrderItems(@PathVariable Long orderId) {

        List<OrderItemResponseDTO> items = orderService.getOrderItems(orderId);

        APIResponse response = new APIResponse(
                HttpStatus.OK.value(),
                "Order items retrieved",
                items
        );
        return ResponseEntity.ok(response);
    }
}
