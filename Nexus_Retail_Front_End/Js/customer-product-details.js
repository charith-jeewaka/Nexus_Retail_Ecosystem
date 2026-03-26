const productBaseUrl = "http://localhost:8080/api/v1/products";
const reviewBaseUrl = "http://localhost:8080/api/v1/reviews";
const backendImageBase = "http://localhost:8080";

// Declare the variable here so the rest of your file can use it,
// but DON'T assign it a value yet!
let currentProductId = null;

$(document).ready(function() {

    // Listen for your SPA router to announce that the page is ready
    $(document).on('customerPageLoaded', function (event, subPage) {
        if (subPage === 'product-details') {

            // 1. Grab the ID RIGHT NOW, after the card was clicked!
            currentProductId = localStorage.getItem("current_view_product_id");

            // 2. Safety check: If no ID is found, kick them back to the shop
            if (!currentProductId || currentProductId === "undefined" || currentProductId === "null") {
                Swal.fire("Error", "No product selected.", "error").then(() => {
                    window.navigateCustomer('shop');
                });
                return;
            }

            // 3. Trigger the load method with the fresh ID!
            loadProductDetails(currentProductId);
            loadProductReviews(currentProductId)
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

// qty counter + and -

$(document).on('click','#btn-qty-plus', function() {
    let qtyInput = $('#inp-detail-qty')
    let currentQty = parseInt(qtyInput.val());
    qtyInput.val(currentQty + 1)
})

$(document).on('click','#btn-qty-minus', function() {
    let qtyInput = $('#inp-detail-qty')
    let currentQty = parseInt(qtyInput.val());
    if (currentQty > 1)
    qtyInput.val(currentQty - 1)
})

// add to cart

$(document).on('click', '#btn-detail-add-cart', function() {

    // 1. Grab the quantity the user selected
    let selectedQty = parseInt($('#inp-detail-qty').val());

    // 2. Grab the product details directly from the DOM
    let productName = $('#detail-product-name').text();
    let productPriceText = $('#detail-product-price').text();
    let productPrice = parseFloat(productPriceText.replace("Rs. ", "")); // Remove "Rs. " to get pure number
    let productImage = $('#detail-product-image').attr("src");

    // 3. Get the existing cart from Local Storage (or create empty array)
    let cart = JSON.parse(localStorage.getItem('nexus_cart')) || [];

    // 4. Check if the product is already in the cart using currentProductId
    // Note: Make sure currentProductId is available in your file!
    let existingItemIndex = cart.findIndex(item => item.id == currentProductId);

    if (existingItemIndex !== -1) {
        // If it's already in the cart, just add the new quantity to the existing quantity!
        cart[existingItemIndex].qty += selectedQty;
    } else {
        // If it's new, push it to the cart in the EXACT format your Cart page expects
        cart.push({
            id: currentProductId,
            name: productName,
            price: productPrice,
            image: productImage,
            qty: selectedQty
        });
    }

    // 5. Save the updated cart back to Local Storage
    localStorage.setItem('nexus_cart', JSON.stringify(cart));

    // 6. Update the red badge on the navbar immediately!
    if (window.updateCartBadge) {
        window.updateCartBadge();
    }

    // 7. Show a sleek success toast message
    Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Added to Cart',
        text: `${selectedQty}x ${productName}`,
        showConfirmButton: false,
        timer: 1500
    });

    // 8. Reset the quantity input back to 1 for the next click
    $('#inp-detail-qty').val(1);
});

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


// ==========================================
// FETCH AND DRAW REVIEWS
// ==========================================
function loadProductReviews(productId) {
    $.ajax({
        url: reviewBaseUrl + "/product/" + productId,
        method: "GET",
        success: function(res) {
            let reviews = res.data;
            let container = $('#review-list-container');

            // Clear the loading spinner
            container.empty();

            // 1. Check if there are no reviews
            if (!reviews || reviews.length === 0) {
                container.append(`
                    <div class="text-center py-5 bg-light rounded-4 border-dashed">
                        <i class="bi bi-chat-square-text text-secondary opacity-50 display-4 mb-3 d-block"></i>
                        <h6 class="text-dark fw-bold">No reviews yet</h6>
                        <p class="text-muted small">Be the first to share your thoughts!</p>
                    </div>
                `);
                return;
            }

            // 2. Loop through the reviews (Reversing them so the newest is at the top!)
            reviews.reverse().forEach(review => {

                // Optional: Format the date beautifully if your backend sends a timestamp
                let dateObj = new Date(review.createdAt);
                let formattedDate = isNaN(dateObj) ? "Recently" : dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

                // Grab the first letter of the customer's name for a sleek avatar
                let initial = review.customerName ? review.customerName.charAt(0).toUpperCase() : "U";

                let reviewCard = `
                    <div class="card review-card shadow-sm rounded-4 mb-2 border-0">
                        <div class="card-body p-4">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <div class="d-flex align-items-center">
                                    <div class="bg-dark text-white rounded-circle d-flex justify-content-center align-items-center me-3 fw-bold" style="width: 45px; height: 45px; font-size: 1.2rem;">
                                        ${initial}
                                    </div>
                                    <div>
                                        <h6 class="mb-0 fw-bold text-dark">${review.customerName}</h6>
                                        <small class="text-muted">${formattedDate}</small>
                                    </div>
                                </div>
                                <div class="text-warning fs-6">
                                    ${generateStaticStars(review.rating)}
                                </div>
                            </div>
                            <p class="card-text text-secondary mb-0" style="line-height: 1.6;">${review.comment}</p>
                        </div>
                    </div>
                `;
                container.append(reviewCard);
            });
        },
        error: function(xhr) {
            console.error(xhr);
            $('#review-list-container').html(`
                <div class="alert alert-danger rounded-4">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i> Could not load reviews at this time.
                </div>
            `);
        }
    });
}

// ==========================================
// UI CONTROLS: INTERACTIVE STARS
// ==========================================
let selectedRating = 0;

// Hover effect: Fill stars as the mouse moves over them
$(document).on('mouseenter', '.interactive-star', function() {
    let hoverValue = $(this).data('rating');
    updateStarUI(hoverValue);
});

// Leave effect: Revert to the clicked rating when the mouse leaves
$(document).on('mouseleave', '#interactive-star-rating', function() {
    updateStarUI(selectedRating);
});

// Click effect: Lock in the rating and save it to the hidden input
$(document).on('click', '.interactive-star', function() {
    selectedRating = $(this).data('rating');
    $('#inp-review-rating').val(selectedRating);
    updateStarUI(selectedRating);
    $('#rating-error').hide(); // Hide validation error if they fix it
});

// Helper to color the stars gold or grey
function updateStarUI(rating) {
    $('.interactive-star').each(function() {
        let starValue = $(this).data('rating');
        if (starValue <= rating) {
            $(this).removeClass('bi-star text-secondary opacity-25').addClass('bi-star-fill text-warning');
        } else {
            $(this).removeClass('bi-star-fill text-warning').addClass('bi-star text-secondary opacity-25');
        }
    });
}

// ==========================================
// SUBMIT NEW REVIEW
// ==========================================
$(document).on('submit', '#form-submit-review', function(e) {
    e.preventDefault();

    // 1. Security Check: Are they logged in?
    let token = localStorage.getItem("nexus_token");
    let customerId = localStorage.getItem("nexus_user_id");
    let customerName = localStorage.getItem("nexus_user_name");

    if (!token || !customerId) {
        Swal.fire({
            icon: "warning",
            title: "Login Required",
            text: "You must be logged in as a customer to leave a review!"
        });
        return;
    }

    // 2. Validate Star Selection
    let rating = $('#inp-review-rating').val();
    if (!rating || rating === "0") {
        $('#rating-error').show();
        return;
    }

    // 3. Grab the comment
    let comment = $('#inp-review-comment').val();

    // 4. Send to Spring Boot
    $.ajax({
        url: reviewBaseUrl,
        method: "POST",
        headers: {
            "Authorization": "Bearer " + token
        },
        contentType: "application/json",
        data: JSON.stringify({
            productId: currentProductId,
            customerId: customerId,
            customerName: customerName,
            rating: parseInt(rating),
            comment: comment
        }),
        success: function(res) {

            // Show a sleek success message
            Swal.fire({
                icon: "success",
                title: "Review Posted!",
                text: "Thank you for your feedback.",
                timer: 2000,
                showConfirmButton: false
            });

            // Reset the form and interactive stars back to 0
            $('#form-submit-review')[0].reset();
            selectedRating = 0;
            updateStarUI(0);
            $('#inp-review-rating').val("");

            // THE MAGIC TRICK: Refresh the page data instantly!
            loadProductReviews(currentProductId); // Draws the new comment at the top
            loadProductDetails(currentProductId); // Recalculates the average stars at the top of the page!
        },
        error: function(xhr) {
            Swal.fire("Error", "Could not post review. " + (xhr.responseJSON?.message || "Server Error"), "error");
        }
    });
});