package lk.ijse.springboot.nexus_retail_ecosystem.service.impl;

import lk.ijse.springboot.nexus_retail_ecosystem.dto.ProductDTO;
import lk.ijse.springboot.nexus_retail_ecosystem.entity.Product;
import lk.ijse.springboot.nexus_retail_ecosystem.exception.DuplicateResourceException;
import lk.ijse.springboot.nexus_retail_ecosystem.exception.ResourceNotFoundException;
import lk.ijse.springboot.nexus_retail_ecosystem.repository.ProductRepository;
import lk.ijse.springboot.nexus_retail_ecosystem.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;

    @Override
    public ProductDTO saveProduct(ProductDTO productDTO) {
        // Updated: Check duplicates only against products that are currently active
        if (productRepository.existsByNameAndActiveTrue(productDTO.getName())) {
            throw new DuplicateResourceException("An active product with the name '" + productDTO.getName() + "' already exists!");
        }

        Product product = Product.builder()
                .name(productDTO.getName())
                .category(productDTO.getCategory())
                .unitPrice(productDTO.getUnitPrice())
                .unitsInStock(productDTO.getUnitsInStock())
                .imageUrl(productDTO.getImageUrl())
                .active(true) // Ensure it is active on creation
                .build();

        Product savedProduct = productRepository.save(product);
        return mapToDTO(savedProduct);
    }

    @Override
    public List<ProductDTO> getAllProducts() {
        // Updated: Only return products that are active (Soft Delete filter)
        List<Product> products = productRepository.findAllByActiveTrue();

        return products.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteProduct(Long id) {
        // 1. Find the product
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));

        // 2. Perform Soft Delete
        // We do NOT delete reviews or the product record.
        // We just set active to false so it disappears from the shop.
        existingProduct.setActive(false);
        productRepository.save(existingProduct);
    }

    @Override
    public ProductDTO getProductById(Long id) {
        // Usually, we still allow getting by ID for order history,
        // but you can add .filter(Product::isActive) if you want it strictly hidden.
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));

        return mapToDTO(product);
    }

    @Override
    public ProductDTO updateProduct(Long id, ProductDTO productDTO) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));

        // Logic remains similar, ensuring we check name duplicates against other active products
        if (!existingProduct.getName().equals(productDTO.getName()) &&
                productRepository.existsByNameAndActiveTrue(productDTO.getName())) {
            throw new DuplicateResourceException("Another active product already uses this name.");
        }

        existingProduct.setName(productDTO.getName());
        existingProduct.setCategory(productDTO.getCategory());
        existingProduct.setUnitPrice(productDTO.getUnitPrice());
        existingProduct.setUnitsInStock(productDTO.getUnitsInStock());
        existingProduct.setImageUrl(productDTO.getImageUrl());

        Product updatedProduct = productRepository.save(existingProduct);
        return mapToDTO(updatedProduct);
    }

    private ProductDTO mapToDTO(Product product) {
        return ProductDTO.builder()
                .id(product.getId())
                .name(product.getName())
                .category(product.getCategory())
                .unitPrice(product.getUnitPrice())
                .unitsInStock(product.getUnitsInStock())
                .imageUrl(product.getImageUrl())
                .build();
    }
}