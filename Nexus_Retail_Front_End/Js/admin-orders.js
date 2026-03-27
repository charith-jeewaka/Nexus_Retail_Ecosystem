$(document).ready(function () {
    const orderApiUrl = "http://localhost:8080/api/v1/orders";
    let allOrdersList = []; // Master list to hold all orders for searching/filtering

    // 1. Listen for the Router to load the Admin Orders page
    $(document).on('adminPageLoaded', function (event, subPage) {
        if (subPage === 'admin-orders') { // Assuming your router calls this 'orders'
            loadAdminOrders();
        }
    });

    // ==========================================
    // 1. FETCH & DRAW ALL ORDERS
    // ==========================================
    window.loadAdminOrders = function () {
        let token = localStorage.getItem("nexus_token");

        if (!token) return;

        $.ajax({
            url: orderApiUrl,
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            },
            success: function (res) {
                if (res.code === 200) {
                    allOrdersList = res.data;
                    renderOrdersTable(allOrdersList);
                }
            },
            error: function (xhr) {
                $('#admin-orders-table-body').html(`
                    <tr><td colspan="6" class="text-center text-danger py-4">Failed to load orders.</td></tr>
                `);
            }
        });
    };

    function renderOrdersTable(orders) {
        let tbody = $('#admin-orders-table-body');
        tbody.empty();

        if (orders.length === 0) {
            tbody.html(`<tr><td colspan="6" class="text-center py-5 text-muted">No orders found.</td></tr>`);
            return;
        }

        orders.forEach(order => {
            // Format the date beautifully
            let dateObj = new Date(order.orderDate);
            let formattedDate = dateObj.toLocaleDateString() + " " + dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

            // Choose the badge color based on status
            let badgeClass = "bg-secondary";
            if (order.status === "PENDING") badgeClass = "bg-warning text-dark";
            if (order.status === "PROCESSING") badgeClass = "bg-info text-dark";
            if (order.status === "COMPLETED") badgeClass = "bg-success";
            if (order.status === "CANCELLED") badgeClass = "bg-danger";

            let row = `
                <tr class="table-row-hover align-middle border-bottom">
                    <td class="ps-4 fw-bold text-dark">#${order.orderId}</td>
                    <td class="fw-medium">${order.customerName}</td>
                    <td class="text-muted small">${formattedDate}</td>
                    <td class="fw-bold text-primary">Rs. ${order.totalAmount.toFixed(2)}</td>
                    <td><span class="badge ${badgeClass} px-2 py-1 rounded-1">${order.status}</span></td>
                    <td class="text-end pe-4">
                        <button class="btn btn-sm btn-light text-primary fw-medium border shadow-sm btn-view-order" 
                            data-id="${order.orderId}"
                            data-customer="${order.customerName}"
                            data-date="${formattedDate}"
                            data-total="${order.totalAmount}"
                            data-status="${order.status}">
                            Process <i class="bi bi-arrow-right ms-1"></i>
                        </button>
                    </td>
                </tr>
            `;
            tbody.append(row);
        });
    }

    // ==========================================
    // 2. SEARCH & FILTER LOGIC
    // ==========================================
    function applyOrderFilters() {
        let searchTerm = $('#inp-search-order').val().toLowerCase().trim();
        let statusFilter = $('#filter-order-status').val();

        let filteredOrders = allOrdersList.filter(order => {
            // Search by Order ID or Customer Name
            let matchesSearch = order.orderId.toString().includes(searchTerm) ||
                order.customerName.toLowerCase().includes(searchTerm);

            // Filter by Status
            let matchesStatus = (statusFilter === "ALL") || (order.status === statusFilter);

            return matchesSearch && matchesStatus;
        });

        renderOrdersTable(filteredOrders);
    }

    $(document).on('input', '#inp-search-order', applyOrderFilters);
    $(document).on('change', '#filter-order-status', applyOrderFilters);
    $(document).on('click', '#btn-refresh-orders', loadAdminOrders);

    // ==========================================
    // 3. OPEN THE MODAL & POPULATE DATA
    // ==========================================
    $(document).on('click', '.btn-view-order', function () {
        let orderId = $(this).data('id');
        let customerName = $(this).data('customer');
        let date = $(this).data('date');
        let total = $(this).data('total');
        let status = $(this).data('status');

        // Populate the Modal UI
        $('#modal-order-title').text(`Order #${orderId} Details`);
        $('#modal-customer-name').text(customerName);
        $('#modal-order-date').text(date);
        $('#modal-grand-total').text(`Rs. ${parseFloat(total).toFixed(2)}`);

        // Update the Status Badge inside the modal
        let badge = $('#modal-order-status-badge');
        badge.text(status).removeClass('bg-warning bg-info bg-success bg-danger text-dark text-white');
        if (status === "PENDING") badge.addClass('bg-warning text-dark');
        if (status === "PROCESSING") badge.addClass('bg-info text-dark');
        if (status === "COMPLETED") badge.addClass('bg-success text-white');
        if (status === "CANCELLED") badge.addClass('bg-danger text-white');

        // Set the hidden inputs for the form
        $('#edit-order-id').val(orderId);
        $('#edit-order-status').val(status);

        // Show the modal
        let modal = new bootstrap.Modal(document.getElementById('viewOrderModal'));
        modal.show();

        // --- FETCH THE ITEMS FOR THIS ORDER ---
        let tbody = $('#modal-order-items-body');
        let token = localStorage.getItem("nexus_token");

        // Show a quick loading spinner inside the table
        tbody.html('<tr><td colspan="3" class="text-center py-3 text-muted"><div class="spinner-border spinner-border-sm text-primary me-2"></div> Loading items...</td></tr>');

        $.ajax({
            url: `${orderApiUrl}/${orderId}/items`,
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            },
            success: function (res) {
                tbody.empty(); // Clear the loader

                if (res.code === 200 && res.data.length > 0) {
                    res.data.forEach(item => {
                        let row = `
                            <tr class="border-bottom">
                                <td class="ps-3 py-2 text-muted small">#${item.productId}</td>
                                <td class="py-2 text-dark fw-medium">${item.productName}</td>
                                <td class="py-2 text-center text-muted">x${item.quantity}</td>
                                <td class="py-2 text-end pe-3 text-secondary">Rs. ${item.subTotal.toFixed(2)}</td>
                            </tr>
                        `;
                        tbody.append(row);
                    });
                } else {
                    tbody.html('<tr><td colspan="3" class="text-center py-3 text-muted">No items found.</td></tr>');
                }
            },
            error: function () {
                tbody.html('<tr><td colspan="3" class="text-center py-3 text-danger">Failed to load items.</td></tr>');
            }
        });

        // Note: The specific items list inside the modal is currently blank. 
        // We will need to fetch the OrderDetails from the backend to populate it!
    });

    // ==========================================
    // 4. SUBMIT STATUS UPDATE
    // ==========================================
    $(document).on('submit', '#form-update-order-status', function (e) {
        e.preventDefault();

        let orderId = $('#edit-order-id').val();
        let newStatus = $('#edit-order-status').val();
        let token = localStorage.getItem("nexus_token");

        // UI Loading State
        let submitBtn = $('#btn-update-status');
        let originalText = submitBtn.html();
        submitBtn.html('<span class="spinner-border spinner-border-sm me-2"></span> Updating...').prop('disabled', true);

        $.ajax({
            url: `${orderApiUrl}/${orderId}/status?status=${newStatus}`,
            method: "PUT",
            headers: {
                "Authorization": "Bearer " + token
            },
            success: function (res) {
                // Hide modal and reset button
                $('#viewOrderModal').modal('hide');
                submitBtn.html(originalText).prop('disabled', false);

                // Show Success Toast
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'Status Updated!',
                    text: `Order #${orderId} is now ${newStatus}`,
                    showConfirmButton: false,
                    timer: 2000
                });

                // Refresh the table instantly!
                loadAdminOrders();
            },
            error: function (xhr) {
                submitBtn.html(originalText).prop('disabled', false);
                Swal.fire("Error", "Could not update status.", "error");
            }
        });
    });
});