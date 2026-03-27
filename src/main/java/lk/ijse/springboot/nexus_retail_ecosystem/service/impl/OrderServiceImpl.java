package lk.ijse.springboot.nexus_retail_ecosystem.service.impl;

import lk.ijse.springboot.nexus_retail_ecosystem.dto.OrderItemRequestDTO;
import lk.ijse.springboot.nexus_retail_ecosystem.dto.OrderItemResponseDTO;
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
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

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
                .customerName(customer.getUsername())
                .status(savedOrder.getStatus().name())
                .totalAmount(savedOrder.getTotalAmount())
                .orderDate(savedOrder.getOrderDate())
                .message("Order placed Successfully")
                .build();
    }

    @Override
    public List<OrderResponseDTO> getAllOrders() {
        // Fetch all orders from the database, sorted from newest to oldest!
        List<Order> orders = orderRepository.findAll(Sort.by(Sort.Direction.DESC, "orderDate"));

        // Convert the Entities into clean DTOs for the frontend
        return orders.stream().map(order -> OrderResponseDTO.builder()
                .orderId(order.getId())
                .customerName(order.getUser().getUsername())
                .status(order.getStatus().name())
                .totalAmount(order.getTotalAmount())
                .orderDate(order.getOrderDate())
                .message("Order retrieved")
                .build()
        ).collect(Collectors.toList());
    }

    @Override
    public OrderResponseDTO updateOrderStatus(Long orderId, String newStatus) {
        // 1. Find the order
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        // 2. Safely convert the String status from the frontend into our Java Enum
        try {
            OrderStatus statusEnum = OrderStatus.valueOf(newStatus.toUpperCase());
            order.setStatus(statusEnum);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status provided: " + newStatus);
        }

        // 3. Save the updated status to the database
        Order updatedOrder = orderRepository.save(order);

        // Optional: If you want to trigger an email when the order is "COMPLETED", you can call your EmailService here!

        // 4. Return the updated data
        return OrderResponseDTO.builder()
                .orderId(updatedOrder.getId())
                .customerName(updatedOrder.getUser().getUsername())
                .status(updatedOrder.getStatus().name())
                .totalAmount(updatedOrder.getTotalAmount())
                .orderDate(updatedOrder.getOrderDate())
                .message("Order status updated to " + updatedOrder.getStatus().name())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderItemResponseDTO> getOrderItems(Long orderId) {
        // 1. Find the order
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        // 2. Map the OrderDetails to our clean DTOs
        return order.getOrderDetails().stream().map(detail -> OrderItemResponseDTO.builder()
                .productId(detail.getProduct().getId())
                .productName(detail.getProduct().getName())
                .quantity(detail.getQuantity())
                .unitPrice(detail.getUnitPrice())
                .subTotal(detail.getSubtotal())
                .build()
        ).collect(Collectors.toList());
    }


}
