import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Button,
  CssBaseline,
  TextField,
  Box,
  Container,
  ThemeProvider,
  createTheme,
  Card,
  CardContent,
  CardMedia,
  LinearProgress,
} from "@mui/material";
import Logo from './assets/logo.png';

function Signup() {
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [phone, setPhone] = useState("");
  const [userId, setUserId] = useState(null); 
  
  const [errors, setErrors] = useState({ email: "", password: "" });
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

  const validateSignup = () => {
    const tempErrors = {
      email: emailRegex.test(email) ? "" : "Invalid email address.",
      password:
        password === confirmPassword
          ? passwordRegex.test(password)
            ? ""
            : "Password must contain at least 8 characters, including uppercase, lowercase, and a number."
          : "Passwords do not match.",
    };
    setErrors(tempErrors);
    return Object.values(tempErrors).every((err) => err === "");
  };

  const handleSignup = (e) => {
    e.preventDefault();
    if (validateSignup()) {
      const user = { username, email, password };
      axios
        .post("http://localhost:8090/api/users/signup", user)
        .then((res) => {
          const userId = res.data.id;
          setUserId(userId);
          setStep(2);
        })
        .catch((err) => {
          console.error("Signup error:", err);
          alert("Signup failed. Please try again.");
        });
    }
  };
  
  const handleAdditionalInfoSubmit = (e) => {
    e.preventDefault();
    if (!userId) {
      alert("User ID is missing. Please sign up again.");
      return;
    }
  
    const doctorInfo = { email,firstName, lastName, specialty, phone, userId }; 
  
    axios
      .post("http://localhost:8081/api/doctors", doctorInfo)
      .then((response) => {
        alert("Information saved successfully!");
        navigate("/login"); 
      })
      .catch((error) => {
        console.error("Error saving additional info:", error);
        alert("Failed to save information.");
      });
  };

  const progress = step === 1 ? 50 : 100;

  return (
    <ThemeProvider theme={createTheme()}>
      <Container component="main" maxWidth="md" sx={{ marginTop: "6%" }}>
        <CssBaseline />
        <Card sx={{ display: 'flex', flexDirection: 'row', height: "85vh", borderRadius: '10px', boxShadow: 3, width: '100%' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', width: '50%', padding: 3 }}>
            <CardContent sx={{ flex: 1, padding: 0 }}>
              
              <LinearProgress variant="determinate" value={progress} sx={{ mb: 2,height:'8px',borderRadius:'8px' }} />

              {step === 1 && (
                <Box component="form" sx={{marginTop: '13%'}} onSubmit={handleSignup} noValidate>
                  <center><h2>Sign Up</h2></center>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="username"
                    label="Username"
                    name="username"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={!!errors.email}
                    helperText={errors.email}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={!!errors.password}
                    helperText={errors.password}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                    Sign Up
                  </Button>
                </Box>
              )}

              {step === 2 && (
                <Box component="form" sx={{marginTop:'13%'}} onSubmit={handleAdditionalInfoSubmit} noValidate>
                  <center><h2>Additional Information</h2></center>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="firstName"
                    label="First Name"
                    name="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="lastName"
                    label="Last Name"
                    name="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="specialty"
                    label="Specialty"
                    name="specialty"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="phone"
                    label="Phone Number"
                    name="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                    Save Information
                  </Button>
                </Box>
              )}
            </CardContent>
          </Box>
          <CardMedia component="img" sx={{ width: '50%', height: '62%', marginTop: '11vh' }} image={Logo} alt="Logo" />
        </Card>
      </Container>
    </ThemeProvider>
  );
}

export default Signup;
