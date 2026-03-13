package lk.ijse.springboot.nexus_retail_ecosystem.controller;

import lk.ijse.springboot.nexus_retail_ecosystem.dto.APIResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/files")
@CrossOrigin
public class FileController {

    // Dynamically find the root folder of your project and create an "uploads" folder inside it
    private final String UPLOAD_DIR = System.getProperty("user.dir") + "/uploads";

    @PostMapping("/upload")
    @PreAuthorize("hasAuthority('ADMIN')") // Only Admins can upload files!
    public ResponseEntity<APIResponse> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            // 1. Create the folder if it doesn't exist yet
            File directory = new File(UPLOAD_DIR);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            // 2. Generate a unique file name (prevents overwriting if two images are named "cracker.jpg")
            String uniqueFileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();

            // 3. Define the exact path where the file will be saved
            Path filePath = Paths.get(UPLOAD_DIR, uniqueFileName);

            // 4. Copy the file from the network request to your hard drive
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // 5. Generate the public URL string for the database (e.g., "/uploads/123-cracker.jpg")
            String publicUrl = "/uploads/" + uniqueFileName;

            // 6. Return the string path to the frontend!
            APIResponse response = new APIResponse(
                    HttpStatus.CREATED.value(),
                    "File uploaded successfully",
                    publicUrl // We pass the string back in the 'data' field
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (IOException e) {
            APIResponse response = new APIResponse(
                    HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Failed to save file: " + e.getMessage(),
                    null
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }


}
