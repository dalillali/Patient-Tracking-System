package com.patientcare.controller;

import com.patientcare.entity.EmailRequest;
import com.patientcare.service.EmailNotificationService;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/alerts")
@AllArgsConstructor
public class AlertController {

    private final EmailNotificationService emailService;

    @Autowired
    private RestTemplate restTemplate;

    @GetMapping("/alert-patient")
    public String alertPatientService() {
        String url = "http://patient/api/patients"; // Use Eureka application name
        return restTemplate.getForObject(url, String.class);
    }

    // Send an email alert
    @PostMapping("/email")
    public ResponseEntity<String> sendEmail(@RequestBody EmailRequest emailRequest) {
        emailService.sendEmail(emailRequest.getTo(), emailRequest.getSubject(), emailRequest.getBody());
        return ResponseEntity.ok("Email sent successfully to " + emailRequest.getTo());
    }


}
