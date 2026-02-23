package com.backend.springapp.sync;

import lombok.Data;
import java.util.List;

@Data
public class SyncRequestDTO {

    /** The user's LeetCode username stored in our DB (User.lcusername). */
    private String lcusername;

    /** LeetCode problem slugs that the user has accepted (e.g. "two-sum"). */
    private List<String> leetcodeSlugs;
}
