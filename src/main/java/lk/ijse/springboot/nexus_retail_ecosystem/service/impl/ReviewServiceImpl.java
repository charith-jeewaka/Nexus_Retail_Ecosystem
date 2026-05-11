package lk.ijse.springboot.nexus_retail_ecosystem.service.impl;

import lk.ijse.springboot.nexus_retail_ecosystem.dto.ReviewDTO;
import lk.ijse.springboot.nexus_retail_ecosystem.dto.ReviewResponseDTO;
import lk.ijse.springboot.nexus_retail_ecosystem.entity.Product;
import lk.ijse.springboot.nexus_retail_ecosystem.entity.Review;
import lk.ijse.springboot.nexus_retail_ecosystem.exception.ResourceNotFoundException;
import lk.ijse.springboot.nexus_retail_ecosystem.repository.ProductRepository;
import lk.ijse.springboot.nexus_retail_ecosystem.repository.ReviewRepository;
import lk.ijse.springboot.nexus_retail_ecosystem.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;

    @Override
    public ReviewDTO saveReview(ReviewDTO dto) {

        // 1. Find the product using  your custom exception!
        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + dto.getProductId()));

        // 2. Build the entity using the Builder pattern
        Review review = Review.builder()
                .product(product)
                .customerId(dto.getCustomerId())
                .customerName(dto.getCustomerName())
                .rating(dto.getRating())
                .comment(dto.getComment())
                .build();

        // 3. Save to database
        Review savedReview = reviewRepository.save(review);

        // 4. Return as DTO
        return mapToDTO(savedReview);
    }

    @Override
    public List<ReviewDTO> getReviewsByProductId(Long productId) {
        // We don't need to check if the product exists here, just fetch the reviews!
        List<Review> reviews = reviewRepository.findByProduct_Id(productId);

        return reviews.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<ReviewResponseDTO> getTopRatedReviews() {
        // Fetch only 5-star reviews
        List<Review> reviews = reviewRepository.findByRating(5);

        return reviews.stream().map(review -> ReviewResponseDTO.builder()
                .customerName(review.getCustomerName())
                .rating(review.getRating())
                .comment(review.getComment())
                .imageUrl(review.getProduct().getImageUrl()) // Get image from joined Product
                .productName(review.getProduct().getName())
                .createdAt(review.getCreatedAt())
                .build()
        ).collect(Collectors.toList());
    }

    // A handy helper method to keep our code clean, just like in ProductServiceImpl!
    private ReviewDTO mapToDTO(Review review) {
        return ReviewDTO.builder()
                .id(review.getId())
                .productId(review.getProduct().getId())
                .customerId(review.getCustomerId())
                .customerName(review.getCustomerName())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }
}