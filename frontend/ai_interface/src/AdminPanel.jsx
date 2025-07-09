import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "./App";
import { useAuth } from "./AuthContext";
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
import EditIcon from "@mui/icons-material/Edit";


const API_BASE = "http://localhost:8000/api";

export default function AdminPanel() {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const { user, getAuthHeaders } = useAuth();
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
  const [editingFAQ, setEditingFAQ] = useState(null);
  const [editQuestion, setEditQuestion] = useState("");
  const [editAnswer, setEditAnswer] = useState("");
  const [registrationRequests, setRegistrationRequests] = useState([]);
  const [adminAccounts, setAdminAccounts] = useState([]);
  const [isUploading, setIsUploading] = useState(false);


  useEffect(() => {
    fetchCommonQuestions();
    fetchFiles();
    fetchRegistrationRequests();
    fetchAdminAccounts();
  }, []);

  const fetchCommonQuestions = async () => {
    const res = await fetch(`${API_BASE}/common-questions/`);
    const data = await res.json();
    setCommonQuestions(data.questions || []);
  };

  const fetchFiles = async () => {
    try {
      const res = await fetch(`${API_BASE}/files/`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setUploadedFiles(Array.isArray(data) ? data : (data.files || []));
      } else {
        console.error('Failed to fetch files:', res.status);
        setUploadedFiles([]);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      setUploadedFiles([]);
    }
  };

  const fetchRegistrationRequests = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/registration-requests/`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      setRegistrationRequests(data.requests || []);
    } catch (error) {
      setRegistrationRequests([]);
    }
  };

  const fetchAdminAccounts = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/accounts/`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      setAdminAccounts(data.admins || []);
    } catch (error) {
      setAdminAccounts([]);
    }
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
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
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

  const handleEditClick = (item) => {
    setEditingFAQ(item.id);
    setEditQuestion(item.question);
    setEditAnswer(item.answer);
  };

  const handleEditCancel = () => {
    setEditingFAQ(null);
    setEditQuestion("");
    setEditAnswer("");
  };

  const handleEditSave = async (id) => {
    if (!editQuestion.trim() || !editAnswer.trim()) {
      showSnackbar("❌ Question and answer are required for editing.", "error");
      return;
    }

    const res = await fetch(`${API_BASE}/update-common-question/${id}/`, {
      method: "PUT",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: editQuestion.trim(),
        answer: editAnswer.trim(),
      }),
    });

    const data = await res.json();

    if (res.ok) {
      showSnackbar("✅ Common question updated successfully!");
      setEditingFAQ(null);
      setEditQuestion("");
      setEditAnswer("");
      fetchCommonQuestions();
    } else {
      showSnackbar(data.error || "❌ Failed to update question.", "error");
    }
  };

  const handleDeleteFAQ = async (id) => {
    if (!window.confirm("Are you sure you want to delete this FAQ?")) return;

    const res = await fetch(`${API_BASE}/delete-common-question/${id}/`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    const data = await res.json();
    showSnackbar(data.message || "✅ FAQ deleted successfully!");
    fetchCommonQuestions();
  };

  const handleApproveRegistration = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/admin/approve-registration/${id}/`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      showSnackbar(data.message || "✅ Registration approved!");
      fetchRegistrationRequests();
      fetchAdminAccounts();
    } catch (error) {
      showSnackbar("Failed to approve registration", "error");
    }
  };

  const handleDeclineRegistration = async (id) => {
    const reason = prompt("Please provide a reason for declining this registration request:");
    if (!reason) return;
    try {
      const res = await fetch(`${API_BASE}/admin/decline-registration/${id}/`, {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      showSnackbar(data.message || "✅ Registration declined!");
      fetchRegistrationRequests();
    } catch (error) {
      showSnackbar("Failed to decline registration", "error");
    }
  };

  const handleDeleteAdmin = async (id) => {
    if (!window.confirm("Are you sure you want to delete this admin account?")) return;
    try {
      const res = await fetch(`${API_BASE}/admin/delete-account/${id}/`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      showSnackbar(data.message || "✅ Admin account deleted!");
      fetchAdminAccounts();
    } catch (error) {
      showSnackbar("Failed to delete admin account", "error");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      showSnackbar("❌ Please select a file to upload.", "error");
      return;
    }
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/admin/upload_doc`, {
        method: "POST",
        headers: { ...getAuthHeaders() }, // Only Authorization, no Content-Type
        body: formData,
      });

      const data = await res.json();
      
      if (res.ok) {
        showSnackbar(data.message || "✅ File uploaded successfully!");
        setFile(null);
        fetchFiles();
      } else {
        showSnackbar(data.error || data.message || "❌ Failed to upload file.", "error");
      }
    } catch (error) {
      console.error('Upload error:', error);
      showSnackbar("❌ Network error during upload.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async (id) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;

    try {
      const res = await fetch(`${API_BASE}/delete-file/${id}/`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const data = await res.json();
      
      if (res.ok) {
        showSnackbar(data.message || "✅ File deleted successfully!");
        fetchFiles();
      } else {
        showSnackbar(data.error || data.message || "❌ Failed to delete file.", "error");
      }
    } catch (error) {
      console.error('Delete error:', error);
      showSnackbar("❌ Network error during deletion.", "error");
    }
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
                      {editingFAQ === item.id ? (
                        <Box>
                          <TextField
                            label="Question"
                            value={editQuestion}
                            onChange={e => setEditQuestion(e.target.value)}
                            fullWidth
                            sx={{ mb: 1 }}
                          />
                          <TextField
                            label="Answer"
                            value={editAnswer}
                            onChange={e => setEditAnswer(e.target.value)}
                            fullWidth
                            multiline
                            rows={3}
                            sx={{ mb: 1 }}
                          />
                          <Button onClick={() => handleEditSave(item.id)} variant="contained" sx={{ mr: 1, backgroundColor: "#10a37f" }}>Save</Button>
                          <Button onClick={handleEditCancel} variant="outlined">Cancel</Button>
                        </Box>
                      ) : (
                        <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: darkMode ? "#ffffff" : "#1a1a1a" }}>
                              Q: {item.question}
                            </Typography>
                            <Typography variant="body2" sx={{ color: darkMode ? "#e0e0e0" : "#666" }}>
                              A: {item.answer}
                            </Typography>
                          </Box>
                          <Box sx={{ display: "flex", flexDirection: "row", gap: 1, ml: 2 }}>
                            <IconButton onClick={() => handleEditClick(item)} size="small" sx={{ color: "#1976d2", fontSize: 18 }} title="Edit FAQ">
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton onClick={() => handleDeleteFAQ(item.id)} size="small" sx={{ color: "#d32f2f", fontSize: 18 }} title="Delete FAQ">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      )}
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
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1, color: darkMode ? "#e0e0e0" : "#666" }}>
                      Supported formats: PDF, DOCX, TXT
                    </Typography>
                    <input
                      type="file"
                      onChange={(e) => setFile(e.target.files[0])}
                      accept=".pdf,.docx,.txt"
                      style={{ 
                        marginBottom: "16px",
                        color: darkMode ? "#ffffff" : "#000000",
                        width: "100%"
                      }}
                    />
                    {file && (
                      <Typography variant="body2" sx={{ color: "#10a37f", fontWeight: 500 }}>
                        Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </Typography>
                    )}
                  </Box>
                  <Button
                    variant="contained"
                    onClick={handleUpload}
                    disabled={!file || isUploading}
                    sx={{ 
                      backgroundColor: "#10a37f",
                      "&:hover": { backgroundColor: "#0d8a6f" },
                      "&:disabled": {
                        backgroundColor: darkMode ? "#404040" : "#e0e0e0",
                        color: darkMode ? "#666" : "#999"
                      }
                    }}
                    startIcon={isUploading ? null : <UploadIcon />}
                  >
                    {isUploading ? "Uploading..." : "Upload Document"}
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
                  {uploadedFiles.length === 0 ? (
                    <Paper sx={{ 
                      p: 3, 
                      textAlign: "center",
                      backgroundColor: darkMode ? "#2d2d2d" : "#f8f9fa",
                      transition: "background-color 0.3s ease"
                    }}>
                      <Typography variant="body2" sx={{ color: darkMode ? "#b0b0b0" : "#666" }}>
                        No files uploaded yet. Upload a document to get started.
                      </Typography>
                    </Paper>
                  ) : (
                    uploadedFiles.map((file) => (
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
                              Uploaded: {file.uploaded_at ? new Date(file.uploaded_at).toLocaleString() : 'Unknown date'}
                            </Typography>
                            {file.path && (
                              <Typography variant="caption" sx={{ color: darkMode ? "#b0b0b0" : "#999" }}>
                                Path: {file.path}
                              </Typography>
                            )}
                          </Box>
                          <IconButton
                            onClick={() => handleDeleteFile(file.id)}
                            sx={{ 
                              color: "#d32f2f",
                              "&:hover": {
                                backgroundColor: "rgba(211, 47, 47, 0.1)"
                              }
                            }}
                            title="Delete File"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Paper>
                    ))
                  )}
                </Box>
              </CardContent>
            </Card>
        </Container>

        {/* Registration Requests Section (super admin only) */}
        {user?.is_super_admin && (
          <Container sx={{ mt: 4, mb: 4, maxWidth: "100%", px: 2 }}>
            <Card sx={{
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              backgroundColor: darkMode ? "#1a1a1a" : "#ffffff",
              transition: "background-color 0.3s ease",
              mb: 4,
            }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: darkMode ? "#ffffff" : "#1a1a1a" }}>
                    Registration Requests ({registrationRequests.length})
                  </Typography>
                </Box>
                {registrationRequests.length === 0 ? (
                  <Typography variant="body2" sx={{ color: darkMode ? "#b0b0b0" : "#666" }}>
                    No pending registration requests.
                  </Typography>
                ) : (
                  <Stack spacing={2}>
                    {registrationRequests.map((req) => (
                      <Paper key={req.id} sx={{ p: 2, backgroundColor: darkMode ? "#2d2d2d" : "#f8f9fa" }}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: darkMode ? "#ffffff" : "#1a1a1a" }}>
                              {req.email} ({req.username})
                            </Typography>
                            <Typography variant="body2" sx={{ color: darkMode ? "#e0e0e0" : "#666" }}>
                              Requested: {new Date(req.created_at).toLocaleString()}
                            </Typography>
                          </Box>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              onClick={() => handleApproveRegistration(req.id)}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="contained"
                              color="error"
                              size="small"
                              onClick={() => handleDeclineRegistration(req.id)}
                            >
                              Decline
                            </Button>
                          </Box>
                        </Box>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>
            {/* Admin Accounts Section */}
            <Card sx={{
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              backgroundColor: darkMode ? "#1a1a1a" : "#ffffff",
              transition: "background-color 0.3s ease",
              mb: 4,
            }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: darkMode ? "#ffffff" : "#1a1a1a" }}>
                    Admin Accounts ({adminAccounts.length})
                  </Typography>
                </Box>
                {adminAccounts.length === 0 ? (
                  <Typography variant="body2" sx={{ color: darkMode ? "#b0b0b0" : "#666" }}>
                    No other admin accounts found.
                  </Typography>
                ) : (
                  <Stack spacing={2}>
                    {adminAccounts.map((admin) => (
                      <Paper key={admin.id} sx={{ p: 2, backgroundColor: darkMode ? "#2d2d2d" : "#f8f9fa" }}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: darkMode ? "#ffffff" : "#1a1a1a" }}>
                              {admin.email} ({admin.username})
                            </Typography>
                            <Typography variant="body2" sx={{ color: darkMode ? "#e0e0e0" : "#666" }}>
                              Approved: {admin.is_approved ? "Yes" : "No"}
                            </Typography>
                          </Box>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Button
                              variant="contained"
                              color="error"
                              size="small"
                              onClick={() => handleDeleteAdmin(admin.id)}
                            >
                              Delete
                            </Button>
                          </Box>
                        </Box>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Container>
        )}

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