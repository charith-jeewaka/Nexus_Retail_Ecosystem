$(document).ready(function() {

    const productUrl = "http://localhost:8080/api/v1/products";
    const backendBaseUrl = "http://localhost:8080"; // Needed to view the images!

    // We store all products in a global array so we can search/filter them instantly
    let allProducts = [];

    // NEW: Listen for the exact moment the router finishes loading the HTML
    $(document).on('pageLoaded', function(event, pageName) {
        // Check if the page that just loaded is the inventory page
        if (pageName === 'inventory-page' || pageName === 'inventory-management') {
            loadInventory();
        }
    });

    // ---------------------------------------------------------
    // 1. FETCH ALL PRODUCTS FROM DATABASE
    // ---------------------------------------------------------
    function loadInventory() {
        const token = localStorage.getItem("nexus_token");

        $.ajax({
            url: productUrl,
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            },
            success: function(res) {
                if (res.code === 200) {
                    allProducts = res.data; // Save to our global array
                    renderTable(allProducts); // Draw the table
                }
            },
            error: function(xhr) {
                let tbody = $("#inventory-table-body");
                if (xhr.status === 403) {
                    tbody.html(`<tr><td colspan="6" class="text-center text-danger py-4">Unauthorized: You do not have permission to view inventory.</td></tr>`);
                } else {
                    tbody.html(`<tr><td colspan="6" class="text-center text-danger py-4">Failed to load inventory. server is not running</td></tr>`);
                }
            }
        });
    }

    // ---------------------------------------------------------
    // 2. DRAW THE TABLE (With Images & Badges)
    // ---------------------------------------------------------
    function renderTable(productsToDisplay) {
        let tbody = $("#inventory-table-body");
        tbody.empty();

        if (productsToDisplay.length === 0) {
            tbody.html(`<tr><td colspan="6" class="text-center text-muted py-4">No products found.</td></tr>`);
            return;
        }

        productsToDisplay.forEach(product => {

            // Handle the image: If it has one, attach the backend URL. If not, use the offline SVG placeholder!
            let imageSrc = product.imageUrl
                ? backendBaseUrl + product.imageUrl
                : "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22300%22%20height%3D%22300%22%20viewBox%3D%220%200%20300%20300%22%3E%3Crect%20fill%3D%22%23e9ecef%22%20width%3D%22300%22%20height%3D%22300%22%2F%3E%3Ctext%20fill%3D%22%236c757d%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20dy%3D%2210.5%22%20font-weight%3D%22bold%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fsvg%3E";

            // Determine stock badge color (Red if low, Green if good)
            let stockClass = product.unitsInStock < 10 ? 'bg-danger-subtle text-danger border-danger-subtle' : 'bg-success-subtle text-success border-success-subtle';

            let row = `
                <tr>
                    <td class="ps-4">
                        <img src="${imageSrc}" class="product-thumbnail shadow-sm" alt="Product">
                    </td>
                    <td>
                        <div class="fw-bold text-dark">${product.name}</div>
                        <div class="text-muted" style="font-size: 0.75rem;">ID: P-${product.id}</div>
                    </td>
                    <td><span class="badge bg-light text-secondary border">${product.category}</span></td>
                    <td class="fw-semibold">Rs. ${product.unitPrice.toFixed(2)}</td>
                    <td><span class="badge ${stockClass} border">${product.unitsInStock} units</span></td>
                    <td class="text-end pe-4">
                        <button class="btn btn-sm btn-outline-primary me-1 btn-edit" data-id="${product.id}">
                            <i class="bi bi-pencil-square"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger btn-delete" data-id="${product.id}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            tbody.append(row);
        });
    }

    // ---------------------------------------------------------
    // 3. THE SEARCH & FILTER LOGIC
    // ---------------------------------------------------------
    function applyFilters() {
        let searchTerm = $('#inp-search-product').val().toLowerCase();
        let categoryFilter = $('#filter-category').val();

        // Filter our global array in memory!
        let filteredProducts = allProducts.filter(product => {
            let matchesSearch = product.name.toLowerCase().includes(searchTerm);
            let matchesCategory = (categoryFilter === "ALL") || (product.category === categoryFilter);

            return matchesSearch && matchesCategory;
        });

        // Redraw the table with only the matching products
        renderTable(filteredProducts);
    }

    // Trigger the filter when the user types or changes the dropdown
    $(document).on('input', '#inp-search-product', applyFilters);
    $(document).on('change', '#filter-category', applyFilters);

    // Refresh Button Logic
    $(document).on('click', '#btn-refresh-inventory', function() {
        $('#inp-search-product').val('');
        $('#filter-category').val('ALL');
        $('#inventory-table-body').html(`<tr><td colspan="6" class="text-center py-4"><div class="spinner-border spinner-border-sm text-primary"></div> Refreshing...</td></tr>`);
        loadInventory();
    });


    // ---------------------------------------------------------
    // 4. DELETE PRODUCT LOGIC
    // ---------------------------------------------------------
    $(document).on('click', '.btn-delete', function() {

        // 1. Grab the ID immediately before entering the SweetAlert promise!
        let productId = $(this).data('id');

        Swal.fire({
            title: "Are you sure?",
            text: `You are about to delete Product #${productId}. This cannot be undone!`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33", // Swapped colors: Red for Delete
            cancelButtonColor: "#3085d6", // Blue for Cancel
            confirmButtonText: "Yes, delete it!"
        }).then((result) => {

            if (result.isConfirmed) {
                $.ajax({
                    url: productUrl + "/" + productId,
                    method: "DELETE",
                    headers: {
                        "Authorization": "Bearer " + localStorage.getItem("nexus_token")
                    },
                    success: function(res) {
                        Swal.fire({
                            title: "Deleted!",
                            text: `Product #${productId} has been removed.`,
                            icon: "success",
                            timer: 2000,
                            showConfirmButton: false
                        });

                        $('#btn-refresh-inventory').click();
                    },
                    error: function(xhr) {
                        if (xhr.status === 403) {
                            Swal.fire({
                                icon: "error",
                                title: "Unauthorized",
                                text: "Only Admins can delete products."
                            });
                        } else if (xhr.status === 404) {
                            Swal.fire({
                                icon: "error",
                                title: "Error",
                                text: "This product no longer exists in the database."
                            });
                        } else {
                            Swal.fire({
                                icon: "error",
                                title: "Error",
                                text: "Failed to delete product."
                            });
                        }
                    }
                });
            }
        });
    });

    // ---------------------------------------------------------
    // 5. OPEN EDIT MODAL LOGIC
    // ---------------------------------------------------------
    $(document).on('click', '.btn-edit', function() {
        let productId = $(this).data('id');

        // Find the exact product in our global memory array
        let productToEdit = allProducts.find(p => p.id === productId);

        if (productToEdit) {
            // Populate the modal fields with the existing data
            $('#edit-product-id').val(productToEdit.id);
            $('#edit-product-image-url').val(productToEdit.imageUrl); // Preserve the image!
            $('#edit-product-name').val(productToEdit.name);
            $('#edit-product-category').val(productToEdit.category);
            $('#edit-product-price').val(productToEdit.unitPrice);
            $('#edit-product-stock').val(productToEdit.unitsInStock);

            // Tell Bootstrap to show the modal
            $('#editProductModal').modal('show');
        }
    });

    // ---------------------------------------------------------
    // 6. SAVE EDITED PRODUCT (PUT REQUEST)
    // ---------------------------------------------------------
    $(document).on('submit', '#form-edit-product', function(e) {
        e.preventDefault(); // Stop the form from refreshing the page

        let productId = $('#edit-product-id').val();
        $('#btn-update-submit').prop('disabled', true).text('Updating...');

        // Build the updated JSON object
        const updatedData = {
            name: $('#edit-product-name').val(),
            category: $('#edit-product-category').val(),
            unitPrice: parseFloat($('#edit-product-price').val()),
            unitsInStock: parseInt($('#edit-product-stock').val()),
            imageUrl: $('#edit-product-image-url').val() // Send the old string back
        };

        $.ajax({
            url: productUrl + "/" + productId,
            method: "PUT",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("nexus_token"),
                "Content-Type": "application/json"
            },
            data: JSON.stringify(updatedData),
            success: function(res) {
                // Hide the modal, reset the button, and refresh the table
                $('#editProductModal').modal('hide');
                $('#btn-update-submit').prop('disabled', false).text('Update Product');
                $('#btn-refresh-inventory').click();
            },
            error: function(xhr) {
                alert("Failed to update product.");
                $('#btn-update-submit').prop('disabled', false).text('Update Product');
            }
        });
    });



});