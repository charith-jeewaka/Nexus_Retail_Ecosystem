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

        //check duplicates
        if (productRepository.existsByName(productDTO.getName())) {
            throw new DuplicateResourceException("A product with the name '" + productDTO.getName() + "' already exists!");
        }

        Product product = Product.builder()
                .name(productDTO.getName())
                .category(productDTO.getCategory())
                .unitPrice(productDTO.getUnitPrice())
                .unitsInStock(productDTO.getUnitsInStock())
                .imageUrl(productDTO.getImageUrl())
                .build();

        //saving to database and re sending the saved data to the frontend to get correced and updted data
        Product savedProduct = productRepository.save(product);

        return mapToDTO(savedProduct);
    }

    @Override
    public List<ProductDTO> getAllProducts() {
        List<Product> products = productRepository.findAll();

        // Convert the list of Entities into a list of DTOs
        return products.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // A handy helper method to keep our code clean!
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

    @Override
    public ProductDTO updateProduct(Long id, ProductDTO productDTO) {
        // 1. Find the product or throw our new 404 exception
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));

        // 2. Optional: Check if they are changing the name to a name that already exists!
        if (!existingProduct.getName().equals(productDTO.getName()) && productRepository.existsByName(productDTO.getName())) {
            throw new DuplicateResourceException("A product with the name '" + productDTO.getName() + "' already exists!");
        }

        // 3. Update the fields
        existingProduct.setName(productDTO.getName());
        existingProduct.setCategory(productDTO.getCategory());
        existingProduct.setUnitPrice(productDTO.getUnitPrice());
        existingProduct.setUnitsInStock(productDTO.getUnitsInStock()); // Optional: Usually stock is updated via a separate Inventory system, but fine for now!
        existingProduct.setImageUrl(productDTO.getImageUrl());

        // 4. Save and return as DTO
        Product updatedProduct = productRepository.save(existingProduct);
        return mapToDTO(updatedProduct);
    }

    @Override
    public void deleteProduct(Long id) {
        // 1. Check if it exists first
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product not found with ID: " + id);
        }
        // 2. Delete it
        productRepository.deleteById(id);
    }

    @Override
    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));

        return mapToDTO(product);
    }
}
