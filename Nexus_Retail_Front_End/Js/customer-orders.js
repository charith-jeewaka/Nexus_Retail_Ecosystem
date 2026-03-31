$(document).ready(function () {
    const orderUrl = "http://localhost:8080/api/v1/orders";

    $(document).on('customerPageLoaded', function (event, subPage) {
        if (subPage === 'orders') {
            loadCustomerOrders();
        }
    });

    window.loadCustomerOrders = function () {
        const token = localStorage.getItem("nexus_token");
        const userId = localStorage.getItem("nexus_user_id");

        if (!userId || !token) {
            console.error("Missing UserID or Token");
            return;
        }

        $.ajax({
            url: `${orderUrl}/customer/${userId}`,
            method: "GET",
            headers: { "Authorization": "Bearer " + token },
            success: function (res) {
                if (res.code === 200) {
                    renderCustomerOrders(res.data);
                }
            },
            error: function (xhr) {
                $('#customer-orders-table-body').html(`<tr><td colspan="5" class="text-center text-danger">Failed to load orders.</td></tr>`);
            }
        });
    };

    function renderCustomerOrders(orders) {
        let tbody = $('#customer-orders-table-body');
        tbody.empty();

        if (orders.length === 0) {
            tbody.html(`<tr><td colspan="5" class="text-center py-4 text-muted">No orders found.</td></tr>`);
            return;
        }

        orders.forEach(order => {
            let date = new Date(order.orderDate).toLocaleDateString();
            let statusBadge = getStatusBadge(order.status);

            let row = `
                <tr>
                    <td class="ps-4 fw-bold">#${order.orderId}</td>
                    <td class="text-muted small">${date}</td>
                    <td class="fw-bold text-dark">Rs. ${order.totalAmount.toFixed(2)}</td>
                    <td>${statusBadge}</td>
                    <td class="text-end pe-4">
                        <button class="btn btn-sm btn-outline-primary btn-view-cust-order" 
                            data-id="${order.orderId}"
                            data-date="${date}"
                            data-status="${order.status}"
                            data-total="${order.totalAmount}">
                            Details <i class="bi bi-chevron-right ms-1"></i>
                        </button>
                    </td>
                </tr>`;
            tbody.append(row);
        });
    }

    function getStatusBadge(status) {
        const colors = {
            'PENDING': 'bg-warning text-dark',
            'PROCESSING': 'bg-info text-dark',
            'COMPLETED': 'bg-success',
            'CANCELLED': 'bg-danger'
        };
        return `<span class="badge ${colors[status] || 'bg-secondary'} rounded-pill px-2">${status}</span>`;
    }

    // --- SIDE PANEL LOGIC (NEW) ---
    $(document).on('click', '.btn-view-cust-order', function() {
        const orderId = $(this).data('id');
        const date = $(this).data('date');
        const status = $(this).data('status');
        const total = $(this).data('total');
        const token = localStorage.getItem("nexus_token");

        // UI Prep: Hide placeholder, show card
        $('#order-details-placeholder').addClass('d-none');
        $('#order-details-card').removeClass('d-none');

        // Populate header details
        $('#detail-id').text(`#${orderId}`);
        $('#detail-date').text(date);
        $('#detail-total').text(`Rs. ${parseFloat(total).toFixed(2)}`);

        // Populate status badge in panel
        $('#detail-status-badge').html(getStatusBadge(status));

        // Clear and show loading for items
        let itemsList = $('#detail-items-list');
        itemsList.html('<div class="text-center py-4"><div class="spinner-border spinner-border-sm text-primary"></div></div>');

        // Fetch Specific Items
        $.ajax({
            url: `${orderUrl}/${orderId}/items`,
            method: "GET",
            headers: { "Authorization": "Bearer " + token },
            success: function (res) {
                itemsList.empty();
                if (res.code === 200 && res.data.length > 0) {
                    res.data.forEach(item => {
                        let itemRow = `
                            <div class="d-flex justify-content-between align-items-center border-bottom py-2">
                                <div>
                                    <p class="mb-0 fw-bold text-dark">${item.productName}</p>
                                    <small class="text-muted">${item.quantity} x Rs. ${item.unitPrice.toFixed(2)}</small>
                                </div>
                                <span class="fw-medium text-dark">Rs. ${item.subTotal.toFixed(2)}</span>
                            </div>`;
                        itemsList.append(itemRow);
                    });
                }
            },
            error: function() {
                itemsList.html('<p class="text-danger small">Failed to load items.</p>');
            }
        });
    });
});