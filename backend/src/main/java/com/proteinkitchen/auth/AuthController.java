package com.proteinkitchen.auth;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.proteinkitchen.auth.AuthDtos.*;
import com.proteinkitchen.security.JwtService;
import com.proteinkitchen.user.User;
import com.proteinkitchen.user.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final GoogleTokenVerifier google;
    private final UserRepository users;
    private final JwtService jwt;

    public AuthController(GoogleTokenVerifier google, UserRepository users, JwtService jwt) {
        this.google = google;
        this.users = users;
        this.jwt = jwt;
    }

    @PostMapping("/google")
    @Transactional
    public AuthResponse google(@Valid @RequestBody GoogleLoginRequest req) {
        if (!google.isConfigured()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Google login not configured");
        }
        GoogleIdToken.Payload p = google.verify(req.idToken());
        if (p == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid Google token");
        }
        String sub = p.getSubject();
        String email = p.getEmail();
        String name = (String) p.get("name");
        String picture = (String) p.get("picture");

        User user = users.findByGoogleSub(sub).orElseGet(User::new);
        user.setGoogleSub(sub);
        user.setEmail(email);
        user.setName(name);
        user.setPicture(picture);
        user = users.save(user);

        String token = jwt.issue(user.getId(), user.getEmail());
        return new AuthResponse(token, toView(user));
    }

    @GetMapping("/me")
    public ResponseEntity<UserView> me(@AuthenticationPrincipal UUID userId) {
        return users.findById(userId)
                .map(u -> ResponseEntity.ok(toView(u)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }

    private static UserView toView(User u) {
        return new UserView(u.getId().toString(), u.getEmail(), u.getName(), u.getPicture());
    }
}
