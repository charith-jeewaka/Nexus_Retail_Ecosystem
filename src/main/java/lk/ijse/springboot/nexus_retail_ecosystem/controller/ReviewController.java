package lk.ijse.springboot.nexus_retail_ecosystem.controller;

import jakarta.validation.Valid;
import lk.ijse.springboot.nexus_retail_ecosystem.dto.APIResponse;
import lk.ijse.springboot.nexus_retail_ecosystem.dto.ReviewDTO;
import lk.ijse.springboot.nexus_retail_ecosystem.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    // 1. ADD A REVIEW
    @PostMapping
    @PreAuthorize("hasAuthority('CUSTOMER')")
    public ResponseEntity<APIResponse> saveReview(@Valid @RequestBody ReviewDTO reviewDTO) {

        ReviewDTO savedReview = reviewService.saveReview(reviewDTO);

        APIResponse response = new APIResponse(
                HttpStatus.CREATED.value(),
                "Review submitted successfully",
                savedReview
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // 2. GET ALL REVIEWS FOR A SPECIFIC PRODUCT (Open to anyone)
    @GetMapping("/product/{productId}")
    public ResponseEntity<APIResponse> getProductReviews(@PathVariable Long productId) {

        List<ReviewDTO> reviews = reviewService.getReviewsByProductId(productId);

        APIResponse response = new APIResponse(
                HttpStatus.OK.value(),
                "Reviews retrieved successfully",
                reviews
        );
        return ResponseEntity.ok(response);
    }
}