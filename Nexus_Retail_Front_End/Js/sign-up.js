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
                    Swal.fire({
                        title: "Account successfully created!",
                        icon: "success",
                        draggable: true,
                        timer: 2000,
                    });                    // Route back to sign in
                    window.navigateTo('sign-in');
                } else {
                    alert("Unexpected response: " + res.message);
                }
            },
            error: function(xhr) {
                if (xhr.responseJSON) {
                    if (xhr.status === 400 && xhr.responseJSON.data) {

                        // 1. Build a clean HTML unordered list
                        let errorHtml = "<ul style='text-align: left; margin-bottom: 0;'>";

                        for (let field in xhr.responseJSON.data) {
                            // 2. Wrap each error message in an <li> tag
                            errorHtml += "<li>" + xhr.responseJSON.data[field] + "</li>";
                        }

                        errorHtml += "</ul>";

                        // 3. Fire SweetAlert using the 'html' property instead of 'text'
                        Swal.fire({
                            icon: "error",
                            title: "Validation Failed",
                            html: errorHtml
                        });

                    } else {
                        // Fallback for other backend errors (like 403 Forbidden or 409 Conflict)
                        Swal.fire({
                            icon: "error",
                            title: "Error",
                            text: xhr.responseJSON.message
                        });
                    }
                } else {
                    // Fallback for when the server is completely down
                    Swal.fire({
                        icon: "error",
                        title: "Connection Failed",
                        text: "Server error. Could not connect to backend."
                    });
                }
            }
        });
    });
});