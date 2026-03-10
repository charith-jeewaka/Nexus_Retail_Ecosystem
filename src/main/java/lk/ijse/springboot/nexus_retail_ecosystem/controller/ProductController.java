package lk.ijse.springboot.nexus_retail_ecosystem.controller;

import jakarta.validation.Valid;
import lk.ijse.springboot.nexus_retail_ecosystem.dto.APIResponse;
import lk.ijse.springboot.nexus_retail_ecosystem.dto.ProductDTO;
import lk.ijse.springboot.nexus_retail_ecosystem.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    private final ProductService productService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','CASHIER')")
    public ResponseEntity<APIResponse>saveProduct(@Valid @RequestBody ProductDTO productDTO){
        ProductDTO savedProduct=productService.saveProduct(productDTO);

        // The Valid annotation triggers DTO checks
        // If it fails GlobalExceptionHandler takes over automatically

        APIResponse response =new APIResponse(
                HttpStatus.CREATED.value(),
                "Product Saved Successfully",
                savedProduct
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // 2. GET ALL PRODUCTS (Secured: ADMIN and CASHIER can view)
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CASHIER')")
    public ResponseEntity<APIResponse> getAllProducts() {

        List<ProductDTO> products = productService.getAllProducts();

        APIResponse response = new APIResponse(
                HttpStatus.OK.value(),
                "Products retrieved successfully",
                products
        );

        return ResponseEntity.ok(response);
    }

}
