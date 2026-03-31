package lk.ijse.springboot.nexus_retail_ecosystem.util;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lk.ijse.springboot.nexus_retail_ecosystem.util.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        // NEW: Skip JWT logic for image uploads
        String path = request.getServletPath();
        if (path.startsWith("/uploads/")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 1. Look for the Authorization header
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String username;

        // 2. If there is no token or it doesn't start with "Bearer ", move to the next filter
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 3. Extract the token (removing "Bearer " from the string)
        jwt = authHeader.substring(7);
        username = jwtService.extractUsername(jwt);

        // 4. If we have a username and the user is NOT already authenticated in this session
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // Fetch the user from the database
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

            // 5. Check if the token is valid
            if (jwtService.isTokenValid(jwt, userDetails)) {

                // Create an authentication object
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );

                // Add the web request details
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // Tell Spring Security: "This user is now authenticated for this specific request"
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // Continue down the filter chain
        filterChain.doFilter(request, response);
    }
}
