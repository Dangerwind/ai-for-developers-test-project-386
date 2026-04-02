package com.hexlet.calendar.repository;

import com.hexlet.calendar.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, String> {

    @Query("SELECT b FROM Booking b WHERE b.startTime >= :now ORDER BY b.startTime ASC")
    List<Booking> findUpcoming(@Param("now") OffsetDateTime now);

    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.startTime < :endTime AND b.endTime > :startTime")
    boolean existsConflict(@Param("startTime") OffsetDateTime startTime, @Param("endTime") OffsetDateTime endTime);

    @Query("SELECT b FROM Booking b WHERE b.startTime >= :dayStart AND b.startTime < :dayEnd")
    List<Booking> findByDay(@Param("dayStart") OffsetDateTime dayStart, @Param("dayEnd") OffsetDateTime dayEnd);
}
