package com.proteinkitchen.auth;

import jakarta.validation.constraints.NotBlank;

public class AuthDtos {

    public record GoogleLoginRequest(@NotBlank String idToken) {}

    public record UserView(String id, String email, String name, String picture) {}

    public record AuthResponse(String token, UserView user) {}
}
