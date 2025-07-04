import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "./App";
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Stack,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  Snackbar,
  AppBar,
  Toolbar,
  Avatar,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ChatIcon from "@mui/icons-material/Chat";
import SettingsIcon from "@mui/icons-material/Settings";
import UploadIcon from "@mui/icons-material/Upload";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import FolderIcon from "@mui/icons-material/Folder";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";


const API_BASE = "http://localhost:8000/api";

export default function AdminPanel() {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [commonQuestions, setCommonQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [newLink, setNewLink] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  useEffect(() => {
    fetchCommonQuestions();
    fetchFiles();
  }, []);

  const fetchCommonQuestions = async () => {
    const res = await fetch(`${API_BASE}/common-questions/`);
    const data = await res.json();
    setCommonQuestions(data.questions || []);
  };

  const fetchFiles = async () => {
    const res = await fetch(`${API_BASE}/files/`);
    const data = await res.json();
    setUploadedFiles(data);
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleAddFAQ = async () => {
    if (!newQuestion.trim() || !newAnswer.trim()) {
      showSnackbar("❌ Question and answer are required.", "error");
      return;
    }

    const res = await fetch(`${API_BASE}/add-common-question/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: newQuestion.trim(),
        answer: newAnswer.trim(),
      }),
    });

    const data = await res.json();

    if (res.ok) {
      showSnackbar("✅ Common question added successfully!");
      setNewQuestion("");
      setNewAnswer("");
      setNewLink("");
      fetchCommonQuestions();
    } else {
      showSnackbar(data.error || "❌ Failed to add question.", "error");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      showSnackbar("❌ Please select a file to upload.", "error");
      return;
    }
    
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE}/admin/upload_doc`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    showSnackbar(data.message || "✅ File uploaded successfully!");
    setFile(null);
    fetchFiles();
  };

  const handleDeleteFile = async (id) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;

    const res = await fetch(`${API_BASE}/delete-file/${id}/`, {
      method: "DELETE",
    });

    const data = await res.json();
    showSnackbar(data.message || "✅ File deleted successfully!");
    fetchFiles();
  };



  return (
    <Box sx={{ 
      height: "100vh", 
      backgroundColor: darkMode ? "#2d2d2d" : "#f7f7f8",
      transition: "background-color 0.3s ease"
    }}>
      {/* Header */}
      <AppBar position="static" sx={{ 
        backgroundColor: darkMode ? "#1a1a1a" : "#ffffff", 
        color: darkMode ? "#ffffff" : "#1a1a1a", 
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        transition: "background-color 0.3s ease, color 0.3s ease"
      }}>
        <Toolbar>
          <IconButton
            edge="start"
            onClick={() => navigate("/")}
            sx={{ mr: 2, color: darkMode ? "#e0e0e0" : "#666" }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            <SettingsIcon sx={{ mr: 1, verticalAlign: "middle" }} />
            Admin Panel
          </Typography>
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
            <Button
              variant="outlined"
              startIcon={<ChatIcon />}
              onClick={() => navigate("/")}
              sx={{ 
                color: "#10a37f", 
                borderColor: "#10a37f",
                "&:hover": {
                  borderColor: "#0d8a6f",
                  backgroundColor: "rgba(16, 163, 127, 0.1)"
                }
              }}
            >
              Back to Chat
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container sx={{ 
        mt: 4, 
        mb: 4, 
        height: "calc(100vh - 120px)",
        display: "flex", 
        gap: 3,
        maxWidth: "100%",
        px: 2
      }}>
        {/* FAQ Management Section */}
        <Card sx={{ 
          flex: "0 0 40%",
          height: "100%", 
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          backgroundColor: darkMode ? "#1a1a1a" : "#ffffff",
          transition: "background-color 0.3s ease",
          display: "flex",
          flexDirection: "column"
        }}>
              <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <QuestionAnswerIcon sx={{ mr: 1, color: "#10a37f" }} />
                                  <Typography variant="h6" sx={{ fontWeight: 600, color: darkMode ? "#ffffff" : "#1a1a1a" }}>
                  FAQ Management
                </Typography>
                </Box>
                
                <Stack spacing={2} sx={{ mb: 3 }}>
                  <TextField
                    label="Question"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    fullWidth
                    variant="outlined"
                    placeholder="Enter a common question..."
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: darkMode ? "#1a1a1a" : "#ffffff",
                        color: darkMode ? "#ffffff" : "#000000",
                        "& .MuiInputBase-input": {
                          color: darkMode ? "#ffffff" : "#000000",
                        },
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: darkMode ? "#404040" : "#d0d0d0",
                        },
                        "& .MuiInputLabel-root": {
                          color: darkMode ? "#e0e0e0" : "#666",
                        },
                      },
                    }}
                  />
                  <TextField
                    label="Answer"
                    value={newAnswer}
                    onChange={(e) => setNewAnswer(e.target.value)}
                    fullWidth
                    multiline
                    rows={3}
                    variant="outlined"
                    placeholder="Enter the answer..."
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: darkMode ? "#1a1a1a" : "#ffffff",
                        color: darkMode ? "#ffffff" : "#000000",
                        "& .MuiInputBase-input": {
                          color: darkMode ? "#ffffff" : "#000000",
                        },
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: darkMode ? "#404040" : "#d0d0d0",
                        },
                        "& .MuiInputLabel-root": {
                          color: darkMode ? "#e0e0e0" : "#666",
                        },
                      },
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddFAQ}
                    sx={{ 
                      backgroundColor: "#10a37f",
                      "&:hover": { backgroundColor: "#0d8a6f" }
                    }}
                    startIcon={<QuestionAnswerIcon />}
                  >
                    Add FAQ
                  </Button>
                </Stack>

                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: darkMode ? "#ffffff" : "#1a1a1a" }}>
                  Current FAQs ({commonQuestions.length})
                </Typography>
                
                <Box sx={{ 
                  flexGrow: 1, 
                  overflowY: "auto", 
                  minHeight: 0,
                  maxHeight: "calc(100vh - 400px)",
                  "&::-webkit-scrollbar": {
                    width: "8px",
                  },
                  "&::-webkit-scrollbar-track": {
                    backgroundColor: darkMode ? "#2d2d2d" : "#f1f1f1",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: darkMode ? "#666" : "#c1c1c1",
                    borderRadius: "4px",
                  },
                }}>
                  {commonQuestions.map((item, idx) => (
                    <Paper key={idx} sx={{ 
                      p: 2, 
                      mb: 1, 
                      backgroundColor: darkMode ? "#2d2d2d" : "#f8f9fa",
                      transition: "background-color 0.3s ease"
                    }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: darkMode ? "#ffffff" : "#1a1a1a" }}>
                        Q: {item.question}
                      </Typography>
                      <Typography variant="body2" sx={{ color: darkMode ? "#e0e0e0" : "#666" }}>
                        A: {item.answer}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              </CardContent>
            </Card>

        {/* File Upload Section */}
        <Card sx={{ 
          flex: "0 0 60%",
          height: "100%", 
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          backgroundColor: darkMode ? "#1a1a1a" : "#ffffff",
          transition: "background-color 0.3s ease",
          display: "flex",
          flexDirection: "column"
        }}>
              <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <UploadIcon sx={{ mr: 1, color: "#10a37f" }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: darkMode ? "#ffffff" : "#1a1a1a" }}>
                    Document Upload
                  </Typography>
                </Box>
                
                <Paper sx={{ 
                  p: 2, 
                  mb: 3, 
                  backgroundColor: darkMode ? "#2d2d2d" : "#f8f9fa",
                  transition: "background-color 0.3s ease"
                }}>
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                    accept=".pdf,.docx,.txt"
                    style={{ 
                      marginBottom: "16px",
                      color: darkMode ? "#ffffff" : "#000000"
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleUpload}
                    disabled={!file}
                    sx={{ 
                      backgroundColor: "#10a37f",
                      "&:hover": { backgroundColor: "#0d8a6f" }
                    }}
                    startIcon={<UploadIcon />}
                  >
                    Upload Document
                  </Button>
                </Paper>

                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <FolderIcon sx={{ mr: 1, color: "#10a37f" }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: darkMode ? "#ffffff" : "#1a1a1a" }}>
                    Uploaded Files ({uploadedFiles.length})
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  flexGrow: 1, 
                  overflowY: "auto", 
                  minHeight: 0,
                  maxHeight: "calc(100vh - 400px)",
                  "&::-webkit-scrollbar": {
                    width: "8px",
                  },
                  "&::-webkit-scrollbar-track": {
                    backgroundColor: darkMode ? "#2d2d2d" : "#f1f1f1",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: darkMode ? "#666" : "#c1c1c1",
                    borderRadius: "4px",
                  },
                }}>
                  {uploadedFiles.map((file) => (
                    <Paper key={file.id} sx={{ 
                      p: 2, 
                      mb: 1, 
                      backgroundColor: darkMode ? "#2d2d2d" : "#f8f9fa",
                      transition: "background-color 0.3s ease"
                    }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: darkMode ? "#ffffff" : "#1a1a1a" }}>
                            {file.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: darkMode ? "#e0e0e0" : "#666" }}>
                            {file.path}
                          </Typography>
                        </Box>
                        <IconButton
                          onClick={() => handleDeleteFile(file.id)}
                          sx={{ color: "#d32f2f" }}
                          title="Delete File"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              </CardContent>
            </Card>
        </Container>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
} 