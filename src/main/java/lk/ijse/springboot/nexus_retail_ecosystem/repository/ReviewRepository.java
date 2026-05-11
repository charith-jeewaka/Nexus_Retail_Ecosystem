package lk.ijse.springboot.nexus_retail_ecosystem.repository;

import lk.ijse.springboot.nexus_retail_ecosystem.entity.Review;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProduct_Id(Long productId);

    // Fetch reviews with 5 stars and join the Product entity to get the image
    @EntityGraph(attributePaths = {"product"})
    List<Review> findByRating(int rating);
}