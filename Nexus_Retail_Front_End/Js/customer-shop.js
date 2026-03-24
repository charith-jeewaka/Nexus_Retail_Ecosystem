$(document).ready(function () {
    const productUrl = "http://localhost:8080/api/v1/products";
    const backendBaseUrl = "http://localhost:8080"

    //
    $(document).on('customerPageLoaded', function (event, subPage) {
        if (subPage === 'shop') {
            loadCustomerProducts();
            updateCartBadge();
        }
    });

    //fetch products (sprig boot)
    function loadCustomerProducts() {
        $.ajax({
            url: productUrl,
            method: "GET",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("nexus_token")
            },
            success: function (res) {
                if(res.code === 200){
                    renderProductGrid(res.data);
                }
            },
            error: function (xhr){
                $('#customer-product-grid').html(`<div class="col-12 text-center text-danger py-5">Failed to load catalog. Server error.</div>`);
            }
        })
    }

    function renderProductGrid(products) {
        let grid = $('#customer-product-grid');
        grid.empty();

        if (products.length === 0) {
            grid.html(`<div class="col-12 text-center text-muted py-5">No products available at the moment.</div>`);
            return;
        }

        products.forEach(product => {
            // Handle image or fallback placeholder
            let imageSrc = product.imageUrl
                ? backendBaseUrl + product.imageUrl
                : "https://via.placeholder.com/300x200?text=No+Image";

            // Prevent buying out-of-stock items!
            let isOutOfStock = product.unitsInStock === 0;
            let btnClass = isOutOfStock ? "btn-secondary disabled" : "btn-primary btn-add-cart";
            let btnText = isOutOfStock ? "Out of Stock" : `<i class="bi bi-cart-plus me-1"></i> Add to Cart`;

            // Build the Bootstrap Card. Notice we attach the product details to the button's data attributes!
            let card = `
                <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                    <div class="card h-100 shadow-sm border-0 product-card-hover">
                        <img src="${imageSrc}" class="card-img-top" alt="${product.name}" style="height: 180px; object-fit: cover;">
                        <div class="card-body d-flex flex-column">
                            <span class="badge bg-light text-secondary border mb-2 align-self-start">${product.category}</span>
                            <h6 class="card-title fw-bold text-dark text-truncate" title="${product.name}">${product.name}</h6>
                            <h5 class="text-primary fw-bold mt-auto mb-3">Rs. ${product.unitPrice.toFixed(2)}</h5>
                            
                            <button class="btn ${btnClass} w-100 mt-auto" 
                                    data-id="${product.id}" 
                                    data-name="${product.name}" 
                                    data-price="${product.unitPrice}"
                                    data-image="${imageSrc}">
                                ${btnText}
                            </button>
                        </div>
                    </div>
                </div>
            `;
            grid.append(card);
        });
    }

    // ---------------------------------------------------------
    // 4. ADD TO CART LOGIC
    // ---------------------------------------------------------
    $(document).on('click', '.btn-add-cart', function() {

        // Grab the data we packed into the button
        let id = $(this).data('id');
        let name = $(this).data('name');
        let price = $(this).data('price');
        let image = $(this).data('image');

        // Check local storage for an existing cart. If none, create an empty array.
        let cart = JSON.parse(localStorage.getItem('nexus_cart')) || [];

        // Check if this item is already in the cart
        let existingItem = cart.find(item => item.id === id);

        if (existingItem) {
            existingItem.qty += 1; // Just increase the quantity
        } else {
            cart.push({ id: id, name: name, price: price, image: image, qty: 1 }); // Add new item
        }

        // Save the updated cart back to local storage
        localStorage.setItem('nexus_cart', JSON.stringify(cart));

        // Show a sleek "Toast" notification using SweetAlert
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Added to Cart',
            text: name,
            showConfirmButton: false,
            timer: 1500
        });

        // Instantly update the red badge on the navbar!
        updateCartBadge();
        console.log(localStorage.getItem('nexus_cart'));
    });

    // ---------------------------------------------------------
    // 5. UPDATE CART BADGE GLOBALLY
    // ---------------------------------------------------------
    window.updateCartBadge = function() {
        let cart = JSON.parse(localStorage.getItem('nexus_cart')) || [];

        // Count total quantity of all items
        let totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

        $('#cart-item-count').text(totalItems);

        // Add a tiny animation bump to the badge to draw the user's eye!
        $('#cart-item-count').addClass('animate__animated animate__heartBeat').on('animationend', function() {
            $(this).removeClass('animate__animated animate__heartBeat');
        });
    };
})