import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

const API_BASE = "http://localhost:8000/api";

export default function Chat() {
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState("normal"); // 'normal' | 'common'
  const [commonQuestions, setCommonQuestions] = useState([]);

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
    if (mode === "common") {
      fetchCommonQuestions();
    }
  }, [mode]);

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

  return (
    <Container
      maxWidth="md"
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#d6e3e4",
      }}
    >
      <Paper
        elevation={4}
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "90vh",
          width: "100%",
          maxWidth: 800,
          p: 3,
          borderRadius: 4,
          backgroundColor: "#ffffff",
        }}
      >
        <Typography variant="h4" align="center" gutterBottom>
          Quanta Club Chatbot
        </Typography>

        {/* Mode Switch Button */}
        <Button
          variant="outlined"
          onClick={() => setMode(mode === "normal" ? "common" : "normal")}
          sx={{ mb: 2 }}
        >
          {mode === "normal" ? "💡 Common Questions Mode" : "💬 Normal Mode"}
        </Button>

        {/* Chat Display */}
        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            my: 2,
            px: 2,
            py: 1,
            border: "1px solid #ccc",
            borderRadius: 2,
            backgroundColor: "#f5f7f9",
          }}
        >
          <Stack spacing={1}>
            {chatLog.map((msg, idx) => (
              <Box
                key={idx}
                sx={{
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  backgroundColor:
                    msg.role === "user" ? "#1976d2" : "#eeeeee",
                  color: msg.role === "user" ? "#fff" : "#000",
                  px: 2,
                  py: 1,
                  borderRadius: 3,
                  maxWidth: "80%",
                  wordBreak: "break-word",
                  whiteSpace: "pre-wrap",
                }}
              >
                {msg.content}
              </Box>
            ))}
            <div ref={chatBoxRef} />
          </Stack>
        </Box>

        {/* Common Questions Buttons */}
        {mode === "common" && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Click a question:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {commonQuestions.map((item, index) => (
                <Button
                  key={index}
                  variant="outlined"
                  onClick={() =>
                    handleCommonQuestionClick(item.question, item.answer)
                  }
                >
                  {item.question}
                </Button>
              ))}
            </Stack>
          </Box>
        )}

        {/* Text Input */}
        {mode === "normal" && (
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            variant="outlined"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    color="primary"
                    onClick={handleSendMessage}
                    disabled={isLoading}
                  >
                    {isLoading ? <CircularProgress size={24} /> : <SendIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        )}
      </Paper>
    </Container>
  );
}
