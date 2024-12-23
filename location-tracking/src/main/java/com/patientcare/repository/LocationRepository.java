package com.patientcare.repository;

import com.patientcare.entity.Location;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;



@Repository
public interface LocationRepository extends MongoRepository<Location, Long> {
}
