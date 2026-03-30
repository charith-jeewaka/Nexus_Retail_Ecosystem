package lk.ijse.springboot.nexus_retail_ecosystem.repository;

import lk.ijse.springboot.nexus_retail_ecosystem.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    // Only return products where active is true
    List<Product> findAllByActiveTrue();

    // Check duplicates only against active products
    boolean existsByNameAndActiveTrue(String name);
}