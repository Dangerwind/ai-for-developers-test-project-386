package com.hexlet.calendar.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
@AllArgsConstructor
public class SlotDto {
    private OffsetDateTime startTime;
    private OffsetDateTime endTime;
    private boolean available;
}
