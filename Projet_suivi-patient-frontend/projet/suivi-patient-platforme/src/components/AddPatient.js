import React, { useState, useEffect } from "react";
import SideBare from "./SideBare";
import {
  Box,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Alert,
  IconButton,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material"; 
import axios from "axios";

const AddPatient = () => {
  const [patients, setPatients] = useState([]);
  const [open, setOpen] = useState(false);
  const [patientData, setPatientData] = useState({
    firstName: "",
    lastName: "",
    age: "",
    address: "",
    email: "",
    phone: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [editing, setEditing] = useState(false);
  const [editingPatientId, setEditingPatientId] = useState(null);
  const [doctorId, setDoctorId] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      axios
        .get(`http://localhost:8081/api/doctors/user/${userId}/doctor`)
        .then((response) => {
          const doctor = response.data;
          localStorage.setItem("doctorId", doctor.id);
          setDoctorId(doctor.id); 
        })
        .catch((error) => {
          console.error("Error fetching doctor data:", error);
          setErrorMessage("Failed to fetch doctor information.");
        });
    }
  }, []);

  useEffect(() => {
    if (doctorId) {
      axios
        .get(`http://localhost:8081/api/doctors/${doctorId}/patients`)
        .then((res) => setPatients(res.data))
        .catch((err) => {
          console.error("Error fetching patients:", err);
          setErrorMessage("Failed to fetch patients.");
        });
    }
  }, [doctorId, successMessage]);

  const handleClickOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
    setPatientData({
      firstName: "",
      lastName: "",
      age: "",
      address: "",
      email: "",
      phone: "",
    });
    setEditing(false);
    setEditingPatientId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPatientData({ ...patientData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!doctorId) {
      setErrorMessage("Doctor ID is not available.");
      return;
    }

    if (editing) {
      
      axios
        .put(`http://localhost:8080/api/patients/${editingPatientId}`, { ...patientData, doctorId })
        .then(() => {
          setSuccessMessage("Patient updated successfully!");
          setPatients((prevPatients) =>
            prevPatients.map((patient) =>
              patient.id === editingPatientId ? { ...patient, ...patientData } : patient
            )
          );
          handleClose();
        })
        .catch((error) => {
          console.error("Error updating patient:", error);
          setErrorMessage("Failed to update patient. Please try again.");
        });
    } else {
      
      axios
        .post("http://localhost:8080/api/patients", { ...patientData, doctorId })
        .then((response) => {
          setSuccessMessage("Patient added successfully!");
          setPatients([...patients, response.data]);
          handleClose();
        })
        .catch((error) => {
          console.error("Error adding patient:", error);
          setErrorMessage("Failed to add patient. Please try again.");
        });
    }
  };

  const handleEdit = (patient) => {
    setEditing(true);
    setEditingPatientId(patient.id);
    setPatientData({
      firstName: patient.firstName,
      lastName: patient.lastName,
      age: patient.age,
      address: patient.address,
      email: patient.email,
      phone: patient.phone,
    });
    setOpen(true);
  };

  const handleDelete = (id) => {
    axios
      .delete(`http://localhost:8080/api/patients/${id}`)
      .then(() => {
        setSuccessMessage("Patient deleted successfully!");
        setPatients((prevPatients) => prevPatients.filter((patient) => patient.id !== id));
      })
      .catch((error) => {
        console.error("Error deleting patient:", error);
        setErrorMessage("Failed to delete patient. Please try again.");
      });
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ width: "240px", flexShrink: 0 }}>
        <SideBare />
      </div>
      <Box sx={{ padding: 4, flexGrow: 1, overflow: "auto", marginLeft: "115px" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            marginBottom: "6%",
          }}
        >
          <Typography variant="h4">My Patients</Typography>
          <Button variant="contained" color="primary" onClick={handleClickOpen}>
            Add Patient
          </Button>
        </Box>

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <Grid container spacing={3}>
          {Array.isArray(patients) &&
            patients.map((patient) => (
              <Grid item xs={12} sm={6} md={4} key={patient.id}>
                <Card sx={{ boxShadow: "-5px 14px 11px rgba(36, 21, 20, 0.1)" }}>
                  <CardContent>
                    <Typography variant="h6">
                      {patient.firstName} {patient.lastName}
                    </Typography>
                    <Typography>Age: {patient.age}</Typography>
                    <Typography>Address: {patient.address}</Typography>
                    <Typography>Email: {patient.email}</Typography>
                    <Typography>Phone: {patient.phone}</Typography>
                  </CardContent>
                  <CardActions>
                    <IconButton color="primary" onClick={() => handleEdit(patient)}>
                      <Edit />
                    </IconButton>
                    <IconButton color="secondary" onClick={() => handleDelete(patient.id)}>
                      <Delete />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
        </Grid>

        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>{editing ? "Edit Patient" : "Add Patient"}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="First Name"
              name="firstName"
              value={patientData.firstName}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              margin="dense"
              label="Last Name"
              name="lastName"
              value={patientData.lastName}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              margin="dense"
              type="number"
              label="Age"
              name="age"
              value={patientData.age}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              margin="dense"
              label="Address"
              name="address"
              value={patientData.address}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              margin="dense"
              label="Email"
              name="email"
              value={patientData.email}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              margin="dense"
              label="Phone"
              name="phone"
              value={patientData.phone}
              onChange={handleChange}
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="secondary">
              Cancel
            </Button>
            <Button onClick={handleSubmit} color="primary">
              {editing ? "Update" : "Add"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </div>
  );
};

export default AddPatient;
