package com.patientcare.entity;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;

import java.time.LocalDateTime;

@Getter
@Setter
@Document(collection = "locations")
@Data
public class Location {

    @Id
    private String id;

    private double latitude;
    private double longitude;
    private LocalDateTime timestamp;
    private String trackerId;
}