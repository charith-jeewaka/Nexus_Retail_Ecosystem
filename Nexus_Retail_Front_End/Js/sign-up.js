const baseUrl = "http://localhost:8080/api/v1/auth/register";

$(document).ready(function(){

    $("#btn-sign-up").on("click", function(){
        let name = $("#inp-signup-username").val();
        let email = $("#inp-signup-email").val();
        let password = $("#inp-signup-password").val();

        $.ajax({
            url: baseUrl,
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                username: name,
                email: email,
                password: password
                // Note: I removed 'role: null' because the backend DTO doesn't expect it anyway
            }),
            success: function(res){
                // We check for 201 (Created) based on your Spring Boot Controller!
                if(res.code === 201 || res.code === 200){
                    alert("Account created successfully!");
                    window.location.href = "../pages/sign-in.html"; // Ensure this path matches your folder structure
                } else {
                    alert("Unexpected response: " + res.message);
                }
            },
            error: function(xhr){
                // Check if the backend sent our custom APIResponse JSON
                if (xhr.responseJSON) {

                    // 1. Check if it's a 400 Bad Request (Validation Errors)
                    if (xhr.status === 400 && xhr.responseJSON.data) {
                        let errorMsg = "Please fix the following errors:\n\n";
                        // Loop through the validation errors map
                        for (let field in xhr.responseJSON.data) {
                            errorMsg += "• " + xhr.responseJSON.data[field] + "\n";
                        }
                        alert(errorMsg);
                    }
                    // 2. Handle standard errors (e.g., Duplicate Username 409)
                    else {
                        alert("Error: " + xhr.responseJSON.message);
                    }
                } else {
                    alert("Server error. Could not connect to backend.");
                }
            }
        });
    });
});