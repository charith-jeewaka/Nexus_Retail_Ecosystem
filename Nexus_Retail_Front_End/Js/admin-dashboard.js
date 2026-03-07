$(document).ready(function(){

    // // --- THE BOUNCER: Check if the user is actually logged in ---
    // const token = localStorage.getItem("nexus_token");
    //
    // // If there is no token, kick them out immediately before they see anything!
    // if (!token) {
    //     alert("Unauthorized Access. Please log in.");
    //     window.location.href = "../pages/signin.html";
    //     return; // Stop running any other JavaScript on this page
    // }

    //logout function
    $("#btn-admin-logout").on("click", function(){
        if (confirm("Are you sure you want to logout?")) {

            localStorage.removeItem("nexus_token");
            localStorage.removeItem("nexus_role");

            window.location.href="../pages/sign-in.html"
        }
    });

});