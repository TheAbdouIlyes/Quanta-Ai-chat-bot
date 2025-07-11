import React, { createContext, useContext, useState, useEffect, useRef } from "react";

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

const API_BASE = "http://localhost:8000/api";

export const ChatProvider = ({ children }) => {
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [commonQuestions, setCommonQuestions] = useState([]);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [sessionId, setSessionId] = useState(() => {
    // Generate a unique session ID for this conversation
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  });
  
  // Ref to track ongoing requests
  const ongoingRequestRef = useRef(null);

  // Load chat history from localStorage on mount
  useEffect(() => {
    const savedChat = localStorage.getItem("chatHistory");
    if (savedChat) {
      try {
        setChatLog(JSON.parse(savedChat));
      } catch (error) {
        console.error("Error loading chat history:", error);
        localStorage.removeItem("chatHistory");
      }
    }
  }, []);

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(chatLog));
  }, [chatLog]);

  const fetchCommonQuestions = async () => {
    try {
      const res = await fetch(`${API_BASE}/common-questions/`);
      const data = await res.json();
      setCommonQuestions(data.questions || []);
    } catch (error) {
      console.error("Error fetching common questions:", error);
    }
  };

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
      // Abort any ongoing request
      if (ongoingRequestRef.current) {
        ongoingRequestRef.current.abort();
      }
      
      // Create new abort controller for this request
      const abortController = new AbortController();
      ongoingRequestRef.current = abortController;
      
      const response = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userEntry.content,
          session_id: sessionId
        }),
        signal: abortController.signal,
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
      if (err.name === 'AbortError') {
        console.log('Request was aborted');
        return;
      }
      setChatLog((prev) => [
        ...prev,
        { role: "bot", content: "Error: " + err.message },
      ]);
    } finally {
      setIsLoading(false);
      ongoingRequestRef.current = null;
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

  const clearChat = async () => {
    try {
      // Clear conversation on the backend
      await fetch(`${API_BASE}/clear-conversation/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      });
      
      // Clear local state
      setChatLog([]);
      localStorage.removeItem("chatHistory");
      
      // Generate new session ID for fresh conversation
      setSessionId(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    } catch (error) {
      console.error("Error clearing conversation:", error);
      // Still clear local state even if backend call fails
      setChatLog([]);
      localStorage.removeItem("chatHistory");
      setSessionId(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    }
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

  const value = {
    message,
    setMessage,
    chatLog,
    setChatLog,
    isLoading,
    setIsLoading,
    commonQuestions,
    copiedMessageId,
    sessionId,
    handleSendMessage,
    handleKeyPress,
    handleCommonQuestionClick,
    clearChat,
    copyMessage,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}; 