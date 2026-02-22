package com.backend.springapp.leaderboard;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Seeds the institution table from cbe.csv on startup.
 * Only runs if the table is empty.
 *
 * CSV column layout (1-based):
 *   1 → row number       (ignored)
 *   2 → university name  → strip "(Id: ...)" tag, store clean name
 *   3 → college name     → strip "(Id: ...)" tag, store clean name
 *   4 → affiliation type (ignored)
 *   5 → state
 *   6 → district
 */
@Component
@Order(2)
@RequiredArgsConstructor
@Slf4j
public class InstitutionDataInitializer implements CommandLineRunner {

    private final InstitutionRepository institutionRepository;

    /** Strips the trailing "(Id: X-1234)" portion from a field. */
    private static final Pattern ID_PATTERN =
            Pattern.compile("^(.+?)\\s*\\(Id:\\s*[^)]+\\)\\s*$");

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (institutionRepository.count() > 0) {
            log.info("Institution table already seeded. Skipping.");
            return;
        }

        log.info("Seeding institutions from cbe.csv...");

        ClassPathResource resource = new ClassPathResource("cbe.csv");
        List<Institution> institutions = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {

            String line;
            int lineNum = 0;

            while ((line = reader.readLine()) != null) {
                lineNum++;
                if (line.isBlank()) continue;

                List<String> fields = parseCsvLine(line);

                if (fields.size() < 6) {
                    log.warn("Line {}: only {} fields found, skipping.", lineNum, fields.size());
                    continue;
                }

                // Col 2 (index 1): university  e.g. "Amrita Vishwa Vidyapeetham, Coimbatore (Id: U-0436)"
                String university = stripId(fields.get(1).trim());
                // Col 3 (index 2): college     e.g. "Amrita School of Business, Coimbatore (Id: C-7023)"
                String name       = stripId(fields.get(2).trim());
                // Col 5 (index 4): state
                String state      = fields.get(4).trim();
                // Col 6 (index 5): district
                String district   = fields.get(5).trim();

                Institution inst = new Institution();
                inst.setName(name);
                inst.setUniversity(university);
                inst.setState(state);
                inst.setDistrict(district);
                inst.setNormalizedName(name.toLowerCase().trim());

                institutions.add(inst);
            }
        }

        institutionRepository.saveAll(institutions);
        log.info("Seeded {} institutions.", institutions.size());
    }

    /**
     * Removes the trailing "(Id: X-1234)" tag from a raw CSV field.
     * e.g. "Amrita School of Business, Coimbatore (Id: C-7023)" → "Amrita School of Business, Coimbatore"
     */
    private String stripId(String raw) {
        Matcher m = ID_PATTERN.matcher(raw);
        return m.matches() ? m.group(1).trim() : raw;
    }

    /**
     * RFC 4180-compliant CSV line parser that handles quoted fields containing commas.
     */
    private List<String> parseCsvLine(String line) {
        List<String> fields = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inQuotes = false;

        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (c == '"') {
                if (inQuotes && i + 1 < line.length() && line.charAt(i + 1) == '"') {
                    current.append('"');
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (c == ',' && !inQuotes) {
                fields.add(current.toString());
                current.setLength(0);
            } else {
                current.append(c);
            }
        }

        fields.add(current.toString());
        return fields;
    }
}
