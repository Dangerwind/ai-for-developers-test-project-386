package com.hexlet.calendar.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class CreateBookingRequest {
    @NotBlank
    private String eventTypeId;

    @NotBlank
    private String guestName;

    @NotBlank
    @Email
    private String guestEmail;

    @NotNull
    private OffsetDateTime startTime;
}
