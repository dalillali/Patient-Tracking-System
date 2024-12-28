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
  CardMedia
} from "@mui/material";
import Logo from './assets/logo.png';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrors({
        email: !email ? "Email is required." : "",
        password: !password ? "Password is required." : "",
      });
      return;
    }

    axios.post("http://localhost:8090/api/users/login", { email, password })
      .then((res) => {
        localStorage.setItem("userId", res.data.userId);
        console.log(res.data.userId);
        localStorage.setItem("userRole", res.data.userRole);
        localStorage.setItem("Name", res.data.username);
        console.log(res)

        if(res.data.userRole === "admin"){
          navigate("/Admin");
        }else{
          navigate("/Aceuill");
        }
        
      })
      .catch((err) => {
        console.error("Login error:", err);
        alert("Login failed. Please check your credentials.");
      });
  };

  return (
    <ThemeProvider theme={createTheme()}>
      <Container component="main" maxWidth="md" sx={{ marginTop: "6%" }}>
        <CssBaseline />
        <Card sx={{ display: 'flex', flexDirection: 'row', height: "65vh", borderRadius: '10px', boxShadow: 3, width: '100%' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', width: '50%', padding: 3 }}>
            <CardContent sx={{ flex: 1, padding: 0 }}>
              <center><h2 >Login</h2></center>
              <Box sx={{marginTop: "20%"}} component="form" onSubmit={handleLogin} noValidate>
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
                <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                  Login
                </Button>
              </Box>
            </CardContent>
          </Box>
          <CardMedia component="img" sx={{ width: '50%', height:'80%' }} image={Logo} alt="Logo" />
        </Card>
      </Container>
    </ThemeProvider>
  );
}

export default Login;
