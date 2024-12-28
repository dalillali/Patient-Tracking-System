import React, { useState, useEffect } from "react";
import SideBare from "./SideBare";
import axios from "axios";
import "./css/Aceuill.css";
import Image from "./assets/Doctor.png";
import {
  CircularProgress,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const Aceuill = () => {
  const Name = localStorage.getItem("Name");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [doctorid, setDoctorid] = useState(null);
  

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      axios
        .get(`http://localhost:8081/api/doctors/user/${userId}/doctor`)
        .then((response) => {
          const doctor = response.data;
          localStorage.setItem("doctorId", doctor.id);
          setDoctorid(doctor.id);
        })
        .catch((error) => {
          console.error("Error fetching doctor data:", error);
        });
    }
  }, []); 
  
  useEffect(() => {
    if (doctorid) {
      const fetchPatients = () => {
        axios
          .get(`http://localhost:8081/api/doctors/${doctorid}/patients`)
          .then((response) => {
            if (response.data && Array.isArray(response.data)) {
              setPatients(response.data);
            } else {
              console.error("Invalid data received:", response.data);
              setError("Invalid data received from API");
            }
            setLoading(false);
          })
          .catch((error) => {
            console.error("Error fetching patients:", error);
            setError("Failed to load patients");
            setLoading(false);
          });
      };
  
      fetchPatients();
    }
  }, [doctorid]);
  

  const handleViewLocation = (firstName, lastName, patientId) => {
    if (!patientId) {
      console.error("Patient ID is missing.");
      return;
    }
    localStorage.setItem("patientFirstName", firstName);
    localStorage.setItem("patientLastName", lastName);
    navigate(`/map/${patientId}`);
  };

  return (
    <div className="page-containerr">
      <div className="sidebar">
        <SideBare />
      </div>
      <div className="mainn-content">
        <div className="health-bag-banner">
          <div className="banner-content">
            <h2>
              Welcome back, <span className="highlight">{Name}</span>
            </h2>
          </div>
          <div className="banner-image">
            <img src={Image} alt="Doctor" />
          </div>
        </div>
        <div style={{ margin: "20px" }}>
          <center>
            <h2>Your Patients</h2>
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                <CircularProgress />
              </Box>
            ) : error ? (
              <Typography variant="body1" color="error" align="center">
                {error} {/* Affiche l'erreur si elle existe */}
              </Typography>
            ) : patients && patients.length > 0 ? (
              <TableContainer className="table-container" component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>First Name</strong></TableCell>
                      <TableCell><strong>Last Name</strong></TableCell>
                      <TableCell><strong>Age</strong></TableCell>
                      <TableCell><strong>Email</strong></TableCell>
                      <TableCell><strong>Phone</strong></TableCell>
                      <TableCell><strong>Action</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {patients.map((patient, index) => (
                      <TableRow key={index}>
                        <TableCell>{patient.firstName}</TableCell>
                        <TableCell>{patient.lastName}</TableCell>
                        <TableCell>{patient.age}</TableCell>
                        <TableCell>{patient.email}</TableCell>
                        <TableCell>{patient.phone}</TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleViewLocation(patient.firstName, patient.lastName, patient.id)}
                          >
                            View Location
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body1" align="center">
                No patients assigned to you.
              </Typography>
            )}
          </center>
        </div>
      </div>
    </div>
  );
};

export default Aceuill;
