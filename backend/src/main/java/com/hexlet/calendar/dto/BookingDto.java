package com.hexlet.calendar.dto;

import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class BookingDto {
    private String id;
    private String eventTypeId;
    private String eventTypeName;
    private String guestName;
    private String guestEmail;
    private OffsetDateTime startTime;
    private OffsetDateTime endTime;
    private OffsetDateTime createdAt;
}
