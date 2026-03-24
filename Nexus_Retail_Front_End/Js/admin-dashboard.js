//admin-dashboard.js
const baseUrl = "http://localhost:8080/api/v1/products";


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
        }
    });

    function fetchDashboardStatus(){
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

                    let lowStockItems = allProducts.filter(product => product.unitsInStock < 10);

                    $('#dash-low-stock-count').text(lowStockItems.length + " Items");
                }
            },
            error: function(xhr) {
                $('#dash-active-products-count').text("Error");
                console.error("Failed to load product count for dashboard.");
            }
        })
    }
});