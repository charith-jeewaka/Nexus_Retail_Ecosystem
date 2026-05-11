package lk.ijse.springboot.nexus_retail_ecosystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponseDTO {
    private String customerName;
    private int rating;
    private String comment;
    private String imageUrl;
    private String productName;
    private LocalDateTime createdAt;
}
