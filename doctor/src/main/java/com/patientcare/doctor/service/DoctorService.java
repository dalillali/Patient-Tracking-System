package com.patientcare.doctor.service;

import com.patientcare.doctor.entity.Doctor;
import com.patientcare.doctor.repository.DoctorRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@AllArgsConstructor
@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;

    public Optional<Doctor> getDoctorByUserId(Long userId) {
        return doctorRepository.findByUserId(userId); // Implémentation du repository
    }

    // Get all doctors
    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    // Get a doctor by ID
    public Optional<Doctor> getDoctorById(Long id) {
        return doctorRepository.findById(id);
    }

    // Create a new doctor
    public Doctor createDoctor(Doctor doctor) {
        return doctorRepository.save(doctor);
    }

    // Update an existing doctor
    public Doctor updateDoctor(Doctor doctor) {
        return doctorRepository.save(doctor);
    }

    // Delete a doctor
    public void deleteDoctor(Long id) {
        doctorRepository.deleteById(id);
    }
}