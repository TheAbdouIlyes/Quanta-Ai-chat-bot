import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "./App";
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
import QuantaLogo from "./assets/QuantaLogo";

const API_BASE = "http://localhost:8000/api";

export default function Chat() {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [commonQuestions, setCommonQuestions] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState(null);

  const chatBoxRef = useRef(null);

  const fetchCommonQuestions = async () => {
    const res = await fetch(`${API_BASE}/common-questions/`);
    const data = await res.json();
    setCommonQuestions(data.questions || []);
  };

  useEffect(() => {
    chatBoxRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog]);

  useEffect(() => {
    fetchCommonQuestions();
  }, []);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    const userEntry = { role: "user", content: message };
    setChatLog((prev) => [...prev, userEntry]);
    setIsLoading(true);
    setMessage("");
    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (!response.ok) throw new Error("Server error");
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let botReply = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        botReply += decoder.decode(value);
        setChatLog((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last?.role === "bot") {
            last.content = botReply;
          } else {
            updated.push({ role: "bot", content: botReply });
          }
          return [...updated];
        });
      }
    } catch (err) {
      setChatLog((prev) => [
        ...prev,
        { role: "bot", content: "Error: " + err.message },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCommonQuestionClick = (q, a) => {
    setChatLog((prev) => [
      ...prev,
      { role: "user", content: q },
      { role: "bot", content: a },
    ]);
  };

  const clearChat = () => {
    setChatLog([]);
  };

  const copyMessage = async (content, messageId) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

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
            backgroundColor: darkMode ? "#1a1a1a" : "#202123",
            color: "white",
            borderRight: darkMode ? "1px solid #404040" : "1px solid #4a4a4a",
            overflow: "hidden",
            transition: "width 0.3s ease",
          },
        }}
      >
        {/* Close button at top */}
        <Box sx={{ p: 2, display: "flex", justifyContent: "flex-start" }}>
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
        </Box>
        <Divider sx={{ backgroundColor: "#4a4a4a" }} />
        {/* Admin button */}
        <Box sx={{ p: 2 }}>
          <Button
            variant="text"
            startIcon={<SettingsIcon />}
            onClick={() => navigate("/admin")}
            sx={{
              width: "100%",
              color: "#8e8ea0",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.1)",
              },
            }}
          >
            Admin Panel
          </Button>
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
            <IconButton
              onClick={() => setSidebarOpen(!sidebarOpen)}
              sx={{
                color: darkMode ? "#e0e0e0" : "#666",
                "&:hover": {
                  backgroundColor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                },
              }}
            >
              {sidebarOpen ? <ChevronLeftIcon /> : <MenuIcon />}
            </IconButton>
            <Typography 
              variant="h6" 
              sx={{ 
                color: darkMode ? "#ffffff" : "#1a1a1a",
                fontWeight: 600
              }}
            >
              Quanta Club
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
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
                        <Box sx={{ flexGrow: 1 }} />
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, maxWidth: "70%" }}>
                          <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography
                                variant="body1"
                                sx={{
                                  color: darkMode ? "#ffffff" : "#1a1a1a",
                                  lineHeight: 1.6,
                                  whiteSpace: "pre-wrap",
                                  wordBreak: "break-word",
                                  textAlign: "right",
                                }}
                              >
                                {msg.content}
                              </Typography>
                            </Box>
                            <Avatar
                              sx={{
                                backgroundColor: "#10a37f",
                                width: 32,
                                height: 32,
                              }}
                            >
                              <PersonIcon />
                            </Avatar>
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
                                <CheckIcon sx={{ color: "#10a37f", fontSize: 16 }} />
                              ) : (
                                <ContentCopyIcon sx={{ color: "#666", fontSize: 16 }} />
                              )}
                            </IconButton>
                          </Box>
                        </Box>
                      </>
                    ) : (
                      <>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, flexGrow: 1 }}>
                          <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                            <Avatar
                              sx={{
                                backgroundColor: "#1a1a1a",
                                width: 32,
                                height: 32,
                              }}
                            >
                              <SmartToyIcon />
                            </Avatar>
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
                                <CheckIcon sx={{ color: "#10a37f", fontSize: 16 }} />
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
                    <Avatar
                      sx={{
                        backgroundColor: "#1a1a1a",
                        width: 32,
                        height: 32,
                      }}
                    >
                      <SmartToyIcon />
                    </Avatar>
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
                      borderColor: "#10a37f",
                    },
                  },
                  "&.Mui-focused": {
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#10a37f",
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
                        backgroundColor: message.trim() ? "#10a37f" : "#e5e5e5",
                        color: "white",
                        "&:hover": {
                          backgroundColor: message.trim() ? "#0d8a6f" : "#e5e5e5",
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