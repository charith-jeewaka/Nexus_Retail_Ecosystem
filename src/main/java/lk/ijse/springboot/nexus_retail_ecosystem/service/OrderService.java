package lk.ijse.springboot.nexus_retail_ecosystem.service;

import lk.ijse.springboot.nexus_retail_ecosystem.dto.OrderRequestDTO;
import lk.ijse.springboot.nexus_retail_ecosystem.dto.OrderResponseDTO;

import java.util.List;

public interface OrderService {
    OrderResponseDTO placeOrder(OrderRequestDTO orderRequestDTO);

    List<OrderResponseDTO> getAllOrders();
    OrderResponseDTO updateOrderStatus(Long orderId, String newStatus);
}
