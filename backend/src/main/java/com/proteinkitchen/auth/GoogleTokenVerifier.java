package com.proteinkitchen.auth;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
public class GoogleTokenVerifier {

    private final GoogleIdTokenVerifier verifier;
    private final boolean configured;

    public GoogleTokenVerifier(@Value("${app.google.client-id}") String clientId) {
        this.configured = clientId != null && !clientId.isBlank();
        this.verifier = configured
                ? new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(clientId))
                    .build()
                : null;
    }

    public boolean isConfigured() { return configured; }

    /** Verifies a Google ID token. Returns the verified payload, or null when invalid. */
    public GoogleIdToken.Payload verify(String idTokenString) {
        if (!configured) {
            throw new IllegalStateException("GOOGLE_CLIENT_ID not configured");
        }
        try {
            GoogleIdToken token = verifier.verify(idTokenString);
            return token != null ? token.getPayload() : null;
        } catch (Exception e) {
            return null;
        }
    }
}
