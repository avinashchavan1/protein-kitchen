package com.proteinkitchen.sync;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Per-user cloud sync. The whole app-state document (same JSON the frontend keeps
 * in localStorage) is stored as one jsonb blob keyed by user. Full-document model:
 * GET reads it, PUT replaces it.
 */
@RestController
@RequestMapping("/api/sync")
public class SyncController {

    private final UserStateRepository repo;
    private final ObjectMapper mapper;

    public SyncController(UserStateRepository repo, ObjectMapper mapper) {
        this.repo = repo;
        this.mapper = mapper;
    }

    public record SyncView(JsonNode data, long revision, String updatedAt) {}

    @GetMapping
    public SyncView get(@AuthenticationPrincipal UUID userId) throws Exception {
        UserState st = repo.findById(userId).orElse(null);
        if (st == null) {
            return new SyncView(mapper.createObjectNode(), 0, Instant.now().toString());
        }
        return new SyncView(mapper.readTree(st.getData()), st.getRevision(), st.getUpdatedAt().toString());
    }

    @PutMapping
    @Transactional
    public SyncView put(@AuthenticationPrincipal UUID userId, @RequestBody JsonNode body) throws Exception {
        UserState st = repo.findById(userId).orElseGet(() -> new UserState(userId));
        st.setData(mapper.writeValueAsString(body));
        st = repo.save(st);
        return new SyncView(mapper.readTree(st.getData()), st.getRevision(), st.getUpdatedAt().toString());
    }
}
