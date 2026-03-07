const loginUrl = "http://localhost:8080/api/v1/auth/authenticate";

$(document).ready(function(){
    // Use Event Delegation for dynamically loaded SPA content
    $(document).on("click", "#btn-sign-in", function(){
        let name = $("#inp-signin-username").val();
        let password = $("#inp-signin-password").val();

        $.ajax({
            url: loginUrl,
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                username: name,
                password: password
            }),
            success: function(res){
                if(res.code === 200){
                    localStorage.setItem("nexus_token", res.data.token);
                    localStorage.setItem("nexus_role", res.data.role);

                    // Trigger the SPA Router
                    window.checkAuthAndRoute();
                } else {
                    alert("Unexpected response: " + res.message);
                }
            },
            error: function(xhr){
                if (xhr.responseJSON) {
                    if (xhr.status === 400 && xhr.responseJSON.data) {
                        let errorMsg = "Please fix the following errors:\n\n";
                        for (let field in xhr.responseJSON.data) {
                            errorMsg += "• " + xhr.responseJSON.data[field] + "\n";
                        }
                        alert(errorMsg);
                    } else {
                        alert("Login failed: " + xhr.responseJSON.message);
                    }
                } else {
                    alert("Server error. Could not connect to backend.");
                }
            }
        });
    });
});