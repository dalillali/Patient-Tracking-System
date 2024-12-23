package com.patientcare.controller;

import com.patientcare.entity.Location;
import com.patientcare.service.LocationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.Map;

@RestController
@RequestMapping("/api/coordinates")
public class LocationController {

    private final LocationService locationService;

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

            return ResponseEntity.ok("Location received and saved successfully");
        }

        return ResponseEntity.badRequest().body("Invalid location data");
    }



}