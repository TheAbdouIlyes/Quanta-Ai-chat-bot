# 🔐 Authentication Setup Guide

This guide explains how to set up and use the authentication system for the Quanta AI Chatbot admin panel.

## 📋 Overview

The authentication system provides:
- **Secure login** with email and password
- **JWT token-based authentication**
- **Protected admin routes** - only authenticated users can access admin features
- **Session management** with automatic token refresh
- **Logout functionality**

## 🚀 Quick Setup

### Option 1: Automated Setup (Recommended)
```bash
python setup_auth.py
```

### Option 2: Manual Setup

#### Step 1: Install Dependencies
```bash
pip install -r requirements.txt
cd frontend/ai_interface && npm install
```

#### Step 2: Database Setup
```bash
cd backend/ai_chatbot
python manage.py makemigrations
python manage.py migrate
```

#### Step 3: Create Admin User
```bash
python manage.py create_admin --email "admin@example.com" --username "admin" --password "your_password"
```

#### Step 4: Start Servers
```bash
# Backend (Terminal 1)
cd backend/ai_chatbot
python manage.py runserver

# Frontend (Terminal 2)
cd frontend/ai_interface
npm run dev
```

## 🔧 How It Works

### Backend Authentication Flow

1. **User Model**: Custom Django user model with email as primary identifier
2. **JWT Tokens**: Secure token-based authentication using `djangorestframework-simplejwt`
3. **Protected Endpoints**: Admin endpoints require authentication
4. **Permission Classes**: Different permission levels for different endpoints

### Frontend Authentication Flow

1. **Login Page**: Users enter email and password
2. **Token Storage**: JWT tokens stored in localStorage
3. **Protected Routes**: Admin panel only accessible to authenticated users
4. **Auto-redirect**: Unauthenticated users redirected to login

## 📁 File Structure

```
├── backend/
│   └── ai_chatbot/
│       └── ai_chat/
│           ├── models.py          # Custom User model
│           ├── views.py           # Authentication views
│           ├── urls.py            # Auth endpoints
│           └── management/
│               └── commands/
│                   └── create_admin.py
├── frontend/
│   └── ai_interface/
│       └── src/
│           ├── Login.jsx          # Login component
│           ├── AuthContext.jsx    # Auth state management
│           ├── ProtectedRoute.jsx # Route protection
│           └── AdminPanel.jsx     # Updated with auth
└── setup_auth.py                  # Setup script
```

## 🔒 Security Features

### Backend Security
- **Password Hashing**: Django's built-in password hashing
- **JWT Tokens**: Secure token-based authentication
- **Token Expiration**: Configurable token lifetime
- **Admin-only Access**: Admin endpoints require authentication
- **CORS Protection**: Configured for frontend communication

### Frontend Security
- **Protected Routes**: Admin panel requires authentication
- **Token Management**: Secure token storage and retrieval
- **Auto-logout**: Automatic logout on token expiration
- **Session Persistence**: Remember login state across browser sessions

## 🛠️ API Endpoints

### Public Endpoints
- `POST /api/auth/login/` - User login
- `POST /api/auth/register/` - User registration
- `GET /api/common-questions/` - View FAQs
- `POST /api/chat` - Chat with AI

### Protected Endpoints (Require Authentication)
- `POST /api/auth/logout/` - User logout
- `GET /api/files/` - List uploaded files
- `POST /api/admin/upload_doc` - Upload documents
- `DELETE /api/delete-file/<id>/` - Delete files
- `POST /api/add-common-question/` - Add FAQ
- `PUT /api/update-common-question/<id>/` - Update FAQ
- `DELETE /api/delete-common-question/<id>/` - Delete FAQ

## 👤 User Management

### Creating Admin Users
```bash
python manage.py create_admin --email "admin@example.com" --username "admin" --password "secure_password"
```

### User Model Fields
- `email`: Primary identifier (unique)
- `username`: Display name
- `password`: Hashed password
- `is_admin`: Admin privileges flag
- `is_staff`: Django admin access
- `is_superuser`: Full system access

## 🔄 Authentication Flow

1. **Login Process**:
   - User enters email/password on login page
   - Frontend sends credentials to `/api/auth/login/`
   - Backend validates credentials and returns JWT tokens
   - Frontend stores tokens and redirects to admin panel

2. **Protected Access**:
   - Frontend includes JWT token in API requests
   - Backend validates token for protected endpoints
   - Unauthorized requests return 401/403 errors

3. **Logout Process**:
   - User clicks logout button
   - Frontend calls `/api/auth/logout/` with refresh token
   - Backend blacklists the token
   - Frontend clears stored tokens and redirects to login

## 🎨 UI Features

### Login Page
- **Modern Design**: Clean, professional interface
- **Dark Mode Support**: Consistent with app theme
- **Form Validation**: Real-time input validation
- **Error Handling**: Clear error messages
- **Loading States**: Visual feedback during authentication

### Admin Panel Updates
- **User Info**: Display logged-in user's email
- **Logout Button**: Easy access to logout functionality
- **Protected Access**: Only accessible to authenticated users
- **Auto-redirect**: Redirects to login if not authenticated

## 🚨 Troubleshooting

### Common Issues

1. **"Module not found" errors**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Database migration errors**:
   ```bash
   cd backend/ai_chatbot
   python manage.py makemigrations ai_chat
   python manage.py migrate
   ```

3. **CORS errors**:
   - Ensure Django CORS headers are properly configured
   - Check that frontend URL is in CORS_ALLOWED_ORIGINS

4. **Token expiration**:
   - Tokens expire after 24 hours by default
   - Users need to re-login after expiration

5. **Admin user creation fails**:
   ```bash
   python manage.py create_admin --email "test@example.com" --username "test" --password "password123"
   ```

### Debug Mode
To enable debug mode for development:
```python
# backend/ai_chatbot/ai_chatbot/settings.py
DEBUG = True
```

## 🔧 Configuration

### JWT Settings
```python
# backend/ai_chatbot/ai_chatbot/settings.py
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=24),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}
```

### CORS Settings
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:3000",  # Alternative frontend port
]
```

## 📝 Usage Examples

### Frontend Authentication
```javascript
import { useAuth } from './AuthContext';

const { user, login, logout, isAuthenticated } = useAuth();

// Check if user is logged in
if (isAuthenticated) {
  console.log('User is logged in:', user.email);
}

// Login
login(userData, tokens);

// Logout
logout();
```

### Protected API Calls
```javascript
const { getAuthHeaders } = useAuth();

const response = await fetch('/api/files/', {
  headers: getAuthHeaders(),
});
```

## 🎯 Next Steps

1. **Production Deployment**: Configure for production environment
2. **Password Reset**: Add password reset functionality
3. **User Roles**: Implement different user roles and permissions
4. **Session Management**: Add session timeout and auto-refresh
5. **Audit Logging**: Track admin actions for security

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Verify all dependencies are installed
3. Ensure database migrations are up to date
4. Check browser console for frontend errors
5. Check Django logs for backend errors

---

**🔐 Your admin panel is now secure and protected!** 