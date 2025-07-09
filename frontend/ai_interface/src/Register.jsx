import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Paper,
} from "@mui/material";
import { useDarkMode } from "./App";
import QuantaLogo from "./assets/QuantaLogo";

const API_BASE = "http://localhost:8000/api";

export default function Register() {
  const navigate = useNavigate();
  const { darkMode } = useDarkMode();
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.email || !formData.username || !formData.password) {
      setMessage({ type: "error", text: "All fields are required" });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }

    if (formData.password.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters" });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch(`${API_BASE}/auth/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          username: formData.username,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          type: "success", 
          text: "Registration request submitted successfully! Please wait for admin approval. You will be able to login once your account is approved." 
        });
        setFormData({ email: "", username: "", password: "", confirmPassword: "" });
      } else {
        setMessage({ type: "error", text: data.error || "Registration failed" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: darkMode ? "#1a1a1a" : "#f5f5f5",
        p: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 400,
          width: "100%",
          backgroundColor: darkMode ? "#2d2d2d" : "#ffffff",
          color: darkMode ? "#ffffff" : "#000000",
        }}
      >
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <QuantaLogo size={60} />
          <Typography variant="h4" sx={{ mt: 2, mb: 1 }}>
            Register
          </Typography>
          <Typography variant="body2" sx={{ color: darkMode ? "#b0b0b0" : "#666" }}>
            Submit a registration request to join Quanta Club
          </Typography>
        </Box>

        {message.text && (
          <Alert severity={message.type === "error" ? "error" : "success"} sx={{ mb: 2 }}>
            {message.text}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            required
            sx={{
              "& .MuiOutlinedInput-root": {
                color: darkMode ? "#ffffff" : "#000000",
                "& fieldset": {
                  borderColor: darkMode ? "#555" : "#ccc",
                },
                "&:hover fieldset": {
                  borderColor: darkMode ? "#777" : "#999",
                },
              },
              "& .MuiInputLabel-root": {
                color: darkMode ? "#b0b0b0" : "#666",
              },
            }}
          />

          <TextField
            fullWidth
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            margin="normal"
            required
            sx={{
              "& .MuiOutlinedInput-root": {
                color: darkMode ? "#ffffff" : "#000000",
                "& fieldset": {
                  borderColor: darkMode ? "#555" : "#ccc",
                },
                "&:hover fieldset": {
                  borderColor: darkMode ? "#777" : "#999",
                },
              },
              "& .MuiInputLabel-root": {
                color: darkMode ? "#b0b0b0" : "#666",
              },
            }}
          />

          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            required
            sx={{
              "& .MuiOutlinedInput-root": {
                color: darkMode ? "#ffffff" : "#000000",
                "& fieldset": {
                  borderColor: darkMode ? "#555" : "#ccc",
                },
                "&:hover fieldset": {
                  borderColor: darkMode ? "#777" : "#999",
                },
              },
              "& .MuiInputLabel-root": {
                color: darkMode ? "#b0b0b0" : "#666",
              },
            }}
          />

          <TextField
            fullWidth
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            margin="normal"
            required
            sx={{
              "& .MuiOutlinedInput-root": {
                color: darkMode ? "#ffffff" : "#000000",
                "& fieldset": {
                  borderColor: darkMode ? "#555" : "#ccc",
                },
                "&:hover fieldset": {
                  borderColor: darkMode ? "#777" : "#999",
                },
              },
              "& .MuiInputLabel-root": {
                color: darkMode ? "#b0b0b0" : "#666",
              },
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
              backgroundColor: "#1976d2",
              "&:hover": {
                backgroundColor: "#1565c0",
              },
              "&:disabled": {
                backgroundColor: darkMode ? "#555" : "#ccc",
              },
            }}
          >
            {loading ? <CircularProgress size={24} /> : "Submit Registration Request"}
          </Button>

          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2" sx={{ color: darkMode ? "#b0b0b0" : "#666" }}>
              Already have an account?{" "}
              <Link
                to="/login"
                style={{
                  color: "#1976d2",
                  textDecoration: "none",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                Login here
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
} 