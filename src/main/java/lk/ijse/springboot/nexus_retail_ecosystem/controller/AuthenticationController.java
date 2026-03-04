package lk.ijse.springboot.nexus_retail_ecosystem.controller;

import jakarta.validation.Valid;
import lk.ijse.springboot.nexus_retail_ecosystem.dto.APIResponse;
import lk.ijse.springboot.nexus_retail_ecosystem.dto.AuthenticationRequest;
import lk.ijse.springboot.nexus_retail_ecosystem.dto.RegisterRequest;
import lk.ijse.springboot.nexus_retail_ecosystem.service.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService authenticationService;

    @PostMapping("/register")
    public ResponseEntity<APIResponse> register(@Valid @RequestBody RegisterRequest request) {
        // 1. Call the service to do the business logic
        var authData = authenticationService.register(request);

        // 2. Wrap the result in your custom APIResponse
        APIResponse response = new APIResponse(
                HttpStatus.CREATED.value(),
                "Customer registered successfully",
                authData
        );

        // 3. Return it with the proper HTTP status code
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/authenticate")
    public ResponseEntity<APIResponse> authenticate(@Valid @RequestBody AuthenticationRequest request) {
        // 1. Call the service to verify credentials
        var authData = authenticationService.authenticate(request);

        // 2. Wrap the result in your custom APIResponse
        APIResponse response = new APIResponse(
                HttpStatus.OK.value(),
                "User authenticated successfully",
                authData
        );

        // 3. Return it
        return ResponseEntity.ok(response);
    }
}