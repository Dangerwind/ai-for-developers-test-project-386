package com.hexlet.calendar.config;

import com.hexlet.calendar.model.EventType;
import com.hexlet.calendar.repository.EventTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final EventTypeRepository eventTypeRepository;

    @Override
    public void run(ApplicationArguments args) {
        if (eventTypeRepository.count() > 0) return;

        EventType consultation = new EventType();
        consultation.setName("Консультация");
        consultation.setDescription("Краткое знакомство и обсуждение вашего проекта или вопроса");
        consultation.setDurationMinutes(30);
        eventTypeRepository.save(consultation);

        EventType deepDive = new EventType();
        deepDive.setName("Детальное обсуждение");
        deepDive.setDescription("Углублённый разбор задачи, архитектуры или стратегии");
        deepDive.setDurationMinutes(60);
        eventTypeRepository.save(deepDive);
    }
}
