package com.backend.springapp.gamification;

/**
 * Thrown when a user tries to spend more coins than they have.
 */
public class InsufficientCoinsException extends RuntimeException {
    public InsufficientCoinsException(String message) {
        super(message);
    }
}
