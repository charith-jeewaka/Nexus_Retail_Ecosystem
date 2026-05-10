package lk.ijse.springboot.nexus_retail_ecosystem.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProductDTO {

    private Long id;

    @NotBlank(message = "Product name cannot be empty")
    @Size(min = 2, max = 60, message = "product name must be between 2 and 50 letters")
    private String name;

    @NotBlank(message = "Please select a category")
    private String category;

    @NotNull(message = "Price is required")
    @Min(value = 0, message = "Price cannot be a negative")
    private BigDecimal unitPrice;

    @NotNull(message = "Add Stock quantity")
    @Min(value = 0, message = "Stock cannot be negative")
    private Integer unitsInStock;

    private String imageUrl;

    private Double averageRating;

    private Integer reviewCount;

    private String description;

    private Integer soldCount;
}