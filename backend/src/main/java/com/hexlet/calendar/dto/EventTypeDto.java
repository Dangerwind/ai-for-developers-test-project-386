package com.hexlet.calendar.dto;

import lombok.Data;

@Data
public class EventTypeDto {
    private String id;
    private String name;
    private String description;
    private int durationMinutes;
}
