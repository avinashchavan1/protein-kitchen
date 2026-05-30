package com.proteinkitchen.push;

import jakarta.validation.constraints.NotBlank;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/push")
public class PushController {

    private final PushSubscriptionRepository repo;
    private final WebPushService push;

    public PushController(PushSubscriptionRepository repo, WebPushService push) {
        this.repo = repo;
        this.push = push;
    }

    public record SubscribeRequest(@NotBlank String endpoint, @NotBlank String p256dh, @NotBlank String auth) {}

    /** Public — frontend needs the VAPID public key to subscribe via the browser PushManager. */
    @GetMapping("/key")
    public Map<String, Object> key() {
        return Map.of("publicKey", push.isConfigured() ? push.getPublicKey() : "", "configured", push.isConfigured());
    }

    @PostMapping("/subscribe")
    @Transactional
    public Map<String, Object> subscribe(@AuthenticationPrincipal UUID userId, @RequestBody SubscribeRequest req) {
        PushSubscriptionEntity sub = repo.findByEndpoint(req.endpoint()).orElseGet(PushSubscriptionEntity::new);
        sub.setUserId(userId);
        sub.setEndpoint(req.endpoint());
        sub.setP256dh(req.p256dh());
        sub.setAuth(req.auth());
        repo.save(sub);
        return Map.of("ok", true);
    }

    @PostMapping("/unsubscribe")
    @Transactional
    public Map<String, Object> unsubscribe(@RequestBody Map<String, String> body) {
        String endpoint = body.get("endpoint");
        if (endpoint != null) repo.deleteByEndpoint(endpoint);
        return Map.of("ok", true);
    }

    /** Send a test notification to all of the caller's registered devices. */
    @PostMapping("/test")
    @Transactional
    public Map<String, Object> test(@AuthenticationPrincipal UUID userId) {
        if (!push.isConfigured()) {
            return Map.of("sent", 0, "devices", 0, "configured", false);
        }
        List<PushSubscriptionEntity> subs = repo.findByUserId(userId);
        String payload = "{\"title\":\"Protein Kitchen\",\"body\":\"Time to log your protein 💪\",\"icon\":\"/icons/pwa-192.png\"}";
        int sent = 0;
        for (PushSubscriptionEntity s : subs) {
            boolean ok = push.send(s, payload);
            if (ok) sent++;
            else if (!push.isConfigured()) break;
            else repo.deleteByEndpoint(s.getEndpoint()); // prune expired
        }
        return Map.of("sent", sent, "devices", subs.size());
    }
}
