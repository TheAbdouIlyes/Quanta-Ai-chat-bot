# 🧪 Simple Testing Guide

## 🚀 Quick Start (5 minutes)

### Step 1: Setup Backend
```bash
# Install dependencies
pip install -r requirements.txt

# Setup database
cd backend/ai_chatbot
python manage.py makemigrations ai_chat
python manage.py migrate

# Create admin user
python manage.py create_admin --email "admin@test.com" --username "admin" --password "admin123"

# Start backend server
python manage.py runserver
```

### Step 2: Setup Frontend
```bash
# In a new terminal
cd frontend/ai_interface
npm install
npm run dev
```

### Step 3: Test Authentication
1. Open browser: `http://localhost:5173/login`
2. Login with: `admin@test.com` / `admin123`
3. Should redirect to admin panel
4. Test logout button

## 🧪 Quick Test Script

Run this to test the backend:
```bash
python quick_test.py
```

## ✅ What to Test

### 1. Login Page
- [ ] Page loads at `http://localhost:5173/login`
- [ ] Can enter email and password
- [ ] Login button works
- [ ] Dark mode toggle works

### 2. Authentication Flow
- [ ] Login with correct credentials → redirects to admin
- [ ] Login with wrong credentials → shows error
- [ ] Direct access to `/admin` without login → redirects to login

### 3. Admin Panel
- [ ] Can access admin panel when logged in
- [ ] User email shows in header
- [ ] Logout button works
- [ ] Can upload files
- [ ] Can manage FAQs

### 4. Security
- [ ] Cannot access admin without login
- [ ] API calls include authentication headers
- [ ] Logout clears session

## 🐛 Common Issues & Solutions

### Issue: "Module not found"
```bash
pip install djangorestframework-simplejwt django-cors-headers langdetect
```

### Issue: "Database error"
```bash
cd backend/ai_chatbot
rm db.sqlite3
python manage.py makemigrations ai_chat
python manage.py migrate
python manage.py create_admin --email "admin@test.com" --username "admin" --password "admin123"
```

### Issue: "CORS error"
- Check that Django server is running on port 8000
- Check that frontend is running on port 5173
- Verify CORS settings in `settings.py`

### Issue: "Frontend not loading"
```bash
cd frontend/ai_interface
npm install
npm run dev
```

## 📊 Test Results

| Test | Status | Notes |
|------|--------|-------|
| Backend starts | □ | Should show Django welcome page |
| Database setup | □ | No migration errors |
| Admin user creation | □ | User can be created |
| Login endpoint | □ | Returns JWT tokens |
| Frontend loads | □ | Login page accessible |
| Login flow | □ | Can login and access admin |
| Logout | □ | Clears session properly |
| File upload | □ | Can upload documents |
| FAQ management | □ | Can add/edit/delete FAQs |

## 🎯 Success Criteria

✅ **Authentication system is working if:**
- Can login with email/password
- Admin panel is protected
- Can logout and session clears
- API endpoints require authentication
- Frontend routes are protected

## 🚨 If Tests Fail

1. **Check server status:**
   - Backend: `http://localhost:8000/admin/` (should show Django admin)
   - Frontend: `http://localhost:5173/` (should show chat interface)

2. **Check console errors:**
   - Browser DevTools → Console tab
   - Django terminal for backend errors

3. **Verify database:**
   ```bash
   cd backend/ai_chatbot
   python manage.py shell
   >>> from ai_chat.models import User
   >>> User.objects.all()
   ```

4. **Reset everything:**
   ```bash
   # Backend
   cd backend/ai_chatbot
   rm db.sqlite3
   python manage.py makemigrations ai_chat
   python manage.py migrate
   python manage.py create_admin --email "admin@test.com" --username "admin" --password "admin123"
   
   # Frontend
   cd frontend/ai_interface
   rm -rf node_modules package-lock.json
   npm install
   npm run dev
   ```

## 🎉 Success!

If all tests pass, your authentication system is working correctly! You now have:

- ✅ Secure login with email/password
- ✅ Protected admin panel
- ✅ JWT token authentication
- ✅ Session management
- ✅ Logout functionality

**Your admin panel is now secure and only accessible to authenticated users!** 🔐 