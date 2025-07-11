import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "./App";
import { useAuth } from "./AuthContext";
import { useChat } from "./ChatContext";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  Drawer,
  Divider,
  Avatar,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PersonIcon from "@mui/icons-material/Person";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import SettingsIcon from "@mui/icons-material/Settings";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import QuantaLogo from "./assets/QuantaLogo";

export default function Chat() {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const { user, isAuthenticated, logout } = useAuth();
  const {
    message,
    setMessage,
    chatLog,
    isLoading,
    commonQuestions,
    copiedMessageId,
    handleSendMessage,
    handleKeyPress,
    handleCommonQuestionClick,
    clearChat,
    copyMessage,
  } = useChat();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const chatBoxRef = useRef(null);

  useEffect(() => {
    chatBoxRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog]);

  const drawerWidth = 280;

  return (
    <Box sx={{ 
      display: "flex", 
        height: "100vh",
      backgroundColor: darkMode ? "#2d2d2d" : "#f7f7f8",
      transition: "background-color 0.3s ease"
    }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: sidebarOpen ? drawerWidth : 0,
          flexShrink: 0,
          transition: "width 0.3s ease",
          "& .MuiDrawer-paper": {
            width: sidebarOpen ? drawerWidth : 0,
            boxSizing: "border-box",
            backgroundColor: "#001925",
            color: "white",
            borderRight: darkMode ? "1px solid #404040" : "1px solid #4a4a4a",
            overflow: "hidden",
            transition: "width 0.3s ease",
          },
        }}
      >
        {/* Close button and title at top */}
        <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <IconButton
            onClick={() => setSidebarOpen(false)}
            sx={{
              color: "#8e8ea0",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.1)",
              },
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
          {sidebarOpen && (
            <Typography 
              variant="h6" 
              sx={{ 
                color: "#ffffff",
                fontWeight: 600,
                flexGrow: 1,
                textAlign: "center"
              }}
            >
              Quanta Club
            </Typography>
          )}
        </Box>
        <Divider sx={{ backgroundColor: "#4a4a4a" }} />
        {/* FAQ Questions - Always visible */}
        <Box sx={{ p: 2, flexGrow: 1 }}>
          <Typography variant="subtitle2" sx={{ color: "#8e8ea0", mb: 2 }}>
            Quick Questions:
        </Typography>
          <Stack spacing={1}>
            {commonQuestions.map((item, index) => (
              <Button
                key={index}
                variant="text"
                onClick={() => handleCommonQuestionClick(item.question, item.answer)}
                sx={{
                  justifyContent: "flex-start",
                  color: "#8e8ea0",
                  textTransform: "none",
                  fontSize: "0.875rem",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.1)",
                  },
                }}
              >
                {item.question}
              </Button>
            ))}
          </Stack>
        </Box>
        {/* Spacer to push clear button to bottom */}
        <Box sx={{ flexGrow: 1 }} />
        {/* User Status in Sidebar */}
        {isAuthenticated && (
          <Box sx={{ p: 2, borderTop: "1px solid #4a4a4a" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 2,
                py: 1,
                borderRadius: 2,
                backgroundColor: "rgba(76, 175, 80, 0.2)",
                border: "1px solid #4caf50",
              }}
            >
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: "#4caf50",
                  animation: "pulse 2s infinite",
                  "@keyframes pulse": {
                    "0%": { opacity: 1 },
                    "50%": { opacity: 0.5 },
                    "100%": { opacity: 1 },
                  },
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  color: "#4caf50",
                  fontWeight: 500,
                  fontSize: "0.7rem",
                }}
              >
                Logged in as {user?.email}
              </Typography>
            </Box>
          </Box>
        )}
        {/* Clear button at bottom */}
        <Box sx={{ p: 2 }}>
        <Button
            variant="text"
            startIcon={<DeleteIcon />}
            onClick={clearChat}
            sx={{
              width: "100%",
              color: "#8e8ea0",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.1)",
              },
            }}
          >
            Clear Chat
          </Button>
        </Box>
      </Drawer>
      {/* Main Chat Area */}
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <Box
          sx={{
            backgroundColor: darkMode ? "#1a1a1a" : "#ffffff",
            borderBottom: darkMode ? "1px solid #404040" : "1px solid #e5e5e5",
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            transition: "background-color 0.3s ease, border-color 0.3s ease"
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {!sidebarOpen && (
              <IconButton
                onClick={() => setSidebarOpen(true)}
                sx={{
                  color: darkMode ? "#e0e0e0" : "#666",
                  "&:hover": {
                    backgroundColor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                  },
                }}
              >
                <MenuIcon />
              </IconButton>
            )}
            {!sidebarOpen && (
              <Typography 
                variant="h6" 
                sx={{ 
                  color: darkMode ? "#ffffff" : "#1a1a1a",
                  fontWeight: 600
                }}
              >
                Quanta Club
              </Typography>
            )}
          </Box>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            {/* User Status Indicator */}
            {isAuthenticated && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: 2,
                  py: 0.5,
                  borderRadius: 2,
                  backgroundColor: darkMode ? "rgba(76, 175, 80, 0.2)" : "rgba(76, 175, 80, 0.1)",
                  border: `1px solid ${darkMode ? "#4caf50" : "#4caf50"}`,
                  mr: 1,
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: "#4caf50",
                    animation: "pulse 2s infinite",
                    "@keyframes pulse": {
                      "0%": { opacity: 1 },
                      "50%": { opacity: 0.5 },
                      "100%": { opacity: 1 },
                    },
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    color: darkMode ? "#4caf50" : "#2e7d32",
                    fontWeight: 500,
                    fontSize: "0.75rem",
                  }}
                >
                  {user?.email}
                </Typography>
              </Box>
            )}
            <IconButton
              onClick={toggleDarkMode}
              sx={{
                color: darkMode ? "#e0e0e0" : "#666",
                "&:hover": {
                  backgroundColor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                },
              }}
              title={darkMode ? "Light Mode" : "Dark Mode"}
            >
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
            {isAuthenticated && (
              <IconButton
                onClick={() => navigate("/admin")}
                sx={{
                  color: darkMode ? "#e0e0e0" : "#666",
                  "&:hover": {
                    backgroundColor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                  },
                }}
                title="Admin Panel"
              >
                <SettingsIcon />
              </IconButton>
            )}
            <IconButton
              onClick={isAuthenticated ? () => { logout(); navigate("/login"); } : () => navigate("/login")}
              sx={{
                color: darkMode ? "#e0e0e0" : "#666",
                "&:hover": {
                  backgroundColor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                },
              }}
              title={isAuthenticated ? "Logout" : "Login"}
            >
              {isAuthenticated ? <LogoutIcon /> : <LoginIcon />}
            </IconButton>
          </Box>
        </Box>
        {/* Chat Messages */}
        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            backgroundColor: darkMode ? "#2d2d2d" : "#ffffff",
            p: 0,
            transition: "background-color 0.3s ease"
          }}
        >
          {chatLog.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: darkMode ? "#8e8ea0" : "#8e8ea0",
              }}
            >
              {/* Logo above welcome message */}
              <Box sx={{ mb: 2 }}>
                <QuantaLogo size={100} />
              </Box>
              <Typography variant="h5" sx={{ mb: 1, color: darkMode ? "#ffffff" : "#1a1a1a" }}>
                How can I help you today?
              </Typography>
              <Typography variant="body1" sx={{ textAlign: "center", maxWidth: 400, color: darkMode ? "#e0e0e0" : "#666" }}>
                Ask me anything about Quanta Club, our services, or any general questions.
              </Typography>
            </Box>
          ) : (
            <Stack spacing={0}>
            {chatLog.map((msg, idx) => (
              <Box
                key={idx}
                sx={{
                    backgroundColor: msg.role === "user" 
                      ? (darkMode ? "#1a1a1a" : "#ffffff") 
                      : (darkMode ? "#2d2d2d" : "#f7f7f8"),
                    borderBottom: darkMode ? "1px solid #404040" : "1px solid #e5e5e5",
                    p: 3,
                    position: "relative",
                    transition: "background-color 0.3s ease, border-color 0.3s ease",
                    "&:hover": {
                      "& .copy-button": {
                        opacity: 1,
                      },
                    },
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: "800px",
                      margin: "0 auto",
                      display: "flex",
                      gap: 2,
                    }}
                  >
                    {msg.role === "user" ? (
                      <>
                        <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-end", width: "100%", minHeight: 40 }}>
                          {/* Message text */}
                          <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "flex-end", pr: 2 }}>
                            <Typography
                              variant="body1"
                              sx={{
                                color: darkMode ? "#ffffff" : "#1a1a1a",
                                lineHeight: 1.6,
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-word",
                                textAlign: "right",
                                maxWidth: "100%",
                              }}
                            >
                              {msg.content}
                            </Typography>
                          </Box>
                          {/* Avatar at far right */}
                          <Box sx={{ display: "flex", alignItems: "center", minWidth: 0 }}>
                            <Avatar
                              sx={{
                                backgroundColor: "#1976d2",
                                width: 32,
                                height: 32,
                              }}
                            >
                              <PersonIcon />
                            </Avatar>
                          </Box>
                        </Box>
                        {/* Copy button for user message */}
                        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                          <IconButton
                            className="copy-button"
                            onClick={() => copyMessage(msg.content, `user-${idx}`)}
                            size="small"
                            sx={{
                              opacity: 0,
                              transition: "opacity 0.2s",
                              backgroundColor: "rgba(255,255,255,0.9)",
                              "&:hover": {
                                backgroundColor: "rgba(255,255,255,1)",
                              },
                            }}
                          >
                            {copiedMessageId === `user-${idx}` ? (
                              <CheckIcon sx={{ color: "#1976d2", fontSize: 16 }} />
                            ) : (
                              <ContentCopyIcon sx={{ color: "#666", fontSize: 16 }} />
                            )}
                          </IconButton>
                        </Box>
                      </>
                    ) : (
                      <>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, flexGrow: 1 }}>
                          <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                            <Avatar
                              sx={{
                                backgroundColor: "#1a1a1a",
                                width: 32,
                                height: 32,
                              }}
                            >
                              <SmartToyIcon />
                            </Avatar>
                            <Typography
                              variant="subtitle2"
                              sx={{
                                color: darkMode ? "#ffffff" : "#1a1a1a",
                                fontWeight: 600,
                                fontSize: "1rem",
                                ml: 1,
                              }}
                            >
                              Quanta AI Chat Bot
                            </Typography>
                          </Box>
                          <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography
                                variant="body1"
                                sx={{
                                  color: darkMode ? "#ffffff" : "#1a1a1a",
                                  lineHeight: 1.6,
                                  whiteSpace: "pre-wrap",
                                  wordBreak: "break-word",
                                }}
                              >
                                {msg.content}
                              </Typography>
                            </Box>
                          </Box>
                          {/* Copy button for bot message */}
                          <Box sx={{ display: "flex", justifyContent: "flex-start", pl: 4 }}>
                            <IconButton
                              className="copy-button"
                              onClick={() => copyMessage(msg.content, `bot-${idx}`)}
                              size="small"
                              sx={{
                                opacity: 0,
                                transition: "opacity 0.2s",
                                backgroundColor: "rgba(255,255,255,0.9)",
                                "&:hover": {
                                  backgroundColor: "rgba(255,255,255,1)",
                                },
                              }}
                            >
                              {copiedMessageId === `bot-${idx}` ? (
                                <CheckIcon sx={{ color: "#1976d2", fontSize: 16 }} />
                              ) : (
                                <ContentCopyIcon sx={{ color: "#666", fontSize: 16 }} />
                              )}
                            </IconButton>
                          </Box>
                        </Box>
                      </>
                    )}
                  </Box>
              </Box>
            ))}
              {isLoading && (
                <Box
                  sx={{
                    backgroundColor: darkMode ? "#2d2d2d" : "#f7f7f8",
                    borderBottom: darkMode ? "1px solid #404040" : "1px solid #e5e5e5",
                    p: 3,
                    transition: "background-color 0.3s ease, border-color 0.3s ease"
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: "800px",
                      margin: "0 auto",
                      display: "flex",
                      gap: 2,
                      alignItems: "center",
                    }}
                  >
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: darkMode ? "#8e8ea0" : "#666",
                          fontSize: "0.75rem",
                          fontWeight: 500
                        }}
                      >
                        Quanta AI Chat Bot
                      </Typography>
                      <Avatar
                        sx={{
                          backgroundColor: "#1a1a1a",
                          width: 32,
                          height: 32,
                        }}
                      >
                        <SmartToyIcon />
                      </Avatar>
                    </Box>
                    <CircularProgress size={20} />
                  </Box>
                </Box>
              )}
              <div ref={chatBoxRef} />
            </Stack>
          )}
          </Box>
        {/* Input Area */}
        <Box
          sx={{
            backgroundColor: darkMode ? "#1a1a1a" : "#ffffff",
            borderTop: darkMode ? "1px solid #404040" : "1px solid #e5e5e5",
            p: 3,
            transition: "background-color 0.3s ease, border-color 0.3s ease"
          }}
        >
          <Box
            sx={{
              maxWidth: "800px",
              margin: "0 auto",
              position: "relative",
            }}
          >
          <TextField
            fullWidth
            multiline
            maxRows={4}
              placeholder="Message Quanta Club AI..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  backgroundColor: darkMode ? "#1a1a1a" : "#ffffff",
                  color: darkMode ? "#ffffff" : "#000000",
                  "& .MuiInputBase-input": {
                    color: darkMode ? "#ffffff" : "#000000",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: darkMode ? "#404040" : "#d0d0d0",
                  },
                  "&:hover": {
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#1976d2",
                    },
                  },
                  "&.Mui-focused": {
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#1976d2",
                    },
                  },
                },
              }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    color="primary"
                    onClick={handleSendMessage}
                      disabled={isLoading || !message.trim()}
                      sx={{
                        backgroundColor: message.trim() ? "#1976d2" : "#e5e5e5",
                        color: "white",
                        "&:hover": {
                          backgroundColor: message.trim() ? "#1565c0" : "#e5e5e5",
                        },
                        "&.Mui-disabled": {
                          backgroundColor: "#e5e5e5",
                          color: "#8e8ea0",
                        },
                      }}
                    >
                      {isLoading ? <CircularProgress size={20} /> : <SendIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          </Box>
        </Box>
      </Box>
    </Box>
  );
} 