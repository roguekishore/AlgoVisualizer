package com.backend.springapp.gamification.battle;

import com.backend.springapp.problem.Tag;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertThrows;

class BattleServiceQueueGuardTest {

    private BattleService newService() {
        return new BattleService(
                null, null, null, null, null, null, null,
                null, null, null, null, null, null, null
        );
    }

    @Test
    void joinQueue_rejectsGroupMode() {
        BattleService service = newService();

        assertThrows(IllegalArgumentException.class,
                () -> service.joinQueue(1L, BattleMode.GROUP_FFA, Tag.MEDIUM, 2, 30));
    }

    @Test
    void joinQueue_rejectsInvalidProblemCountLow() {
        BattleService service = newService();

        assertThrows(IllegalArgumentException.class,
                () -> service.joinQueue(1L, BattleMode.CASUAL_1V1, Tag.MEDIUM, 0, 15));
    }

    @Test
    void joinQueue_rejectsInvalidProblemCountHigh() {
        BattleService service = newService();

        assertThrows(IllegalArgumentException.class,
                () -> service.joinQueue(1L, BattleMode.RANKED_1V1, Tag.MEDIUM, 4, 30));
    }
}
