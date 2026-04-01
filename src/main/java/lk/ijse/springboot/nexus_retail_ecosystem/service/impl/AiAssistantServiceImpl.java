package lk.ijse.springboot.nexus_retail_ecosystem.service.impl;

import lk.ijse.springboot.nexus_retail_ecosystem.entity.Product;
import lk.ijse.springboot.nexus_retail_ecosystem.repository.ProductRepository;
import lk.ijse.springboot.nexus_retail_ecosystem.service.AiAssistantService;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AiAssistantServiceImpl implements AiAssistantService {

    private final ProductRepository productRepository;

    @Override
    @Tool(description = "Search the Nexus Retail database for products based on a category or a maximum price limit.")
    public String searchInventory(SearchRequest request) {
        System.out.println("🤖 AI is searching the database with: " + request);

        List<Product> products = productRepository.findAll().stream()
                .filter(p -> p.isActive())
                .filter(p -> request.category() == null || p.getCategory().equalsIgnoreCase(request.category()))
                .filter(p -> request.maxPrice() == null || p.getUnitPrice().doubleValue() <= request.maxPrice())
                .collect(Collectors.toList());

        if (products.isEmpty()) {
            return "No products found matching those criteria.";
        }

        return products.toString();
    }
}