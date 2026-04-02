package com.hexlet.calendar.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateEventTypeRequest {
    @NotBlank
    private String name;

    @NotBlank
    private String description;

    @Min(1)
    private int durationMinutes;
}
