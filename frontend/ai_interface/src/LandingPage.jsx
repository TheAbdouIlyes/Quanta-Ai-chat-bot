import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "./App";
import {
  Box,
  Button,
  Typography,
  Container,
  Fade,
  Zoom,
  IconButton,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import QuantaLogo from "./assets/QuantaLogo";

export default function LandingPage() {
  const navigate = useNavigate();
  const { darkMode } = useDarkMode();
  const [isLogoVisible, setIsLogoVisible] = useState(false);
  const [isButtonVisible, setIsButtonVisible] = useState(false);

  // Animate logo and button on mount
  React.useEffect(() => {
    const timer1 = setTimeout(() => setIsLogoVisible(true), 300);
    const timer2 = setTimeout(() => setIsButtonVisible(true), 1200);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const handleGetStarted = () => {
    // Add a small delay for smooth transition
    setTimeout(() => {
      navigate("/chat");
    }, 200);
  };

  return (
    <Container
      maxWidth={false}
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: darkMode ? "#181818" : "#f7f7f8",
        transition: "background-color 0.3s ease",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background gradient effect */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: darkMode
            ? "radial-gradient(circle at center, rgba(25, 118, 210, 0.1) 0%, transparent 70%)"
            : "radial-gradient(circle at center, rgba(25, 118, 210, 0.05) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Quanti-Ai Name - Top Left */}
      <Fade in={isLogoVisible} timeout={1000} style={{ transitionDelay: "400ms" }}>
        <Box
          sx={{
            position: "absolute",
            top: 40,
            left: 40,
            display: "flex",
            alignItems: "center",
            gap: 1,
            zIndex: 2,
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 600,
              color: darkMode ? "#ffffff" : "#000000",
              fontSize: "1.5rem",
              letterSpacing: "-0.01em",
              fontFamily: "'Inter', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
              textShadow: darkMode ? "0 0 20px rgba(255, 255, 255, 0.1)" : "none",
            }}
          >
            Quanti-Ai
          </Typography>
          <SmartToyIcon
            sx={{
              fontSize: "1.8rem",
              color: darkMode ? "#ffffff" : "#000000",
              filter: darkMode ? "brightness(0.9)" : "none",
            }}
          />
        </Box>
      </Fade>

      {/* Main content */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          zIndex: 1,
          position: "relative",
        }}
      >
        {/* Logo Container */}
        <Fade in={isLogoVisible} timeout={1000}>
          <Box sx={{ mb: 6 }}>
            <Zoom in={isLogoVisible} timeout={800}>
              <Box>
                <QuantaLogo size={450} />
              </Box>
            </Zoom>
          </Box>
        </Fade>

        {/* Get Started Button */}
        <Fade in={isButtonVisible} timeout={800}>
          <Zoom in={isButtonVisible} timeout={600}>
            <Button
              variant="contained"
              size="large"
              onClick={handleGetStarted}
              startIcon={<PlayArrowIcon />}
              sx={{
                background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
                color: "white",
                fontSize: "1.2rem",
                fontWeight: 600,
                px: 5,
                py: 1.8,
                borderRadius: "25px",
                textTransform: "none",
                boxShadow: "0 4px 20px rgba(25, 118, 210, 0.3)",
                transition: "all 0.3s ease",
                "&:hover": {
                  background: "linear-gradient(135deg, #1565c0 0%, #1976d2 100%)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 25px rgba(25, 118, 210, 0.4)",
                },
                "&:active": {
                  transform: "translateY(0)",
                },
              }}
            >
              Start Chatting
            </Button>
          </Zoom>
        </Fade>
      </Box>
    </Container>
  );
} 