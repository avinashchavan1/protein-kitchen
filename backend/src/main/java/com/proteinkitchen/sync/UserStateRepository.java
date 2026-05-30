package com.proteinkitchen.sync;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface UserStateRepository extends JpaRepository<UserState, UUID> {
}
