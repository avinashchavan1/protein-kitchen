package com.proteinkitchen.sync;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.UUID;

/**
 * One row per user. Holds the full app-state document (same shape the frontend
 * persists to localStorage) as a jsonb blob. Full-document sync — read/replace.
 */
@Entity
@Table(name = "pk_user_state")
public class UserState {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb", nullable = false)
    private String data = "{}";

    @Version
    private long revision;

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    public UserState() {}
    public UserState(UUID userId) { this.userId = userId; }

    @PreUpdate @PrePersist
    void touch() { this.updatedAt = Instant.now(); }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public String getData() { return data; }
    public void setData(String data) { this.data = data; }
    public long getRevision() { return revision; }
    public Instant getUpdatedAt() { return updatedAt; }
}
