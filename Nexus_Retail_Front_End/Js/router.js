$(document).ready(function() {

    // 1. Navigation Function (Loads HTML partials)
    window.navigateTo = function(page) {
        $('#app-content').load(`pages/${page}.html`, function(response, status, xhr) {
            if (status === "error") {
                console.error("Failed to load: " + page);
                $('#app-content').html("<h3 class='text-center mt-5 text-danger'>Page not found!</h3>");
            } else {
                // NEW: Announce to the whole app that a new page just loaded!
                $(document).trigger('pageLoaded', [page]);
            }
        });
    };

    // 2. Customer Sub-Router (Swaps content UNDER the customer navbar)
    window.navigateCustomer = function(subPage) {

        // Notice we are targeting #customer-main-content, NOT #app-content!
        $('#customer-main-content').load(`pages/customer-${subPage}.html`, function(response, status, xhr) {
            if (status === "error") {
                $('#customer-main-content').html("<h3 class='text-center mt-5 text-danger'>Content not found!</h3>");
            } else {
                // Announce that a sub-page loaded so our JS can run!
                $(document).trigger('customerPageLoaded', [subPage]);
            }
        });
    };

    // 2. authorization
    window.checkAuthAndRoute = function() {
        const token = localStorage.getItem("nexus_token");
        const role = localStorage.getItem("nexus_role");

        if (!token) {
            window.navigateTo('sign-in');
        } else {
            if (role === 'ADMIN') {
                window.navigateTo('admin-dashboard');
            } else if (role === 'CASHIER') {
                window.navigateTo('cashier-dashboard');
            } else {
                window.navigateTo('customer-dashboard');
            }
        }
    };

    // 3. Global Logout Listener (Using event delegation)
    $(document).on('click', '.btn-logout', function() {
        if(confirm("Are you sure you want to log out?")) {
            localStorage.removeItem("nexus_token");
            localStorage.removeItem("nexus_role");
            window.checkAuthAndRoute();
        }
    });

    // START THE APP: Run the check on initial load
    window.checkAuthAndRoute();
});