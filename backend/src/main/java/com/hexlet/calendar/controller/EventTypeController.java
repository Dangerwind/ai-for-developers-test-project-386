package com.hexlet.calendar.controller;

import com.hexlet.calendar.dto.CreateEventTypeRequest;
import com.hexlet.calendar.dto.EventTypeDto;
import com.hexlet.calendar.model.EventType;
import com.hexlet.calendar.repository.EventTypeRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/event-types")
@CrossOrigin
@RequiredArgsConstructor
public class EventTypeController {

    private final EventTypeRepository eventTypeRepository;

    @GetMapping
    public List<EventTypeDto> list() {
        return eventTypeRepository.findAll().stream().map(this::toDto).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EventTypeDto create(@Valid @RequestBody CreateEventTypeRequest request) {
        EventType eventType = new EventType();
        eventType.setName(request.getName());
        eventType.setDescription(request.getDescription());
        eventType.setDurationMinutes(request.getDurationMinutes());
        return toDto(eventTypeRepository.save(eventType));
    }

    private EventTypeDto toDto(EventType et) {
        EventTypeDto dto = new EventTypeDto();
        dto.setId(et.getId());
        dto.setName(et.getName());
        dto.setDescription(et.getDescription());
        dto.setDurationMinutes(et.getDurationMinutes());
        return dto;
    }
}
