package com.patientcare.doctor.controller;

import com.patientcare.doctor.entity.Doctor;
import com.patientcare.doctor.service.DoctorService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Optional;

@Slf4j
@RestController
@AllArgsConstructor
@RequestMapping("/api/doctors")
@CrossOrigin(origins = "*")
public class DoctorController {

    private final DoctorService doctorService;
    @Autowired
    private RestTemplate restTemplate;

    @GetMapping("/{id}/patients")
    public String getPatientsByDoctorId(@PathVariable Long id) {
        String url = "http://patient/api/patients/doctor/" + id; // Appel du service Patient
        return restTemplate.getForObject(url, String.class);
    }

    @GetMapping("/user/{userId}/doctor")
    public ResponseEntity<Doctor> getDoctorInfoByUserId(@PathVariable Long userId) {
        String authServiceUrl = "http://auth-service/api/users/" + userId;

        try {
            ResponseEntity<String> userResponse = restTemplate.getForEntity(authServiceUrl, String.class);

            if (userResponse.getStatusCode() == HttpStatus.OK) {
                Optional<Doctor> doctor = doctorService.getDoctorByUserId(userId);

                if (doctor.isPresent()) {
                    return new ResponseEntity<>(doctor.get(), HttpStatus.OK);
                } else {
                    return new ResponseEntity<>(HttpStatus.NOT_FOUND);
                }
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.SERVICE_UNAVAILABLE);
        }
    }




    @GetMapping("/call-patient")
    public String callPatientService() {
        String url = "http://patient/api/patients"; // Use Eureka application name
        return restTemplate.getForObject(url, String.class);
    }

    // Get all doctors
    @GetMapping
    public List<Doctor> getAllDoctors() {
        return doctorService.getAllDoctors();
    }

    // Get a doctor by ID
    @GetMapping("/{id}")
    public ResponseEntity<Doctor> getDoctorById(@PathVariable Long id) {
        Optional<Doctor> doctor = doctorService.getDoctorById(id);
        if (doctor.isPresent()) {
            return new ResponseEntity<>(doctor.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Create a new doctor
    @PostMapping
    public ResponseEntity<Doctor> createDoctor(@RequestBody Doctor doctor) {
        Doctor createdDoctor = doctorService.createDoctor(doctor);
        return new ResponseEntity<>(createdDoctor, HttpStatus.CREATED);
    }

    // Update an existing doctor
    @PutMapping("/{id}")
    public ResponseEntity<Doctor> updateDoctor(@PathVariable Long id, @RequestBody Doctor doctor) {
        Optional<Doctor> existingDoctor = doctorService.getDoctorById(id);
        if (existingDoctor.isPresent()) {
            // Set the ID to ensure the correct doctor is updated
            doctor.setId(id);
            Doctor updatedDoctor = doctorService.updateDoctor(doctor);
            return new ResponseEntity<>(updatedDoctor, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Delete a doctor
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDoctor(@PathVariable Long id) {
        doctorService.deleteDoctor(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}