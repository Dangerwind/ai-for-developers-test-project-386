package com.hexlet.calendar.service;

import com.hexlet.calendar.dto.*;
import com.hexlet.calendar.model.Booking;
import com.hexlet.calendar.model.EventType;
import com.hexlet.calendar.repository.BookingRepository;
import com.hexlet.calendar.repository.EventTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.*;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class BookingService {

    private static final LocalTime WORK_START = LocalTime.of(9, 0);
    private static final LocalTime WORK_END = LocalTime.of(18, 0);
    private static final int SLOT_DURATION_MINUTES = 30;

    private final BookingRepository bookingRepository;
    private final EventTypeRepository eventTypeRepository;

    public List<SlotDto> getSlots(String eventTypeId, LocalDate date) {
        eventTypeRepository.findById(eventTypeId)
                .orElseThrow(() -> new NoSuchElementException("Event type not found: " + eventTypeId));

        ZoneOffset zone = ZoneOffset.UTC;
        OffsetDateTime dayStart = date.atTime(WORK_START).atOffset(zone);
        OffsetDateTime dayEnd = date.atTime(WORK_END).atOffset(zone);

        List<Booking> dayBookings = bookingRepository.findByDay(
                date.atStartOfDay().atOffset(zone),
                date.plusDays(1).atStartOfDay().atOffset(zone)
        );

        List<SlotDto> slots = new ArrayList<>();
        OffsetDateTime cursor = dayStart;

        while (cursor.plusMinutes(SLOT_DURATION_MINUTES).compareTo(dayEnd) <= 0) {
            OffsetDateTime slotEnd = cursor.plusMinutes(SLOT_DURATION_MINUTES);
            final OffsetDateTime slotStart = cursor;

            boolean occupied = dayBookings.stream().anyMatch(b ->
                    b.getStartTime().isBefore(slotEnd) && b.getEndTime().isAfter(slotStart)
            );

            slots.add(new SlotDto(slotStart, slotEnd, !occupied));
            cursor = slotEnd;
        }

        return slots;
    }

    public BookingDto createBooking(CreateBookingRequest request) {
        EventType eventType = eventTypeRepository.findById(request.getEventTypeId())
                .orElseThrow(() -> new NoSuchElementException("Event type not found: " + request.getEventTypeId()));

        OffsetDateTime startTime = request.getStartTime();
        OffsetDateTime endTime = startTime.plusMinutes(eventType.getDurationMinutes());

        if (bookingRepository.existsConflict(startTime, endTime)) {
            throw new IllegalStateException("Slot already booked");
        }

        Booking booking = new Booking();
        booking.setEventTypeId(eventType.getId());
        booking.setGuestName(request.getGuestName());
        booking.setGuestEmail(request.getGuestEmail());
        booking.setStartTime(startTime);
        booking.setEndTime(endTime);

        booking = bookingRepository.save(booking);

        return toDto(booking, eventType.getName());
    }

    public List<BookingDto> getUpcomingBookings() {
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        List<Booking> bookings = bookingRepository.findUpcoming(now);

        return bookings.stream().map(b -> {
            String eventTypeName = eventTypeRepository.findById(b.getEventTypeId())
                    .map(EventType::getName)
                    .orElse("Unknown");
            return toDto(b, eventTypeName);
        }).toList();
    }

    private BookingDto toDto(Booking booking, String eventTypeName) {
        BookingDto dto = new BookingDto();
        dto.setId(booking.getId());
        dto.setEventTypeId(booking.getEventTypeId());
        dto.setEventTypeName(eventTypeName);
        dto.setGuestName(booking.getGuestName());
        dto.setGuestEmail(booking.getGuestEmail());
        dto.setStartTime(booking.getStartTime());
        dto.setEndTime(booking.getEndTime());
        dto.setCreatedAt(booking.getCreatedAt());
        return dto;
    }
}
