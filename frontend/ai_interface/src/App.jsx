// src/App.jsx
import React, { useState, createContext, useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Chat from "./chat";
import AdminPanel from "./AdminPanel";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

// Create Dark Mode Context
export const DarkModeContext = createContext();

export const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (!context) {
    throw new Error('useDarkMode must be used within a DarkModeProvider');
  }
  return context;
};

export default function App() {
  const [open, setOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    // Get saved theme from localStorage or default to false
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', JSON.stringify(newMode));
  };

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const drawerContent = (
    <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
      <List>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/">
            <ListItemText primary="Chat" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/admin">
            <ListItemText primary="Admin" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
      <Router>
        {/* <AppBar position="static">
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={toggleDrawer(true)} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Quanta Chatbot
            </Typography>
          </Toolbar>
        </AppBar> */}

        {/* <Drawer open={open} onClose={toggleDrawer(false)}>
          {drawerContent}
        </Drawer> */}

        <Routes>
          <Route path="/" element={<Chat />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </Router>
    </DarkModeContext.Provider>
  );
}
