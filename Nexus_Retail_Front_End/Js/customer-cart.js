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

    // 4. Fake Checkout Button (For now!)
    $(document).on('click', '#btn-checkout', function() {
        Swal.fire({
            title: "Ready to Order?",
            text: "This will send your order to the backend!",
            icon: "info",
            showCancelButton: true,
            confirmButtonText: "Yes, Place Order"
        }).then((result) => {
            if (result.isConfirmed) {
                // We will add the actual AJAX POST request here later!
                Swal.fire("Success!", "Your order has been placed.", "success");
                localStorage.removeItem('nexus_cart'); // Clear cart
                loadCartItems(); // Redraw UI
                window.updateCartBadge(); // Clear red badge
            }
        });
    });

});