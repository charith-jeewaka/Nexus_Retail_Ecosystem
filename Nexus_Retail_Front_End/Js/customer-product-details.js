const productBaseUrl = "http://localhost:8080/api/v1/products";
const reviewBaseUrl = "http://localhost:8080/api/v1/reviews";
const backendImageBase = "http://localhost:8080";

let currentProductId = null;

$(document).ready(function() {
    // Listen for SPA router events
    $(document).on('customerPageLoaded', function (event, subPage) {
        if (subPage === 'product-details') {
            currentProductId = localStorage.getItem("current_view_product_id");

            if (!currentProductId || currentProductId === "undefined" || currentProductId === "null") {
                Swal.fire("Error", "No product selected.", "error").then(() => {
                    window.navigateCustomer('shop');
                });
                return;
            }

            loadProductDetails(currentProductId);
            loadProductReviews(currentProductId);
        }
    });
});

// ==========================================
// FETCH PRODUCT DETAILS
// ==========================================
function loadProductDetails(productId) {
    $.ajax({
        url: `${productBaseUrl}/${productId}`,
        method: "GET",
        success: function(res) {
            const p = res.data;

            // Populate Text Fields
            $('#detail-product-name').text(p.name);
            $('#detail-product-category').text(p.category);
            $('#detail-product-price').text("Rs. " + p.unitPrice.toFixed(2));

            const desc = p.description ? p.description : "No detailed description available for this product.";
            $('#detail-product-description').text(desc);

            // Populate Image
            const imageSrc = p.imageUrl ? backendImageBase + p.imageUrl : "https://via.placeholder.com/300x200?text=No+Image";
            $('#detail-product-image').attr("src", imageSrc);

            // Populate Stock Status Badge
            const stockBadge = $('#detail-product-stock');
            if (p.unitsInStock > 10) {
                stockBadge.removeClass().addClass("badge bg-success bg-opacity-10 text-success border border-success-subtle px-3 py-2 rounded-pill fs-6").text(`In Stock (${p.unitsInStock} left)`);
            } else if (p.unitsInStock > 0) {
                stockBadge.removeClass().addClass("badge bg-warning bg-opacity-10 text-warning border border-warning-subtle px-3 py-2 rounded-pill fs-6").text(`Low Stock (${p.unitsInStock} left)`);
            } else {
                stockBadge.removeClass().addClass("badge bg-danger bg-opacity-10 text-danger border border-danger-subtle px-3 py-2 rounded-pill fs-6").text("Out of Stock");
                $('#btn-detail-add-cart').prop("disabled", true).removeClass("btn-primary").addClass("btn-secondary");
            }
        },
        error: function(xhr) {
            Swal.fire("Error", "Failed to fetch product details", "error");
        }
    });
}

// ==========================================
// FETCH AND DRAW REVIEWS + CALCULATE AVG
// ==========================================
function loadProductReviews(productId) {
    $.ajax({
        url: `${reviewBaseUrl}/product/${productId}`,
        method: "GET",
        success: function(res) {
            const reviews = res.data;
            const container = $('#review-list-container');
            container.empty();

            // 1. Handle Empty State
            if (!reviews || reviews.length === 0) {
                $('#detail-stars-container').html(generateStaticStars(0));
                $('#detail-review-count').text("0.0 (0 Reviews)");
                container.append(`
                    <div class="text-center py-5 bg-light rounded-4 border-dashed">
                        <i class="bi bi-chat-square-text text-secondary opacity-50 display-4 mb-3 d-block"></i>
                        <h6 class="text-dark fw-bold">No reviews yet</h6>
                        <p class="text-muted small">Be the first to share your thoughts!</p>
                    </div>
                `);
                return;
            }

            // 2. Calculate Dynamic Average
            let totalRating = 0;
            reviews.forEach(r => totalRating += r.rating);
            const average = (totalRating / reviews.length).toFixed(1);

            // 3. Update Top Summary (Stars + Numeric Score)
            $('#detail-stars-container').html(generateStaticStars(average));
            $('#detail-review-count').html(`<span class="fw-bold text-dark me-1">${average}</span> (${reviews.length} Reviews)`);

            // 4. Draw Review Cards (Newest First)
            reviews.slice().reverse().forEach(review => {
                const dateObj = new Date(review.createdAt);
                const formattedDate = isNaN(dateObj) ? "Recently" : dateObj.toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric'
                });
                const initial = review.customerName ? review.customerName.charAt(0).toUpperCase() : "U";

                container.append(`
                    <div class="card review-card shadow-sm rounded-4 mb-3 border-0">
                        <div class="card-body p-4">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <div class="d-flex align-items-center">
                                    <div class="bg-primary text-white rounded-circle d-flex justify-content-center align-items-center me-3 fw-bold shadow-sm" style="width: 45px; height: 45px;">
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
                    </div>`);
            });
        },
        error: function(xhr) {
            container.html('<p class="text-danger">Failed to load reviews.</p>');
        }
    });
}

