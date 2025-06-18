// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Chat from "./chat";
import AdminPanel from "./AdminPanel";
import { AppBar, Toolbar, Button, Typography, Box } from "@mui/material";

export default function App() {
  return (
    <Router>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Quanta Chatbot</Typography>
          <Box>
            <Button color="inherit" component={Link} to="/">Chat</Button>
            <Button color="inherit" component={Link} to="/admin">Admin</Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Routes>
        <Route path="/" element={<Chat />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Router>
  );
}
