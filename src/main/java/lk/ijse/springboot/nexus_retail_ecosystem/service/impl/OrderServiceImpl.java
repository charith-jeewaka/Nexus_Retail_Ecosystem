package lk.ijse.springboot.nexus_retail_ecosystem.service.impl;

import lk.ijse.springboot.nexus_retail_ecosystem.dto.OrderItemRequestDTO;
import lk.ijse.springboot.nexus_retail_ecosystem.dto.OrderRequestDTO;
import lk.ijse.springboot.nexus_retail_ecosystem.dto.OrderResponseDTO;
import lk.ijse.springboot.nexus_retail_ecosystem.entity.*;
import lk.ijse.springboot.nexus_retail_ecosystem.exception.ResourceNotFoundException;
import lk.ijse.springboot.nexus_retail_ecosystem.repository.OrderRepository;
import lk.ijse.springboot.nexus_retail_ecosystem.repository.ProductRepository;
import lk.ijse.springboot.nexus_retail_ecosystem.repository.UserRepository;
import lk.ijse.springboot.nexus_retail_ecosystem.service.EmailService;
import lk.ijse.springboot.nexus_retail_ecosystem.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.MessageSource;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final SimpMessagingTemplate simpMessagingTemplate;
    private final MessageSource messageSource;

    @Override
    @Transactional
    public OrderResponseDTO placeOrder(OrderRequestDTO request) {

// 1. Find the User who is buying
        User customer = userRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        // 2. Prepare empty containers for our math and data
        BigDecimal grandTotal = BigDecimal.ZERO;
        List<OrderDetail> orderDetailsList = new ArrayList<>();

        // 3. Create the parent Order (Receipt Header) - We will fill in the details in a moment
        Order newOrder = Order.builder()
                .user(customer)
                .orderDate(LocalDateTime.now())
                .status(OrderStatus.PENDING) // New orders are always pending!
                .orderDetails(new ArrayList<>())
                .build();

// 4. Loop through the items sent from the frontend cart
        for (OrderItemRequestDTO itemRequest : request.getItems()){

            //find the actual product in the database
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product ID " + itemRequest.getProductId() + " not found"));

            //check the stock is enough
            if(product.getUnitsInStock() < itemRequest.getQuantity()){
                throw new IllegalStateException("Not enough stock for product: " + product.getName() + ". Only " + product.getUnitsInStock() + " left.");
            }

            //deduct the stock
            product.setUnitsInStock(product.getUnitsInStock() - itemRequest.getQuantity());
            productRepository.save(product);

            // d. Calculate the subtotal for this specific item line
            BigDecimal itemSubTotal = product.getUnitPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity()));

            // e. Add to the overall receipt total
            grandTotal = grandTotal.add(itemSubTotal);

            //create the order detail (line item)
            OrderDetail detail = OrderDetail.builder()
                    .order(newOrder) // Link back to the parent order
                    .product(product)
                    .quantity(itemRequest.getQuantity())
                    .unitPrice(product.getUnitPrice())// Lock in the price snapshot!
                    .subtotal(itemSubTotal)
                    .build();

            orderDetailsList.add(detail);

        }
        // Finalize the Order data
        newOrder.setTotalAmount(grandTotal);
        newOrder.setOrderDetails(orderDetailsList);

        //  Save to Database! (Because of CascadeType.ALL, this saves the OrderDetails automatically too!)
        Order savedOrder = orderRepository.save(newOrder);

        // Fire off the email in the background!
//        emailService.sendOrderConfirmationHtml(
//                customer.getEmail(),
//                customer.getUsername(),
//                savedOrder
//        );

        simpMessagingTemplate.convertAndSend("/topic/orders","NEW_ORDER:" +savedOrder.getId());

        //return the clean response to the front end

        return OrderResponseDTO.builder()
                .orderId(savedOrder.getId())
                .status(savedOrder.getStatus().name())
                .totalAmount(savedOrder.getTotalAmount())
                .orderDate(savedOrder.getOrderDate())
                .message("Order placed Successfully")
                .build();
    }


}