// ==========================================
// CART & QUANTITY LOGIC
// ==========================================
$(document).on('click','#btn-qty-plus', function() {
    let qtyInput = $('#inp-detail-qty');
    qtyInput.val(parseInt(qtyInput.val()) + 1);
});

$(document).on('click','#btn-qty-minus', function() {
    let qtyInput = $('#inp-detail-qty');
    let currentQty = parseInt(qtyInput.val());
    if (currentQty > 1) qtyInput.val(currentQty - 1);
});

$(document).on('click', '#btn-detail-add-cart', function() {
    const selectedQty = parseInt($('#inp-detail-qty').val());
    const productName = $('#detail-product-name').text();
    const productPrice = parseFloat($('#detail-product-price').text().replace("Rs. ", ""));
    const productImage = $('#detail-product-image').attr("src");

    let cart = JSON.parse(localStorage.getItem('nexus_cart')) || [];
    let existingItemIndex = cart.findIndex(item => item.id == currentProductId);

    if (existingItemIndex !== -1) {
        cart[existingItemIndex].qty += selectedQty;
    } else {
        cart.push({ id: currentProductId, name: productName, price: productPrice, image: productImage, qty: selectedQty });
    }

    localStorage.setItem('nexus_cart', JSON.stringify(cart));
    if (window.updateCartBadge) window.updateCartBadge();

    Swal.fire({
        toast: true, position: 'top-end', icon: 'success',
        title: 'Added to Cart', text: `${selectedQty}x ${productName}`,
        showConfirmButton: false, timer: 1500
    });
    $('#inp-detail-qty').val(1);
});

// ==========================================
// REVIEW SUBMISSION & INTERACTIVE STARS
// ==========================================
let selectedRating = 0;

$(document).on('mouseenter', '.interactive-star', function() {
    updateStarUI($(this).data('rating'));
}).on('mouseleave', '#interactive-star-rating', function() {
    updateStarUI(selectedRating);
}).on('click', '.interactive-star', function() {
    selectedRating = $(this).data('rating');
    $('#inp-review-rating').val(selectedRating);
    updateStarUI(selectedRating);
    $('#rating-error').hide();
});

function updateStarUI(rating) {
    $('.interactive-star').each(function() {
        const starValue = $(this).data('rating');
        $(this).toggleClass('bi-star-fill text-warning', starValue <= rating)
            .toggleClass('bi-star text-secondary opacity-25', starValue > rating);
    });
}

$(document).on('submit', '#form-submit-review', function(e) {
    e.preventDefault();
    const token = localStorage.getItem("nexus_token");
    const customerId = localStorage.getItem("nexus_user_id");
    const customerName = localStorage.getItem("nexus_user_name");

    if (!token || !customerId) {
        Swal.fire({ icon: "warning", title: "Login Required", text: "Please log in to leave a review!" });
        return;
    }

    const rating = $('#inp-review-rating').val();
    if (!rating || rating === "0") {
        $('#rating-error').show();
        return;
    }

    $.ajax({
        url: reviewBaseUrl,
        method: "POST",
        headers: { "Authorization": "Bearer " + token },
        contentType: "application/json",
        data: JSON.stringify({
            productId: currentProductId,
            customerId: customerId,
            customerName: customerName,
            rating: parseInt(rating),
            comment: $('#inp-review-comment').val()
        }),
        success: function() {
            Swal.fire({ icon: "success", title: "Review Posted!", timer: 2000, showConfirmButton: false });
            $('#form-submit-review')[0].reset();
            selectedRating = 0;
            updateStarUI(0);
            loadProductReviews(currentProductId);
        },
        error: function(xhr) {
            Swal.fire("Error", xhr.responseJSON?.message || "Server Error", "error");
        }
    });
});

// --- HELPER: GENERATE STATIC STARS ---
function generateStaticStars(rating) {
    let safeRating = parseFloat(rating) || 0;
    let starsHtml = "";
    for (let i = 1; i <= 5; i++) {
        if (safeRating >= i) starsHtml += '<i class="bi bi-star-fill text-warning me-1"></i>';
        else if (safeRating > i - 1 && safeRating < i) starsHtml += '<i class="bi bi-star-half text-warning me-1"></i>';
        else starsHtml += '<i class="bi bi-star text-secondary opacity-25 me-1"></i>';
    }
    return starsHtml;
}