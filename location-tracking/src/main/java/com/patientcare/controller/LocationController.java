package com.patientcare.controller;

import com.patientcare.entity.Location;
import com.patientcare.service.LocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/coordinates")
public class LocationController {

    private final LocationService locationService;

    @Autowired
    private RestTemplate restTemplate;

    @Value("${ai.module.url}") // AI Module URL from application.properties
    private String aiModuleUrl;

    public LocationController(LocationService locationService) {
        this.locationService = locationService;
    }

    @PostMapping
    public ResponseEntity<String> receiveCoordinates(@RequestBody Map<String, Object> payload) {
        if ("location".equals(payload.get("_type"))) {
            double latitude = (Double) payload.get("lat");
            double longitude = (Double) payload.get("lon");
            String trackerId = (String) payload.get("tid");

            // Use server timestamp
            LocalDateTime serverTimestamp = LocalDateTime.now();

            // Save location with server timestamp
            Location location = new Location();
            location.setLatitude(latitude);
            location.setLongitude(longitude);
            location.setTimestamp(serverTimestamp); // Use server time
            location.setTrackerId(trackerId);

            locationService.saveLocation(location);

            // Log the incoming GPS data
            System.out.println("Received GPS data: " + location);

            // Create the payload for AI Module
            Map<String, Object> aiPayload = Map.of(
                    "latitude", latitude,
                    "longitude", longitude,
                    "timestamp", serverTimestamp.toString(),
                    "trackerId", trackerId
            );

            // Forward data to AI Module
            try {
                ResponseEntity<String> aiResponse = restTemplate.postForEntity(
                        aiModuleUrl + "/analyze",
                        aiPayload,
                        String.class
                );

                // Log AI Module's response
                System.out.println("AI Module Response: " + aiResponse.getBody());
            } catch (Exception e) {
                System.err.println("Failed to communicate with AI Module: " + e.getMessage());
            }

            return ResponseEntity.ok("Location received and forwarded for analysis");
        }

        return ResponseEntity.badRequest().body("Invalid location data");
    }
}
