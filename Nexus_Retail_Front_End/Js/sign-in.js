const baseUrl = "http://localhost:8080/api/v1/auth/authenticate"; // Changed https to http

$(document).ready(function(){

    $("#btn-sign-in").on("click", function(){
        let name = $("#inp-signin-username").val();
        let password = $("#inp-signin-password").val();

        $.ajax({
            url: baseUrl,
            method: "POST",
            contentType: "application/json", // Corrected this line
            data: JSON.stringify({
                username: name,
                password: password
            }),
            success: function(res){
                // Check if our APIResponse returned a 200 OK success code
                if(res.code === 200){

                    // THE MOST IMPORTANT LINE: Save the token to the browser!
                    localStorage.setItem("nexus_token", res.data.token);
                    localStorage.setItem("nexus_role",res.data.role);

                    alert("Login successful!"+ res.data.role);

                    // 2. The Traffic Cop: Redirect based on the role
                    if (res.data.role === "ADMIN") {
                        window.location.href = "../pages/admin-dashboard.html";
                    }
                    else if (res.data.role === "CASHIER") {
                        window.location.href = "../pages/cashier-dashboard.html";
                    }
                    else {
                        // Default fallback for CUSTOMER
                        window.location.href = "../pages/customer-dashboard.html";
                    }
                } else {
                    alert("Unexpected response: " + res.message);
                }
            },
            error: function(xhr){
                // The "long version" error handler!
                if (xhr.responseJSON) {

                    // 1. Check if it's a 400 Bad Request (Validation Errors)
                    if (xhr.status === 400 && xhr.responseJSON.data) {
                        let errorMsg = "Please fix the following errors:\n\n";
                        for (let field in xhr.responseJSON.data) {
                            errorMsg += "• " + xhr.responseJSON.data[field] + "\n";
                        }
                        alert(errorMsg);
                    }
                    // 2. Handle standard errors (e.g., "Invalid username or password" from 401)
                    else {
                        alert("Login failed: " + xhr.responseJSON.message);
                    }
                } else {
                    alert("Server error. Could not connect to backend.");
                }
            }
        });
    });
});