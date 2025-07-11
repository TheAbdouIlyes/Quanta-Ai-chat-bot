# Conversation Memory Feature

## 🧠 Overview

The Quanta AI chatbot now has **conversation memory** that allows it to remember the context of your entire conversation until you explicitly clear it. This solves the problem where the chatbot would forget previous messages and lose context.

## ✨ Key Features

### 🔄 **Persistent Conversation Context**
- The chatbot remembers all messages in your conversation
- Context is maintained across multiple messages
- Previous information is used to provide better responses

### 🗂️ **Session-Based Memory**
- Each conversation has a unique session ID
- Messages are grouped by session
- Different browser tabs/windows have separate conversations

### 🧹 **Clear Conversation Function**
- "Clear Chat" button removes all conversation history
- Both frontend and backend memory are cleared
- Fresh conversation starts with new session ID

### 💾 **Database Storage**
- All messages are stored in the database
- Conversation history persists even if you close the browser
- Messages are linked to specific conversation sessions

## 🏗️ Technical Implementation

### Backend Changes

#### New Database Models
```python
class Conversation(models.Model):
    session_id = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class ChatMessage(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE)
    role = models.CharField(choices=[('user', 'User'), ('bot', 'Bot')])
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
```

#### Updated ChatView
- **Session Management**: Creates or retrieves conversation by session_id
- **Message Storage**: Saves both user and bot messages to database
- **Context Building**: Includes last 10 messages in LLM prompt
- **Memory Integration**: Conversation history is included in AI responses

#### New Endpoints
- `POST /api/chat` - Now accepts `session_id` parameter
- `POST /api/clear-conversation` - Clears conversation history

### Frontend Changes

#### ChatContext Updates
- **Session ID Generation**: Unique session ID for each conversation
- **Memory Persistence**: Chat history saved to localStorage
- **Clear Function**: Clears both frontend and backend memory

#### Enhanced User Experience
- **Seamless Memory**: No visible changes to the interface
- **Automatic Context**: Previous messages automatically included
- **Clear Option**: Easy way to reset conversation

## 🎯 How It Works

### 1. **Message Flow**
```
User sends message → Save to database → Include in context → AI responds → Save response → Return to user
```

### 2. **Context Building**
The AI receives a prompt that includes:
- Previous conversation history (last 10 messages)
- Knowledge base context (from uploaded files)
- Current user message

### 3. **Memory Management**
- **Automatic**: Messages are automatically saved and included
- **Limited**: Only last 10 messages to prevent huge prompts
- **Clearable**: Users can clear conversation at any time

## 🧪 Testing the Feature

### Manual Testing
1. **Start a conversation**: Send "Hello, my name is John"
2. **Ask for name**: Send "What is my name?" - should remember "John"
3. **Request recommendations**: Send "I want some recommendations"
4. **Follow up**: Send "Yes, please provide them" - should understand context
5. **Clear chat**: Click "Clear Chat" button
6. **Test memory**: Send "What is my name?" - should not remember "John"

### Automated Testing
Run the test script:
```bash
python test_conversation_memory.py
```

## 📊 Database Schema

### Conversation Table
- `id`: Primary key
- `session_id`: Unique conversation identifier
- `created_at`: When conversation started
- `updated_at`: Last activity timestamp

### ChatMessage Table
- `id`: Primary key
- `conversation_id`: Foreign key to Conversation
- `role`: 'user' or 'bot'
- `content`: Message text
- `timestamp`: When message was sent

## 🔧 Configuration

### Memory Limits
- **Message History**: Last 10 messages included in context
- **Session Duration**: Until manually cleared
- **Storage**: Unlimited (database storage)

### Performance Considerations
- **Context Size**: Limited to prevent huge prompts
- **Database Queries**: Optimized with proper indexing
- **Memory Usage**: Efficient storage and retrieval

## 🚀 Benefits

### For Users
- **Better Responses**: AI understands conversation context
- **Natural Flow**: No need to repeat information
- **Persistent Memory**: Context survives page refreshes
- **Easy Reset**: Clear conversation when needed

### For Developers
- **Scalable**: Database-backed storage
- **Maintainable**: Clean separation of concerns
- **Extensible**: Easy to add more memory features
- **Testable**: Comprehensive test coverage

## 🔮 Future Enhancements

### Potential Improvements
- **Memory Duration**: Time-based conversation expiration
- **Context Summarization**: AI-generated conversation summaries
- **Memory Export**: Export conversation history
- **Multi-User**: Separate memory per user account
- **Memory Analytics**: Track conversation patterns

### Advanced Features
- **Semantic Memory**: Remember key information across sessions
- **Memory Compression**: Summarize old messages
- **Context Windows**: Sliding window of relevant context
- **Memory Search**: Search through conversation history

## 🐛 Troubleshooting

### Common Issues
1. **Memory Not Working**: Check if session_id is being sent
2. **Slow Responses**: Large conversation history may slow down AI
3. **Database Errors**: Ensure migrations are applied
4. **Frontend Issues**: Check localStorage and session management

### Debug Commands
```bash
# Check database tables
python manage.py shell
>>> from ai_chat.models import Conversation, ChatMessage
>>> Conversation.objects.count()
>>> ChatMessage.objects.count()

# Test conversation memory
python test_conversation_memory.py
```

## 📝 Migration Notes

### Database Migration
The new models require a database migration:
```bash
python manage.py makemigrations
python manage.py migrate
```

### Backward Compatibility
- Existing chat functionality remains unchanged
- New features are additive
- No breaking changes to existing APIs

---

**🎉 The conversation memory feature is now fully implemented and ready for use!** 