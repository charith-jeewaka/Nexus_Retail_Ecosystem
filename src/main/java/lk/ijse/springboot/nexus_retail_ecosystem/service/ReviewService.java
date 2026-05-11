package lk.ijse.springboot.nexus_retail_ecosystem.service;

import lk.ijse.springboot.nexus_retail_ecosystem.dto.ReviewDTO;
import lk.ijse.springboot.nexus_retail_ecosystem.dto.ReviewResponseDTO;
import lk.ijse.springboot.nexus_retail_ecosystem.entity.Review;

import java.util.List;
import java.util.stream.Collectors;

public interface ReviewService {
    ReviewDTO saveReview(ReviewDTO reviewDTO);
    List<ReviewDTO> getReviewsByProductId(Long productId);
    public List<ReviewResponseDTO> getTopRatedReviews() ;

}