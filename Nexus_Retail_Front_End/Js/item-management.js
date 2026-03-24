$(document).ready(function() {

    // Endpoints
    const fileUploadUrl = "http://localhost:8080/api/v1/files/upload"; // We will build this next!
    const productSaveUrl = "http://localhost:8080/api/v1/products";

    // LIVE IMAGE PREVIEW (Updated for the Modern UI)
    $(document).on('change', '#inp-product-image', function(event) {
        const file = event.target.files[0];

        if (file) {
            // Optional but recommended: Verify it's actually an image
            if (file.type.startsWith('image/')) {
                // Create a temporary browser URL to preview the image
                const tempUrl = URL.createObjectURL(file);

                // Update the DOM for the new UI:
                // 1. Set the source and show the image
                $('#image-preview').attr('src', tempUrl).removeClass('d-none');
                // 2. Hide the cloud icon empty state
                $('#preview-empty-state').addClass('d-none');
                // 3. Add the solid border class to the container
                $('.preview-container').addClass('has-image');

                // Show the file name and size (converted to KB)
                const fileSizeKB = (file.size / 1024).toFixed(1);
                $('#image-name-display').text(`${file.name} (${fileSizeKB} KB)`);
            } else {
                Swal.fire('Invalid File', 'Please select a valid image file (JPEG, PNG, WebP).', 'warning');
                $('#inp-product-image').val(''); // Clear the invalid input
                resetImagePreview();
            }
        } else {
            resetImagePreview();
        }
    });

    //  THE TWO-STEP UPLOAD & SAVE PROCESS
    $(document).on('submit', '#form-save-product', function(e) {
        e.preventDefault(); // Stop  form from refreshing page

        // Grab the file if the user selected one
        const imageFile = $('#inp-product-image')[0].files[0];

        // Disable the button so they don't click it twice
        $('#btn-save-product-submit').prop('disabled', true).html('<span class="spinner-border spinner-border-sm"></span> Saving...');

        if (imageFile) {
            // STEP 1: Upload the physical file first
            let formData = new FormData();
            formData.append("file", imageFile);

            $.ajax({
                url: fileUploadUrl,
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("nexus_token")
                },
                data: formData,
                processData: false, // Required for FormData
                contentType: false, // Required for FormData
                success: function(uploadRes) {
                    // The backend gives us the string path (e.g., "/uploads/cracker.jpg")
                    const imageStringPath = uploadRes.data;

                    // Proceed to Step 2 with the string path
                    saveProductDetails(imageStringPath);
                },
                error: function(xhr) {
                    Swal.fire({
                        title: "Error",
                        text: "Failed to upload image",
                        icon: "error"
                    });
                    resetSaveButton();
                }
            });

        } else {
            // If no image was selected, just skip Step 1 and save as text-only!
            saveProductDetails(null);
        }
    });

    // STEP  SAVE THE JSON DATA TO THE DATABASE
    function saveProductDetails(imageStringPath) {

        // Build the clean JSON object
        const productData = {
            name: $('#inp-product-name').val(),
            category: $('#inp-product-category').val(),
            unitPrice: parseFloat($('#inp-product-price').val()),
            unitsInStock: parseInt($('#inp-product-stock').val()),
            imageUrl: imageStringPath // This is the string we got from Step 1 (or null)
        };

        $.ajax({
            url: productSaveUrl,
            method: "POST",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("nexus_token"),
                "Content-Type": "application/json"
            },
            data: JSON.stringify(productData),
            success: function(res) {
                Swal.fire({
                    position: "center",
                    icon: "success",
                    title: "Product saved successfully!",
                    showConfirmButton: false,
                    timer: 700
                });
                clearForm();
                resetSaveButton();
            },
            error: function(xhr) {
                // Let your existing GlobalExceptionHandler do the talking!
                if (xhr.status === 400) {
                    let errorMsg = "Validation Failed:\n";
                    for (let field in xhr.responseJSON.data) {
                        errorMsg += "• " + xhr.responseJSON.data[field] + "\n";
                    }
                    alert(errorMsg);
                } else if (xhr.status === 409) {
                    // alert(xhr.responseJSON.message); // Duplicate product
                    Swal.fire({
                        title: "Duplicate Input",
                        text: xhr.responseJSON.message,
                        icon: "info"
                    });
                } else if (xhr.status === 403) {
                    // alert("Unauthorized: Only Admins can add products.");
                    Swal.fire({
                        title: "Unauthorized",
                        text: "Only Admins can add products",
                        icon: "error"
                    });
                } else {
                    // alert("An error occurred while saving.");
                    Swal.fire({
                        title: "Error",
                        text: "An error occurred while saving",
                        icon: "error"
                    });
                }
                resetSaveButton();
            }
        });
    }

    // HELPER FUNCTIONS
    // HELPER FUNCTIONS (Updated for the Modern UI)
    $(document).on('click', '#btn-clear-product', function() {
        clearForm();
    });

    function clearForm() {
        $('#form-save-product')[0].reset();
        resetImagePreview();
    }

    // This is the crucial update to make the "Clear" button restore the dashed cloud UI
    function resetImagePreview() {
        // 1. Hide the image and clear the source
        $('#image-preview').attr('src', '').addClass('d-none');
        // 2. Show the cloud icon empty state again
        $('#preview-empty-state').removeClass('d-none');
        // 3. Remove the solid border class to get the dashes back
        $('.preview-container').removeClass('has-image');
        // 4. Reset the text
        $('#image-name-display').text('No file selected');
    }

    function resetSaveButton() {
        $('#btn-save-product-submit').prop('disabled', false).html('<i class="bi bi-cloud-arrow-up me-2"></i>Save Product');
    }
});