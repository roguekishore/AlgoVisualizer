package com.backend.springapp.sync;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class SyncResponseDTO {

    /** Number of submitted slugs that matched a problem in our DB. */
    private int matched;

    /** Number of UserProgress records newly set to SOLVED (skips already-solved). */
    private int updated;

    /** Slugs that had no matching problem in our DB. */
    private List<String> notFound;
}
