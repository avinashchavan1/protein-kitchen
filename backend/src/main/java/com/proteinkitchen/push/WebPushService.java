package com.proteinkitchen.push;

import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import nl.martijndwars.webpush.Subscription;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Security;

@Service
public class WebPushService {

    private static final Logger log = LoggerFactory.getLogger(WebPushService.class);

    private final String publicKey;
    private final boolean configured;
    private PushService pushService;

    public WebPushService(@Value("${app.vapid.public-key}") String publicKey,
                          @Value("${app.vapid.private-key}") String privateKey,
                          @Value("${app.vapid.subject}") String subject) {
        this.publicKey = publicKey;
        this.configured = publicKey != null && !publicKey.isBlank()
                && privateKey != null && !privateKey.isBlank();
        if (configured) {
            if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
                Security.addProvider(new BouncyCastleProvider());
            }
            try {
                this.pushService = new PushService(publicKey, privateKey, subject);
            } catch (Exception e) {
                throw new IllegalStateException("Failed to init web-push", e);
            }
        }
    }

    public boolean isConfigured() { return configured; }

    public String getPublicKey() { return publicKey; }

    /** @return true if delivered (2xx), false if the subscription is gone (404/410) or failed. */
    public boolean send(PushSubscriptionEntity sub, String payloadJson) {
        if (!configured) throw new IllegalStateException("VAPID keys not configured");
        try {
            Subscription subscription = new Subscription(
                    sub.getEndpoint(),
                    new Subscription.Keys(sub.getP256dh(), sub.getAuth()));
            Notification notification = new Notification(subscription, payloadJson);
            var resp = pushService.send(notification);
            int code = resp.getStatusLine().getStatusCode();
            if (code == 404 || code == 410) return false; // expired — caller should prune
            if (code >= 200 && code < 300) return true;
            log.warn("Push send returned {}", code);
            return false;
        } catch (Exception e) {
            log.warn("Push send failed: {}", e.getMessage());
            return false;
        }
    }
}
