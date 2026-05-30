package com.proteinkitchen.push;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PushSubscriptionRepository extends JpaRepository<PushSubscriptionEntity, UUID> {
    List<PushSubscriptionEntity> findByUserId(UUID userId);
    Optional<PushSubscriptionEntity> findByEndpoint(String endpoint);
    void deleteByEndpoint(String endpoint);
}
