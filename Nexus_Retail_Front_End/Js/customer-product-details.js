const productBaseUrl = "http://localhost:8080/api/v1/products";
const reviewBaseUrl = "http://localhost:8080/api/v1/reviews";
const backendImageBase = "http://localhost:8080";

$(document).ready(function() {
    // 1. Grab the ID that was saved when the user clicked the card
    let currentProductId = localStorage.getItem("current_view_product_id");

    // 2. Safety check: If no ID is found, kick them back to the shop
    if (!currentProductId || currentProductId === "undefined" || currentProductId === "null") {
        Swal.fire("Error", "No product selected.", "error").then(() => {
            window.navigateCustomer('shop');
        });
        return;
    }

    $(document).on('customerPageLoaded', function (event, subPage) {
        if (subPage === 'product-details') {
            // 3. Trigger the load method!
            loadProductDetails(currentProductId);

        }
    });


});


// ==========================================
// FETCH PRODUCT DETAILS
// ==========================================
function loadProductDetails(productId) {
    $.ajax({
        url: productBaseUrl + "/" + productId,
        method: "GET",
        success: function(res) {
            let p = res.data; // This is your ProductDTO

            // 1. Populate Text Fields
            $('#detail-product-name').text(p.name);
            $('#detail-product-category').text(p.category);
            $('#detail-product-price').text("Rs. " + p.unitPrice.toFixed(2));

            // 2. Populate Image
            let imageSrc = p.imageUrl ? backendImageBase + p.imageUrl : "https://via.placeholder.com/300x200?text=No+Image";
            $('#detail-product-image').attr("src", imageSrc);

            // 3. Populate Stock Status Badge dynamically
            let stockBadge = $('#detail-product-stock');
            if (p.unitsInStock > 10) {
                stockBadge.removeClass().addClass("badge bg-success bg-opacity-10 text-success border border-success-subtle px-3 py-2 rounded-pill fs-6").text("In Stock (" + p.unitsInStock + " left)");
            } else if (p.unitsInStock > 0) {
                stockBadge.removeClass().addClass("badge bg-warning bg-opacity-10 text-warning border border-warning-subtle px-3 py-2 rounded-pill fs-6").text("Low Stock (" + p.unitsInStock + " left)");
            } else {
                stockBadge.removeClass().addClass("badge bg-danger bg-opacity-10 text-danger border border-danger-subtle px-3 py-2 rounded-pill fs-6").text("Out of Stock");
                // Disable the add to cart button if out of stock!
                $('#btn-detail-add-cart').prop("disabled", true).removeClass("btn-primary").addClass("btn-secondary");
            }

            // 4. Generate Stars based on the DTO average
            $('#detail-stars-container').html(generateStaticStars(p.averageRating));
            $('#detail-review-count').text("(" + (p.reviewCount || 0) + " Reviews)");
        },
        error: function(xhr) {
            console.error(xhr);
            Swal.fire("Error", "Failed to fetch product details", "error");
        }
    });
}


// --- HELPER: GENERATE STATIC STARS ---
function generateStaticStars(rating) {
    let safeRating = rating || 0;
    let starsHtml = "";
    for (let i = 1; i <= 5; i++) {
        if (safeRating >= i) {
            starsHtml += '<i class="bi bi-star-fill text-warning"></i>'; // Full star
        } else if (safeRating >= i - 0.5) {
            starsHtml += '<i class="bi bi-star-half text-warning"></i>'; // Half star
        } else {
            starsHtml += '<i class="bi bi-star text-secondary opacity-25"></i>'; // Empty star
        }
    }
    return starsHtml;
}

