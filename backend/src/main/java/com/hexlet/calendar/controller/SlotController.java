package com.hexlet.calendar.controller;

import com.hexlet.calendar.dto.ErrorResponse;
import com.hexlet.calendar.dto.SlotDto;
import com.hexlet.calendar.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/event-types")
@CrossOrigin
@RequiredArgsConstructor
public class SlotController {

    private final BookingService bookingService;

    @GetMapping("/{id}/slots")
    public ResponseEntity<?> getSlots(@PathVariable String id, @RequestParam String date) {
        LocalDate localDate;
        try {
            localDate = LocalDate.parse(date);
        } catch (DateTimeParseException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Invalid date format. Use YYYY-MM-DD"));
        }

        try {
            List<SlotDto> slots = bookingService.getSlots(id, localDate);
            return ResponseEntity.ok(slots);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).body(new ErrorResponse(e.getMessage()));
        }
    }
}
