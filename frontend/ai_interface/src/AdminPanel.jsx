import React, { useEffect, useState } from "react";
import {
  Container, Typography, Paper, TextField, Button, Box, Stack,
  List, ListItem, ListItemText, Divider
} from "@mui/material";

const API_BASE = "http://localhost:5000/api";

export default function AdminPanel() {
  const [faq, setFaq] = useState({});
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [newLink, setNewLink] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("faq.json")
      .then((res) => res.json())
      .then(setFaq);
  }, []);

  const handleAddFAQ = () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;

    const updated = {
      ...faq,
      [newQuestion]: {
        answer: newAnswer,
        ...(newLink && { link: newLink })
      }
    };
    setFaq(updated);
    setNewQuestion("");
    setNewAnswer("");
    setNewLink("");
  };

  const handleSaveFAQ = async () => {
    const res = await fetch(`${API_BASE}/admin/update_faq`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ faq })
    });
    const data = await res.json();
    setMessage(data.message || "Saved.");
  };

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE}/admin/upload_doc`, {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    setMessage(data.message || "File uploaded.");
    setFile(null);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          ⚙️ Admin Panel – Quanta FAQ Manager
        </Typography>

        <Stack direction="row" spacing={2} sx={{ my: 2 }}>
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
          <TextField
            label="Link (optional)"
            value={newLink}
            onChange={(e) => setNewLink(e.target.value)}
            fullWidth
          />
          <Button variant="contained" onClick={handleAddFAQ}>
            Add
          </Button>
        </Stack>

        <Button variant="contained" color="success" onClick={handleSaveFAQ} sx={{ mb: 3 }}>
          Save FAQ to Server
        </Button>

        <Divider sx={{ mb: 2 }} />
        <Typography variant="h6">📋 Current FAQ</Typography>
        <List>
          {Object.entries(faq).map(([q, data]) => (
            <ListItem key={q} alignItems="flex-start">
              <ListItemText
                primary={q}
                secondary={`${data.answer} ${data.link ? "🔗 " + data.link : ""}`}
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

        {message && (
          <Typography variant="body2" color="primary" sx={{ mt: 2 }}>
            ✅ {message}
          </Typography>
        )}
      </Paper>
    </Container>
  );
}
