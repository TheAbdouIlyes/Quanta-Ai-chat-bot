import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const API_BASE = "http://localhost:8000/api";

export default function AdminPanel() {
  const [commonQuestions, setCommonQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [newLink, setNewLink] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);

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

  const handleAddFAQ = async () => {
    if (!newQuestion.trim() || !newAnswer.trim()) {
      setMessage("❌ Question and answer are required.");
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
      setMessage("✅ Common question added.");
      setNewQuestion("");
      setNewAnswer("");
      setNewLink("");
      fetchCommonQuestions();
    } else {
      setMessage(data.error || "❌ Failed to add question.");
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE}/admin/upload_doc`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setMessage(data.message || "File uploaded.");
    setFile(null);
    fetchFiles();
  };

  const handleDeleteFile = async (id) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;

    const res = await fetch(`${API_BASE}/delete-file/${id}/`, {
      method: "DELETE",
    });

    const data = await res.json();
    setMessage(data.message || "File deleted.");
    fetchFiles();
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          ⚙️ Admin Panel – Quanta FAQ Manager
        </Typography>

        <Stack direction="row" spacing={2} sx={{ my: 2, flexWrap: "wrap" }}>
          <TextField
            label="New Question"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            fullWidth
          />
          <TextField
            label="Answer"
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            fullWidth
          />
          <Button variant="contained" onClick={handleAddFAQ}>
            Add
          </Button>
        </Stack>

        <Divider sx={{ mb: 2 }} />
        <Typography variant="h6">📋 Current Common Questions</Typography>
        <List>
          {commonQuestions.map((item, idx) => (
            <ListItem key={idx} alignItems="flex-start">
              <ListItemText
                primary={item.question}
                secondary={item.answer}
              />
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 2 }} />
        <Typography variant="h6">📤 Upload Document</Typography>
        <Stack direction="row" spacing={2} sx={{ my: 1 }}>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            accept=".pdf,.docx,.txt"
          />
          <Button variant="outlined" onClick={handleUpload}>
            Upload
          </Button>
        </Stack>

        <Divider sx={{ my: 2 }} />
        <Typography variant="h6">🗂️ Uploaded Files</Typography>
        <List>
          {uploadedFiles.map((file) => (
            <ListItem
              key={file.id}
              secondaryAction={
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDeleteFile(file.id)}
                >
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText primary={file.name} secondary={file.path} />
            </ListItem>
          ))}
        </List>

        {message && (
          <Typography variant="body2" color="primary" sx={{ mt: 2 }}>
            {message}
          </Typography>
        )}
      </Paper>
    </Container>
  );
}
