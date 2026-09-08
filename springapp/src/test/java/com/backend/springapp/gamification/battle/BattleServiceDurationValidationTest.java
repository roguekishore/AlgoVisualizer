package com.backend.springapp.gamification.battle;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class BattleServiceDurationValidationTest {

    private BattleService newService() {
        return new BattleService(
                null, null, null, null, null, null, null,
                null, null, null, null, null, null, null
        );
    }

    @Test
    void casual_allowsTenMinutes() {
        BattleService service = newService();

        int resolved = service.resolveOneVsOneDurationMinutes(BattleMode.CASUAL_1V1, 1, 10);

        assertEquals(10, resolved);
    }

    @Test
    void ranked_allowsTenMinutes() {
        BattleService service = newService();

        int resolved = service.resolveOneVsOneDurationMinutes(BattleMode.RANKED_1V1, 1, 10);

        assertEquals(10, resolved);
    }

    @Test
    void ranked_acceptsFifteenMinutes() {
        BattleService service = newService();

        int resolved = service.resolveOneVsOneDurationMinutes(BattleMode.RANKED_1V1, 1, 15);

        assertEquals(15, resolved);
    }

    @Test
    void anyDurationWithinRange_isAccepted() {
        BattleService service = newService();

        int resolved = service.resolveOneVsOneDurationMinutes(BattleMode.CASUAL_1V1, 3, 90);

        assertEquals(90, resolved);
    }

    @Test
    void durationOutsideRange_throws() {
        BattleService service = newService();

        assertThrows(IllegalArgumentException.class,
                () -> service.resolveOneVsOneDurationMinutes(BattleMode.CASUAL_1V1, 2, 181));
    }

    @Test
    void fallback_usesProblemCountTimesFifteen() {
        BattleService service = newService();

        int resolved = service.resolveOneVsOneDurationMinutes(BattleMode.CASUAL_1V1, 3, null);

        assertEquals(45, resolved);
    }

    @Test
    void invalidProblemCount_throws() {
        BattleService service = newService();

        assertThrows(IllegalArgumentException.class,
                () -> service.resolveOneVsOneDurationMinutes(BattleMode.CASUAL_1V1, 0, 15));
    }

    @Test
    void nonOneVsOneMode_throws() {
        BattleService service = newService();

        assertThrows(IllegalArgumentException.class,
                () -> service.resolveOneVsOneDurationMinutes(BattleMode.GROUP_FFA, 2, 30));
    }
}
