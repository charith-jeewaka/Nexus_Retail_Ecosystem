$(document).ready(function() {

    // 1. Navigation Function (Loads HTML partials)
    window.navigateTo = function(page) {
        $('#app-content').load(`pages/${page}.html`, function(response, status, xhr) {
            if (status === "error") {
                console.error("Failed to load: " + page);
                $('#app-content').html("<h3 class='text-center mt-5 text-danger'>Page not found!</h3>");
            }
        });
    };

    // 2. Authentication Checker & Router
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