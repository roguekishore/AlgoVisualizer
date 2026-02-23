package com.backend.springapp.user.dto;

import lombok.Data;

@Data
public class UserResponseDTO {

    private Long uid;
    private String username;
    private String email;
    private String lcusername;
    private Integer graduationYear;
    private int rating;
    private Long institutionId;
    private String institutionName;
}
