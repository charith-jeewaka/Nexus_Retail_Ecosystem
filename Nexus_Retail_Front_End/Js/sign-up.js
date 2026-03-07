const registerUrl = "http://localhost:8080/api/v1/auth/register";

$(document).ready(function(){
    $(document).on("click", "#btn-sign-up", function(){
        let name = $("#inp-signup-username").val();
        let email = $("#inp-signup-email").val();
        let password = $("#inp-signup-password").val();

        $.ajax({
            url: registerUrl,
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                username: name,
                email: email,
                password: password
            }),
            success: function(res){
                if(res.code === 201 || res.code === 200){
                    alert("Account created successfully!");
                    // Route back to sign in
                    window.navigateTo('sign-in');
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
                        alert("Error: " + xhr.responseJSON.message);
                    }
                } else {
                    alert("Server error. Could not connect to backend.");
                }
            }
        });
    });
});