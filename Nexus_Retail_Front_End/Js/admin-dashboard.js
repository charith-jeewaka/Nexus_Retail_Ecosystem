const baseUrl = "http://localhost:8080/api/v1/products";


$(document).ready(function(){

    $(document).on('pageLoaded', function(event,pageName){
        if (pageName === 'admin-dashboard') {
            console.log(pageName);
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
                    let totalProducts = res.data.length;

                    $('#dash-active-products-count').text(totalProducts);
                }
            },
            error: function(xhr) {
                $('#dash-active-products-count').text("Error");
                console.error("Failed to load product count for dashboard.");
            }

        })
    }

});