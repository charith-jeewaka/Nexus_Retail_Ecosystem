$(document).ready(function() {

    // Listen for the router to load the cart page
    $(document).on('customerPageLoaded', function(event, subPage) {
        if (subPage === 'cart') {
            loadCartItems();
        }
    });

    function loadCartItems() {
        let cart = JSON.parse(localStorage.getItem('nexus_cart')) || [];
        let tbody = $('#cart-items-body');

        tbody.empty();

        let subtotal = 0;
        let totalItems = 0;

        // If cart is empty, show the empty message and hide the table/summary
        if (cart.length === 0) {
            $('#cart-table').addClass('d-none');
            $('#order-summary-section').addClass('d-none');
            $('#empty-cart-msg').removeClass('d-none');
            return;
        } else {
            $('#cart-table').removeClass('d-none');
            $('#order-summary-section').removeClass('d-none');
            $('#empty-cart-msg').addClass('d-none');
        }

        // Generate the rows
        cart.forEach((item, index) => {
            let itemSubtotal = item.price * item.qty;
            subtotal += itemSubtotal;
            totalItems += item.qty;

            let row = `
                <tr>
                    <td class="ps-4">
                        <div class="d-flex align-items-center">
                            <img src="${item.image}" alt="${item.name}" class="rounded shadow-sm me-3" style="width: 50px; height: 50px; object-fit: cover;">
                            <div>
                                <h6 class="mb-0 fw-bold text-dark">${item.name}</h6>
                                <small class="text-muted">ID: ${item.id}</small>
                            </div>
                        </div>
                    </td>
                    <td class="fw-semibold">Rs. ${item.price.toFixed(2)}</td>
                    <td>
                        <div class="input-group input-group-sm" style="width: 100px;">
                            <button class="btn btn-outline-secondary btn-qty-minus" data-id="${item.id}">-</button>
                            <input type="text" class="form-control text-center bg-white" value="${item.qty}" readonly>
                            <button class="btn btn-outline-secondary btn-qty-plus" data-id="${item.id}">+</button>
                        </div>
                    </td>
                    <td class="fw-bold text-primary">Rs. ${itemSubtotal.toFixed(2)}</td>
                    <td class="pe-4 text-end">
                        <button class="btn btn-sm btn-outline-danger btn-remove-item" data-id="${item.id}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            tbody.append(row);
        });

        // Update the Order Summary box
        $('#summary-item-count').text(totalItems);
        $('#summary-subtotal').text(subtotal.toFixed(2));
        $('#summary-total').text(subtotal.toFixed(2));

        // Ensure global badge is perfectly synced
        if(window.updateCartBadge) window.updateCartBadge();
    }

    // --- BUTTON ACTIONS ---

    // 1. Increase Quantity (+)
    $(document).on('click', '.btn-qty-plus', function() {
        let id = $(this).data('id');
        let cart = JSON.parse(localStorage.getItem('nexus_cart')) || [];
        let item = cart.find(i => i.id === id);

        if (item) {
            item.qty += 1;
            localStorage.setItem('nexus_cart', JSON.stringify(cart));
            loadCartItems(); // Redraw the table
        }
    });

    // 2. Decrease Quantity (-)
    $(document).on('click', '.btn-qty-minus', function() {
        let id = $(this).data('id');
        let cart = JSON.parse(localStorage.getItem('nexus_cart')) || [];
        let item = cart.find(i => i.id === id);

        if (item && item.qty > 1) {
            item.qty -= 1;
            localStorage.setItem('nexus_cart', JSON.stringify(cart));
            loadCartItems(); // Redraw the table
        }
    });

    // 3. Remove Item entirely
    $(document).on('click', '.btn-remove-item', function() {
        let id = $(this).data('id');
        let cart = JSON.parse(localStorage.getItem('nexus_cart')) || [];

        // Filter out the item we want to delete
        cart = cart.filter(i => i.id !== id);

        localStorage.setItem('nexus_cart', JSON.stringify(cart));
        loadCartItems(); // Redraw the table
    });

    // 4. THE REAL CHECKOUT BUTTON
    $(document).on('click', '#btn-checkout', function() {

        // 1. Grab the cart and user details from Local Storage
        let cart = JSON.parse(localStorage.getItem('nexus_cart')) || [];
        let customerId = localStorage.getItem("nexus_user_id");
        let token = localStorage.getItem("nexus_token");

        // 2. Safety Checks
        if (cart.length === 0) {
            Swal.fire("Cart Empty", "Add some items before checking out!", "warning");
            return;
        }

        if (!customerId || !token) {
            Swal.fire("Login Required", "Please log in to place an order.", "warning");
            return;
        }

        // 3. Format the data to perfectly match your OrderRequestDTO in Spring Boot!
        // We only send the ID and Quantity. Spring Boot handles the prices securely!
        let formattedItems = cart.map(item => {
            return {
                productId: item.id,
                quantity: item.qty
            };
        });

        let orderPayload = {
            customerId: parseInt(customerId),
            items: formattedItems
        };

        // 4. Show a loading state so the user doesn't click twice
        let checkoutBtn = $(this);
        let originalText = checkoutBtn.html();
        checkoutBtn.html('<span class="spinner-border spinner-border-sm me-2"></span> Processing...').prop('disabled', true);

        // 5. Send to Spring Boot
        $.ajax({
            url: "http://localhost:8080/api/v1/orders",
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            },
            data: JSON.stringify(orderPayload),
            success: function(res) {
                // SUCCESS!
                let orderData = res.data;

                Swal.fire({
                    icon: "success",
                    title: "Order Placed!",
                    text: `Your order #${orderData.orderId} has confirmed. Total: Rs. ${orderData.totalAmount.toFixed(2)}`,
                    confirmButtonText: "Continue Shopping",
                    confirmButtonColor: "#0d6efd"
                }).then(() => {
                    // Clear the cart from browser memory
                    localStorage.removeItem('nexus_cart');

                    // Update UI
                    loadCartItems();
                    if(window.updateCartBadge) window.updateCartBadge();

                    // Send them back to the shop
                    window.navigateCustomer('shop');
                });
            },
            error: function(xhr) {
                // Put the button back to normal if it fails
                checkoutBtn.html(originalText).prop('disabled', false);

                // Try to grab the exact error message from Spring Boot
                let errorMsg = xhr.responseJSON?.message || "Could not process order at this time.";
                Swal.fire("Checkout Failed", errorMsg, "error");
            }
        });
    });

});