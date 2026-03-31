$(document).ready(function () {
    const orderUrl = "http://localhost:8080/api/v1/orders";
    const backendBaseUrl = "http://localhost:8080";

    $(document).on('customerPageLoaded', function (event, subPage) {
        if (subPage === 'orders') {
            loadCustomerOrders();
        }
    });

    window.loadCustomerOrders = function () {
        const token = localStorage.getItem("nexus_token");
        const userId = localStorage.getItem("nexus_user_id");

        if (!userId || !token) return;

        $.ajax({
            url: `${orderUrl}/customer/${userId}`,
            method: "GET",
            headers: { "Authorization": "Bearer " + token },
            success: function (res) {
                if (res.code === 200) renderCustomerOrders(res.data);
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
                            data-id="${order.orderId}" data-date="${date}"
                            data-status="${order.status}" data-total="${order.totalAmount}">
                            Details <i class="bi bi-chevron-right ms-1"></i>
                        </button>
                    </td>
                </tr>`;
            tbody.append(row);
        });
    }

    function getStatusBadge(status) {
        const colors = { 'PENDING': 'bg-warning text-dark', 'PROCESSING': 'bg-info text-dark', 'COMPLETED': 'bg-success text-white', 'CANCELLED': 'bg-danger text-white' };
        return `<span class="badge ${colors[status] || 'bg-secondary'} rounded-pill px-2">${status}</span>`;
    }

    $(document).on('click', '.btn-view-cust-order', function() {
        const orderId = $(this).data('id');
        const date = $(this).data('date');
        const status = $(this).data('status');
        const total = $(this).data('total');
        const token = localStorage.getItem("nexus_token");

        $('#order-details-placeholder').addClass('d-none');
        $('#order-details-card').removeClass('d-none');
        $('#detail-id').text(`#${orderId}`);
        $('#detail-date').text(date);
        $('#detail-total').text(`Rs. ${parseFloat(total).toFixed(2)}`);
        $('#detail-status-badge').html(getStatusBadge(status));

        let itemsList = $('#detail-items-list');
        itemsList.html('<div class="text-center py-4"><div class="spinner-border spinner-border-sm text-primary"></div></div>');

        $.ajax({
            url: `${orderUrl}/${orderId}/items`,
            method: "GET",
            headers: { "Authorization": "Bearer " + token },
            success: function (res) {
                itemsList.empty();
                res.data.forEach(item => {
                    // FIX: If path is "/uploads/rice.jfif", we don't add another "/uploads/"
                    let finalImagePath = item.productImage.startsWith('/uploads/')
                        ? item.productImage
                        : '/uploads/' + item.productImage;

                    const imageUrl = backendBaseUrl + finalImagePath;

                    let itemRow = `
                        <div class="d-flex justify-content-between align-items-center border-bottom py-3">
                            <div class="d-flex align-items-center">
                                <img src="${imageUrl}" class="rounded shadow-sm border me-3" 
                                     style="width: 50px; height: 50px; object-fit: cover;"
                                     onerror="this.src='https://via.placeholder.com/50?text=No+Image'">
                                <div>
                                    <p class="mb-0 fw-bold text-dark">${item.productName}</p>
                                    <small class="text-muted">${item.quantity} x Rs. ${item.unitPrice.toFixed(2)}</small>
                                </div>
                            </div>
                            <span class="fw-medium text-dark">Rs. ${item.subTotal.toFixed(2)}</span>
                        </div>`;
                    itemsList.append(itemRow);
                });
            },
            error: function() {
                itemsList.html('<p class="text-danger small text-center py-3">Failed to load items.</p>');
            }
        });
    });
});