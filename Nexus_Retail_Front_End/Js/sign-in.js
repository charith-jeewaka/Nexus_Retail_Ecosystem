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

                    localStorage.setItem("nexus_user_id", res.data.userId);
                    localStorage.setItem("nexus_user_name", res.data.username);

                    // Trigger the SPA Router
                    window.checkAuthAndRoute();

                } else {
                    alert("Unexpected response: " + res.message);
                }
            },
            error: function(xhr) {
                if (xhr.responseJSON) {
                    if (xhr.status === 400 && xhr.responseJSON.data) {

                        // 1. Start building an HTML bulleted list.
                        // text-align: left keeps the bullets looking neat!
                        let errorHtml = "<ul style='text-align: left; margin-top: 10px;'>";

                        // 2. Wrap each error message in an <li> tag
                        for (let field in xhr.responseJSON.data) {
                            errorHtml += "<li>" + xhr.responseJSON.data[field] + "</li>";
                        }

                        // 3. Close the list
                        errorHtml += "</ul>";

                        // 4. Use SweetAlert's 'html' property instead of 'text'
                        Swal.fire({
                            icon: "error",
                            title: "Please fix the following errors",
                            html: errorHtml
                        });

                    } else {
                        Swal.fire({
                            icon: "error",
                            title: "Login failed", // Or "Action failed" depending on the file!
                            text: xhr.responseJSON.message
                        });
                    }
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Server Error",
                        text: "Could not connect to backend"
                    });
                }
            }
        });
    });
});