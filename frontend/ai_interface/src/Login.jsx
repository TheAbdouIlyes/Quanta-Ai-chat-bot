import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { Link as MuiLink } from "@mui/material";
import { useDarkMode } from "./App";
import { useAuth } from "./AuthContext";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Card,
  CardContent,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import EmailIcon from "@mui/icons-material/Email";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";

const API_BASE = "http://localhost:8000/api";

export default function Login() {
  const navigate = useNavigate();
  const { darkMode } = useDarkMode();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/auth/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Use the login function from AuthContext
        login(data.user, {
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        });
        
        // Navigate to admin panel
        navigate("/admin");
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: darkMode ? "#2d2d2d" : "#f7f7f8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background-color 0.3s ease",
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            backgroundColor: darkMode ? "#3d3d3d" : "#ffffff",
            boxShadow: darkMode ? "0 8px 32px rgba(0,0,0,0.3)" : "0 8px 32px rgba(0,0,0,0.1)",
            borderRadius: 3,
            transition: "all 0.3s ease",
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Box
                sx={{
                  backgroundColor: darkMode ? "#4a90e2" : "#1976d2",
                  borderRadius: "50%",
                  p: 1,
                  mb: 2,
                }}
              >
                <LockOutlinedIcon
                  sx={{ color: "white", fontSize: 32 }}
                />
              </Box>
              <Typography
                component="h1"
                variant="h4"
                sx={{
                  color: darkMode ? "#ffffff" : "#333333",
                  fontWeight: 600,
                  mb: 1,
                }}
              >
                Login
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: darkMode ? "#cccccc" : "#666666",
                  textAlign: "center",
                }}
              >
                Enter your credentials to access Quanta Club
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={formData.email}
                onChange={handleInputChange}
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: darkMode ? "#4a4a4a" : "#fafafa",
                    "& fieldset": {
                      borderColor: darkMode ? "#666666" : "#e0e0e0",
                    },
                    "&:hover fieldset": {
                      borderColor: darkMode ? "#888888" : "#bdbdbd",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: darkMode ? "#4a90e2" : "#1976d2",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: darkMode ? "#cccccc" : "#666666",
                  },
                  "& .MuiInputBase-input": {
                    color: darkMode ? "#ffffff" : "#333333",
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: darkMode ? "#cccccc" : "#666666" }} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleInputChange}
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: darkMode ? "#4a4a4a" : "#fafafa",
                    "& fieldset": {
                      borderColor: darkMode ? "#666666" : "#e0e0e0",
                    },
                    "&:hover fieldset": {
                      borderColor: darkMode ? "#888888" : "#bdbdbd",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: darkMode ? "#4a90e2" : "#1976d2",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: darkMode ? "#cccccc" : "#666666",
                  },
                  "& .MuiInputBase-input": {
                    color: darkMode ? "#ffffff" : "#333333",
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? (
                          <VisibilityOffIcon sx={{ color: darkMode ? "#cccccc" : "#666666" }} />
                        ) : (
                          <VisibilityIcon sx={{ color: darkMode ? "#cccccc" : "#666666" }} />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  backgroundColor: darkMode ? "#4a90e2" : "#1976d2",
                  "&:hover": {
                    backgroundColor: darkMode ? "#357abd" : "#1565c0",
                  },
                  "&:disabled": {
                    backgroundColor: darkMode ? "#666666" : "#cccccc",
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: "white" }} />
                ) : (
                  "Sign In"
                )}
              </Button>

              <Box sx={{ textAlign: "center", mt: 2 }}>
                <Typography variant="body2" sx={{ color: darkMode ? "#cccccc" : "#666666", mb: 1 }}>
                  Don't have an account?{" "}
                  <MuiLink
                    component={RouterLink}
                    to="/register"
                    sx={{
                      color: darkMode ? "#4a90e2" : "#1976d2",
                      textDecoration: "none",
                      "&:hover": {
                        textDecoration: "underline",
                      },
                    }}
                  >
                    Register here
                  </MuiLink>
                </Typography>
                <MuiLink
                  href="#"
                  variant="body2"
                  sx={{
                    color: darkMode ? "#4a90e2" : "#1976d2",
                    textDecoration: "none",
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                  onClick={() => navigate("/")}
                >
                  Back to Chat
                </MuiLink>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
} 