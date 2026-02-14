package com.backend.springapp.controller;

import com.backend.springapp.entity.Topic;
import com.backend.springapp.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for retrieving topics.
 */
@RestController
@RequestMapping("/api/topics")
@RequiredArgsConstructor
public class TopicController {

    private final TopicRepository topicRepository;

    /**
     * Get all topic names, sorted alphabetically.
     * Example: GET /api/topics → ["Absolute Programming Basics", "Arrays", ...]
     */
    @GetMapping
    public ResponseEntity<List<String>> getAllTopics() {
        List<String> topics = topicRepository.findAll()
                .stream()
                .map(Topic::getTopicname)
                .sorted()
                .toList();
        return ResponseEntity.ok(topics);
    }
}
