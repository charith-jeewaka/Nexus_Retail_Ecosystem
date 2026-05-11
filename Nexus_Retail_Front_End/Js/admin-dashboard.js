//admin-dashboard.js
const baseUrl = "http://localhost:8080/api/v1/products";
const token = localStorage.getItem("nexus_token");



$(document).ready(function(){

    // 1. When the Main Admin Shell loads, tell the sub-router to instantly load the Overview!
    $(document).on('pageLoaded', function(event, pageName) {
        if (pageName === 'admin-dashboard') {
            window.navigateAdmin('admin-overview');
        }
    });

    //  Listen for the Sub-Router. Once the overview HTML is physically on the screen, fetch the stats!
    $(document).on('adminPageLoaded', function(event, subPage) {
        if (subPage === 'admin-overview') {
            fetchDashboardStatus();
            fetchTopReviews();
        }
    });

    function fetchDashboardStatus(){
        $('#display-admin-name').text(localStorage.getItem("nexus_user_name"));
        $.ajax({
            url: baseUrl,
            method: "GET",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("nexus_token")
            },
            success: function(res) {
                if (res.code === 200) {
                    let allProducts = res.data;
                    $('#dash-active-products-count').text(allProducts.length);

                    // LOGIC FIX: Filter correctly for the doughnut slices
                    let outCount = allProducts.filter(p => p.unitsInStock === 0).length;
                    let lowCount = allProducts.filter(p => p.unitsInStock > 0 && p.unitsInStock < 10).length;
                    let healthyCount = allProducts.length - (outCount + lowCount);

                    $('#dash-low-stock-count').text((outCount + lowCount) + " Items");

                    // Send counts, not arrays
                    drawStockChart(healthyCount, lowCount, outCount);
                }
            }
        });
        getAllOrders();
    }

    function getAllOrders(){
        $.ajax({
            url: "http://localhost:8080/api/v1/orders",
            method: "GET",
            headers: { "Authorization": "Bearer " + localStorage.getItem("nexus_token") },
            success: function(res) {
                let allOrders = res.data;
                let pending = allOrders.filter(o => o.status === "PENDING").length;
                let completed = allOrders.filter(o => o.status === "COMPLETED").length;
                let cancelled = allOrders.filter(o => o.status === "CANCELLED").length;
                let processing = allOrders.filter(o => o.status === "PROCESSING").length;

                $('#dash-pending-orders').text(pending + " Out of " + allOrders.length);

                // Revenue Logic (Already correct in your snippet)
                const today = new Date().toISOString().split('T')[0];
                let todaysOrders = allOrders.filter(order => order.orderDate.split('T')[0] === today && order.status !== "CANCELLED");
                let dailyRevenue = todaysOrders.reduce((sum, order) => sum + order.totalAmount, 0);
                $('#dash-today-revenue').text("Rs. " + dailyRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 }));

                // Update Revenue Line Chart
                const weeklyData = getWeeklyRevenueData(allOrders);
                updateRevenueChart(weeklyData);

                // NEW: Update Order Doughnut Chart
                drawOrderChart(pending, processing,completed, cancelled );
            }
        });
    }

    // 1. Revenue Line Chart

    function getWeeklyRevenueData(allOrders) {

        const revenueMap = { 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0 };
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        // Get the start of the current week (Monday)
        const now = new Date();
        const currentMonday = new Date(now);
        currentMonday.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1));
        currentMonday.setHours(0, 0, 0, 0);

        allOrders.forEach(order => {
            const orderDate = new Date(order.orderDate);
            if (orderDate >= currentMonday && order.status !== "CANCELLED") {
                const dayName = days[orderDate.getDay()];
                if (revenueMap.hasOwnProperty(dayName)) {
                    revenueMap[dayName] += order.totalAmount;
                }
            }
        });

        return Object.values(revenueMap); // Returns [MonVal, TueVal, WedVal, ...]
    }

    let revenueChart = null; // Global variable to store the chart instance

    function updateRevenueChart(dataPoints) {
        const canvas = document.getElementById('revenueChart');

        // Safety check: if the canvas doesn't exist on the current page, exit
        if (!canvas) return;

        const ctxRevenue = canvas.getContext('2d');

        // IMPORTANT: Always destroy the old instance if navigating back to this page
        if (revenueChart) {
            revenueChart.destroy();
        }

        // Always create a NEW chart instance for the NEW canvas element
        revenueChart = new Chart(ctxRevenue, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Revenue (Rs)',
                    data: dataPoints,
                    borderColor: '#0d6efd',
                    backgroundColor: 'rgba(13, 110, 253, 0.05)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 750 // Optional: adds a nice entry animation on navigation
                }
            }
        });
    }

    function drawStockChart(healthy, low, out) {
        const ctx = document.getElementById('stockDoughnut').getContext('2d');

        // Destroy existing chart instance if it exists to prevent overlap on reload
        if (window.stockChartInstance) window.stockChartInstance.destroy();

        window.stockChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Healthy', 'Low', 'Out'],
                datasets: [{
                    data: [healthy, low, out],
                    backgroundColor: [
                        '#1cc88a', // Success Green
                        '#f6c23e', // Warning Yellow
                        '#e74a3b'  // Danger Red
                    ],
                    hoverBackgroundColor: ['#17a673', '#dda20a', '#be2617'],
                    borderWidth: 0,
                    borderRadius: 10, // THIS MAKES EDGES ROUNDED
                    spacing: 5,       // THIS CREATES GAPS BETWEEN SLICES
                    cutout: '75%'     // THIS MAKES THE RING THINNER
                }]
            },
            options: {
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#fff',
                        titleColor: '#5a5c69',
                        bodyColor: '#5a5c69',
                        borderColor: '#dddfeb',
                        borderWidth: 1,
                        displayColors: true
                    }
                },
                maintainAspectRatio: false,
            }
        });
    }

    function drawOrderChart(pending,processing, done, cancelled) {
        const ctx = document.getElementById('orderDoughnut').getContext('2d');

        if (window.orderChartInstance) window.orderChartInstance.destroy();

        window.orderChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Pending', 'Processing','Completed', 'Cancelled'],
                datasets: [{
                    data: [pending,processing, done, cancelled],
                    backgroundColor: ['#f6c23e','#36b9cc', '#1cc88a', '#858796'],
                    borderWidth: 0,
                    borderRadius: 10,
                    spacing: 5,
                    cutout: '75%'
                }]
            },
            options: {
                plugins: { legend: { display: false } },
                maintainAspectRatio: false
            }
        });
    }

    let topReviews = [];
    let currentIndex = 0;
    function fetchTopReviews(){
        $.ajax({
            url: "http://localhost:8080/api/v1/reviews/top-rated",
            type: "GET",
            headers: {
                "Authorization": "Bearer " + token
            },
            success: function(response){
                topReviews = response.data;

                if (topReviews && topReviews.length > 0){
                    displayReview(topReviews[0]);

                    //automatically swap
                    startReviewSlider();
                }
            },
            error: function(error){
                console.error(error);
            }
        });
    }

    function displayReview(review) {
        const initial = review.customerName.charAt(0).toUpperCase();

        // Generate stars based on the rating
        let stars = "";
        for (let i = 0; i < review.rating; i++) {
            stars += '<i class="fas fa-star text-warning" style="font-size: 0.8rem;"></i>';
        }

        const reviewHtml = `
        <div class="p-1 w-100 d-flex align-items-center" style="height: 100%;border-radius: 5px; box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px;">
            <!-- Image Section -->
            <div style="width: 25%; height: 120px; border-radius: 5px; overflow: hidden; border: 1px solid #ddd;">
                <img src="${review.imageUrl}" alt="Product" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <!-- Text Section -->
            <div style="width: 75%; padding-left: 15px;">
                <div class="d-flex align-items-center mb-1">
                    <div class="bg-primary text-white rounded-circle d-flex justify-content-center align-items-center me-2 fw-bold" 
                         style="width: 30px; height: 30px; font-size: 0.75rem;">
                        ${initial}
                    </div>
                    <h6 class="mb-0 fw-bold" style="font-size: 0.9rem;">${review.customerName}</h6>
                </div>
                <div class="mb-1">${stars}</div>
                <p class="text-secondary mb-0" style="font-size: 0.85rem; line-height: 1.3; font-style: italic;">
                    "${review.comment}"
                </p>
            </div>
        </div>`;

        // Target the inner container inside sub-container-2
        $('#sub-container-2 .review-card-wrapper').html(reviewHtml);
    }
    function startReviewSlider() {
        // Clear any existing intervals to prevent memory leaks
        if (window.reviewInterval) clearInterval(window.reviewInterval);

        window.reviewInterval = setInterval(() => {
            currentIndex = (currentIndex + 1) % topReviews.length;

            // Add a smooth fade transition
            $('#sub-container-2 .review-card-wrapper').fadeOut(400, function() {
                displayReview(topReviews[currentIndex]);
                $(this).fadeIn(400);
            });
        }, 5000); // 5 seconds
    }
});