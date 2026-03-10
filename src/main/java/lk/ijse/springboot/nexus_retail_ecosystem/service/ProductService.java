package lk.ijse.springboot.nexus_retail_ecosystem.service;

import lk.ijse.springboot.nexus_retail_ecosystem.dto.ProductDTO;

import java.util.List;

public interface ProductService {
    ProductDTO saveProduct(ProductDTO productDTO);
    List<ProductDTO> getAllProducts();
}
