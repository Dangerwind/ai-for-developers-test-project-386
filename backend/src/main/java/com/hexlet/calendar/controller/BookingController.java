package com.hexlet.calendar.controller;

import com.hexlet.calendar.dto.BookingDto;
import com.hexlet.calendar.dto.CreateBookingRequest;
import com.hexlet.calendar.dto.ErrorResponse;
import com.hexlet.calendar.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @GetMapping
    public List<BookingDto> list() {
        return bookingService.getUpcomingBookings();
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody CreateBookingRequest request) {
        try {
            BookingDto booking = bookingService.createBooking(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(booking);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse(e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(new ErrorResponse(e.getMessage()));
        }
    }
}
