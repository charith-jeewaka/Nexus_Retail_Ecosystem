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