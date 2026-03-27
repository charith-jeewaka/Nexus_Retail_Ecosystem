package lk.ijse.springboot.nexus_retail_ecosystem.service;

import lk.ijse.springboot.nexus_retail_ecosystem.dto.OrderRequestDTO;
import lk.ijse.springboot.nexus_retail_ecosystem.dto.OrderResponseDTO;

public interface OrderService {
    OrderResponseDTO placeOrder(OrderRequestDTO orderRequestDTO);
}
