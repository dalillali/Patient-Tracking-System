package com.patientcare.controller;

import com.patientcare.entity.EmailRequest;
import com.patientcare.service.EmailNotificationService;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/alerts")
@CrossOrigin(origins = "http://localhost:3000")
@AllArgsConstructor
public class AlertController {

    private final EmailNotificationService emailService;

    @Autowired
    private RestTemplate restTemplate;


    @GetMapping("/last_location")
    public ResponseEntity<?> getLastLocation(@RequestParam("patientId") Long patientId) {
        try {
            // L'URL du service Flask pour obtenir la localisation (si vous avez un service Flask)
            String url = "http://localhost:5001/last_location?patientId=" + patientId;

            // Effectuer la requête vers Flask pour obtenir les données de localisation
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);

            // Vérifier si la réponse de Flask est valide
            if (response.getStatusCode() == HttpStatus.OK) {
                // Retourner la localisation du patient
                return ResponseEntity.ok(response.getBody());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("No location data found for patient with ID: " + patientId);
            }
        } catch (Exception e) {
            // En cas d'erreur
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching location for patient with ID: " + patientId + " - " + e.getMessage());
        }
    }


    // Send an email alert
    @PostMapping("/email")
    public ResponseEntity<String> sendEmail(@RequestBody EmailRequest emailRequest) {
        emailService.sendEmail(emailRequest.getTo(), emailRequest.getSubject(), emailRequest.getBody());
        return ResponseEntity.ok("Email sent successfully to " + emailRequest.getTo());
    }


}
