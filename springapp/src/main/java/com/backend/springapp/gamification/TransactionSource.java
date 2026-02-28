package com.backend.springapp.gamification;

/**
 * Categorises every coin movement for analytics and audit.
 */
public enum TransactionSource {
    PROBLEM_SOLVED,
    BATTLE_WIN,
    STREAK_BONUS,
    MISSION,
    STORE_PURCHASE,
    DAILY_LOGIN
}
