$(document).ready(function() {

    // MAIN ROUTER (Swaps entire pages)
    window.navigateTo = function(page) {
        $('#app-content').load(`pages/${page}.html`, function(response, status, xhr) {
            if (status === "error") {
                console.error("Failed to load: " + page);
                $('#app-content').html("<h3 class='text-center mt-5 text-danger'>Page not found!</h3>");
            } else {
                // Announce to the whole app that a new page just loaded!
                $(document).trigger('pageLoaded', [page]);
            }
        });
    };

    // CUSTOMER SUB-ROUTER (Swaps content UNDER customer navbar)
    window.navigateCustomer = function(subPage) {
        // Notice the path looks inside the 'customer' folder!
        $('#customer-main-content').load(`pages/customer/customer-${subPage}.html`, function(response, status, xhr) {
            if (status === "error") {
                $('#customer-main-content').html("<h3 class='text-center mt-5 text-danger'>Content not found!</h3>");
            } else {
                $(document).trigger('customerPageLoaded', [subPage]);
            }
        });
    };

    // ADMIN SUB-ROUTER (Swaps content UNDER admin sidebar)
    window.navigateAdmin = function(subPage) {
        $('#admin-main-content').load(`pages/${subPage}.html`, function(response, status, xhr) {
            if (status === "error") {
                $('#admin-main-content').html("<h3 class='text-center mt-5 text-danger'>Admin content not found!</h3>");
            } else {
                $(document).trigger('adminPageLoaded', [subPage]);
            }
        });
    };

    // AUTHENTICATION & SECURITY GUARD
    window.checkAuthAndRoute = function() {
        const token = localStorage.getItem("nexus_token");
        const role = localStorage.getItem("nexus_role");

        if (!token) {
            // No token? Kick them to the login screen.
            window.navigateTo('sign-in');
        } else {
            // Send them to their specific shell based on their role
            if (role === 'ADMIN') {
                window.navigateTo('admin-dashboard');
            } else if (role === 'CASHIER') {
                window.navigateTo('cashier-dashboard');
            } else {
                window.navigateTo('customer-dashboard');
            }
        }
    };

    // GLOBAL LOGOUT LISTENER (Upgraded to SweetAlert)
    $(document).on('click', '.btn-logout-modern', function(e) {
        e.preventDefault(); // Stop any default button behaviors

        Swal.fire({
            title: 'Ready to leave?',
            text: "Are you sure you want to log out of your session?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33', // Red for logout
            cancelButtonColor: '#6c757d', // Gray for cancel
            confirmButtonText: 'Yes, log out!'
        }).then((result) => {
            if (result.isConfirmed) {
                // Wipe the security clearance from memory
                localStorage.removeItem("nexus_token");
                localStorage.removeItem("nexus_role");

                // Trigger the auth guard, which will instantly kick them to sign-in
                window.checkAuthAndRoute();
            }
        });
    });

    // START THE APP
    // Run the security check the exact moment the SPA boots up
    window.checkAuthAndRoute();
});