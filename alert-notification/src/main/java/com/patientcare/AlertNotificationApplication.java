package com.patientcare;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class AlertNotificationApplication {
    public static void main(String[] args) {
        SpringApplication.run(AlertNotificationApplication.class, args);
    }
}

