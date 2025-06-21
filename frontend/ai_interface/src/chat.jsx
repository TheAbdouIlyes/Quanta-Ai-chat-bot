// src/Chat.jsx
import React, { useState, useRef, useEffect } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  Stack,
  CircularProgress
} from "@mui/material";

const API_BASE = "http://localhost:5000/api";

export default function Chat() {
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatBoxRef = useRef(null);
  const eventSourceRef = useRef(null);

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMsg = { sender: "user", text: message };
    setChatLog((prev) => [...prev, userMsg]);
    setMessage("");
    setLoading(true);

    const newBotMsg = { sender: "bot", text: "" };
    setChatLog((prev) => [...prev, newBotMsg]);

    try {
      const controller = new AbortController();
      const signal = controller.signal;

      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
        signal
      });

      eventSourceRef.current = new EventSource("/api/chat"); // ensure no duplicate

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let botResponse = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        botResponse += chunk;
        setChatLog((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { sender: "bot", text: botResponse };
          return updated;
        });
      }
    } catch (err) {
      setChatLog((prev) => [...prev, { sender: "bot", text: "❌ Error connecting to server." }]);
    }

    setLoading(false);
  };

  useEffect(() => {
    chatBoxRef.current?.scrollTo({ top: chatBoxRef.current.scrollHeight, behavior: "smooth" });
  }, [chatLog]);

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          🤖 Quanta Club Chatbot
        </Typography>

        <Box
          ref={chatBoxRef}
          sx={{
            maxHeight: 300,
            overflowY: "auto",
            bgcolor: "#f5f5f5",
            p: 2,
            borderRadius: 1,
            mb: 2,
          }}
        >
          <Stack spacing={1}>
            {chatLog.map((msg, idx) => (
              <Box
                key={idx}
                sx={{
                  textAlign: msg.sender === "user" ? "right" : "left",
                  bgcolor: msg.sender === "user" ? "#e0f7fa" : "#e8f5e9",
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  maxWidth: "80%",
                  alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  {msg.sender === "user" ? "You" : "Bot"}
                </Typography>
                <Typography variant="body1">
                  {msg.text}
                </Typography>
              </Box>
            ))}
            {loading && (
              <Box sx={{ textAlign: "left" }}>
                <CircularProgress size={20} />
              </Box>
            )}
          </Stack>
        </Box>

        <Stack direction="row" spacing={1}>
          <TextField
            fullWidth
            variant="outlined"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask something about Quanta Club..."
          />
          <Button variant="contained" onClick={handleSend} disabled={loading}>
            Send
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}
