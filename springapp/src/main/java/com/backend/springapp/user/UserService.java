package com.backend.springapp.user;

import com.backend.springapp.leaderboard.Institution;
import com.backend.springapp.leaderboard.InstitutionRepository;
import com.backend.springapp.user.dto.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final InstitutionRepository institutionRepository;

    // ─── Mapping ─────────────────────────────────────────────────────────────

    private UserResponseDTO toResponse(User user) {
        UserResponseDTO dto = new UserResponseDTO();
        dto.setUid(user.getUid());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setLcusername(user.getLcusername());
        dto.setGraduationYear(user.getGraduationYear());
        dto.setRating(user.getRating());
        if (user.getInstitution() != null) {
            dto.setInstitutionId(user.getInstitution().getId());
            dto.setInstitutionName(user.getInstitution().getName());
        }
        return dto;
    }

    // ─── CRUD ────────────────────────────────────────────────────────────────

    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public UserResponseDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + id));
        return toResponse(user);
    }

    @Transactional
    public UserResponseDTO createUser(UserRequestDTO dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Email already in use: " + dto.getEmail());
        }
        if (userRepository.existsByUsername(dto.getUsername())) {
            throw new IllegalArgumentException("Username already taken: " + dto.getUsername());
        }

        User user = new User();
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setPassword(dto.getPassword());
        user.setLcusername(dto.getLcusername());
        user.setGraduationYear(dto.getGraduationYear());
        if (dto.getInstitutionId() != null) {
            Institution institution = institutionRepository.findById(dto.getInstitutionId())
                    .orElseThrow(() -> new EntityNotFoundException("Institution not found with id: " + dto.getInstitutionId()));
            user.setInstitution(institution);
        }

        return toResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponseDTO updateUser(Long id, UserRequestDTO dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + id));

        // Allow changing email only if it's not taken by another user
        if (!user.getEmail().equals(dto.getEmail()) && userRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Email already in use: " + dto.getEmail());
        }
        if (!user.getUsername().equals(dto.getUsername()) && userRepository.existsByUsername(dto.getUsername())) {
            throw new IllegalArgumentException("Username already taken: " + dto.getUsername());
        }

        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setPassword(dto.getPassword());
        user.setLcusername(dto.getLcusername());
        user.setGraduationYear(dto.getGraduationYear());
        if (dto.getInstitutionId() != null) {
            Institution institution = institutionRepository.findById(dto.getInstitutionId())
                    .orElseThrow(() -> new EntityNotFoundException("Institution not found with id: " + dto.getInstitutionId()));
            user.setInstitution(institution);
        } else {
            user.setInstitution(null);
        }

        return toResponse(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new EntityNotFoundException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }

    // ─── Auth ────────────────────────────────────────────────────────────────

    public UserResponseDTO login(LoginRequestDTO dto) {
        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!user.getPassword().equals(dto.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        return toResponse(user);
    }

    @Transactional
    public UserResponseDTO signup(SignupRequestDTO dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Email already in use: " + dto.getEmail());
        }
        if (userRepository.existsByUsername(dto.getUsername())) {
            throw new IllegalArgumentException("Username already taken: " + dto.getUsername());
        }

        User user = new User();
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setPassword(dto.getPassword());
        user.setGraduationYear(dto.getGraduationYear());
        if (dto.getInstitutionId() != null) {
            Institution institution = institutionRepository.findById(dto.getInstitutionId())
                    .orElseThrow(() -> new EntityNotFoundException("Institution not found with id: " + dto.getInstitutionId()));
            user.setInstitution(institution);
        }

        return toResponse(userRepository.save(user));
    }
}
