$(document).ready(function () {
    const productUrl = "http://localhost:8080/api/v1/products";
    const backendBaseUrl = "http://localhost:8080";

    // GLOBAL VARIABLE: Store all products in memory so searching is instant!
    let allShopProducts = [];

    // Track the currently active category filter
    let activeCategory = "All";

    // 1. Listen for the CUSTOMER Sub-Router event
    $(document).on('customerPageLoaded', function (event, subPage) {
        if (subPage === 'shop') {
            loadCustomerProducts();
            updateCartBadge();
            loadCustomerDetails()
        }
    });


    function loadCustomerDetails(){
        $('#display-customer-name').text(localStorage.getItem("nexus_user_name"));
    }

    // 2. Fetch products (Spring Boot)
    function loadCustomerProducts() {
        $.ajax({
            url: productUrl,
            method: "GET",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("nexus_token")
            },
            success: function (res) {
                if(res.code === 200){
                    allShopProducts = res.data; // Save them to our global array
                    renderProductGrid(allShopProducts); // Draw all of them initially
                }
            },
            error: function (xhr){
                $('#customer-product-grid').html(`<div class="col-12 text-center text-danger py-5">Failed to load catalog. Server error.</div>`);
            }
        });
    }

    // 3. Draw the Product Cards
    function renderProductGrid(products) {
        let grid = $('#customer-product-grid');
        grid.empty();

        if (products.length === 0) {
            grid.html(`
                <div class="col-12 text-center text-muted py-5">
                    <i class="bi bi-search text-secondary opacity-25" style="font-size: 4rem;"></i>
                    <h5 class="mt-3">No products found</h5>
                    <p>Try adjusting your search or category filters.</p>
                </div>
            `);
            return;
        }

        products.forEach(product => {
            let imageSrc = product.imageUrl
                ? backendBaseUrl + product.imageUrl
                : "https://via.placeholder.com/300x200?text=No+Image";

            let isOutOfStock = product.unitsInStock === 0;
            // Added btn-sm here to make the button sleeker
            let btnClass = isOutOfStock ? "btn-secondary disabled btn-sm" : "btn-primary btn-add-cart btn-sm";
            let btnText = isOutOfStock ? "Out of Stock" : `<i class="bi bi-cart-plus me-1"></i> Add`;

            // Updated Grid classes, Image height (140px), and Font sizes (fs-6, small)
            let card = `
            <div class="col-6 col-md-4 col-lg-3 col-xl-2"> 
                <div class="card h-100 shadow-sm border-0 product-card-hover bg-white">
                    
                    <img src="${imageSrc}" class="card-img-top p-2" alt="${product.name}" 
                         style="height: 140px; object-fit: contain; background-color: #fff; cursor: pointer;"
                         onclick="localStorage.setItem('current_view_product_id', ${product.id}); window.navigateCustomer('product-details');">
                    
                    <div class="card-body d-flex flex-column p-3">
                        <span class="badge bg-light text-secondary border mb-2 align-self-start" style="font-size: 0.65rem;">${product.category}</span>
                        
                        <h6 class="card-title fw-bold text-dark text-truncate mb-1" 
                            style="font-size: 0.85rem; cursor: pointer;" 
                            title="${product.name}"
                            onclick="localStorage.setItem('current_view_product_id', ${product.id}); window.navigateCustomer('product-details');">
                            ${product.name}
                        </h6>
                        
                        <h6 class="text-primary fw-bold mt-auto mb-3" style="font-size: 0.9rem;">Rs. ${product.unitPrice.toFixed(2)}</h6>
                        
                        <button class="btn ${btnClass} w-100 mt-auto fw-semibold rounded-pill" 
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
    // 4. SEARCH & FILTER LOGIC
    // ---------------------------------------------------------

    // The master function that applies both text search and category filters
    function applyShopFilters() {
        // 1. Safely grab the search text (fallback to empty string if undefined)
        let rawSearch = $('#inp-customer-search').val();
        let searchTerm = rawSearch ? rawSearch.toLowerCase().trim() : "";

        // 2. Filter the array
        let filteredProducts = allShopProducts.filter(product => {

            // Safely check the product name (in case the DB has a null name)
            let productName = product.name ? product.name.toLowerCase() : "";
            let matchesSearch = productName.includes(searchTerm);

            // Check category (Make sure to trim extra spaces!)
            let matchesCategory = (activeCategory === "All") || (product.category === activeCategory);

            // Item must pass BOTH tests
            return matchesSearch && matchesCategory;
        });

        // 3. Redraw the grid
        renderProductGrid(filteredProducts);
    }

    // Trigger filter when typing in the search bar
    $(document).on('input', '#inp-customer-search', applyShopFilters);

    // Trigger filter if they click the actual search icon button
    $(document).on('click', '#btn-customer-search', applyShopFilters);

    // Trigger filter when a user clicks a Category Pill
    $(document).on('click', '.filter-btn', function() {
        // Visually update the buttons
        $('.filter-btn').removeClass('btn-primary shadow-sm active').addClass('btn-outline-secondary bg-white');
        $(this).removeClass('btn-outline-secondary bg-white').addClass('btn-primary shadow-sm active');

        // Grab the text of the button they clicked
        activeCategory = $(this).text().trim();

        // Run the filter
        applyShopFilters();
    });

    // Trigger filter every time the user types a letter in the search bar!
    $(document).on('input', '#inp-customer-search', applyShopFilters);

    // Trigger filter when a user clicks a Category Pill
    $(document).on('click', '.filter-btn', function() {

        // 1. Visually update the buttons to show which one is active
        $('.filter-btn').removeClass('btn-primary shadow-sm active').addClass('btn-outline-secondary bg-white');
        $(this).removeClass('btn-outline-secondary bg-white').addClass('btn-primary shadow-sm active');

        // 2. Grab the text of the button they clicked (e.g., "Groceries")
        activeCategory = $(this).text().trim();

        // 3. Run the filter
        applyShopFilters();
    });

    // ---------------------------------------------------------
    // 5. ADD TO CART LOGIC
    // ---------------------------------------------------------
    $(document).on('click', '.btn-add-cart', function() {
        let id = $(this).data('id');
        let name = $(this).data('name');
        let price = $(this).data('price');
        let image = $(this).data('image');

        let cart = JSON.parse(localStorage.getItem('nexus_cart')) || [];
        let existingItem = cart.find(item => item.id === id);

        if (existingItem) {
            existingItem.qty += 1;
        } else {
            cart.push({ id: id, name: name, price: price, image: image, qty: 1 });
        }

        localStorage.setItem('nexus_cart', JSON.stringify(cart));

        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Added to Cart',
            text: name,
            showConfirmButton: false,
            timer: 1500
        });

        updateCartBadge();
    });

    // ---------------------------------------------------------
    // 6. UPDATE CART BADGE GLOBALLY
    // ---------------------------------------------------------
    window.updateCartBadge = function() {
        let cart = JSON.parse(localStorage.getItem('nexus_cart')) || [];
        let totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
        $('#cart-item-count').text(totalItems);

        $('#cart-item-count').addClass('animate__animated animate__heartBeat').on('animationend', function() {
            $(this).removeClass('animate__animated animate__heartBeat');
        });
    };
});