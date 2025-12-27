# 🧪 Testing Guide for Authentication System

This guide will help you test the authentication system step by step.

## 🚀 Quick Test Setup

### Step 1: Install Dependencies
```bash
# Install Python dependencies
pip install -r requirements.txt

# Install frontend dependencies
cd frontend/ai_interface
npm install
cd ../..
```

### Step 2: Setup Database
```bash
cd backend/ai_chatbot

# Create migrations
python manage.py makemigrations ai_chat

# Apply migrations
python manage.py migrate
```

### Step 3: Create Admin User
```bash
# Create an admin user (replace with your desired credentials)
python manage.py create_admin --email "admin@test.com" --username "admin" --password "admin123"
```

### Step 4: Start Servers
```bash
# Terminal 1: Start Django backend
cd backend/ai_chatbot
python manage.py runserver

# Terminal 2: Start React frontend
cd frontend/ai_interface
npm run dev
```

## 🧪 Testing Scenarios

### Test 1: Basic Authentication Flow

#### 1.1 Test Login Page Access
- **URL**: `http://localhost:5173/login`
- **Expected**: Should see login form with email and password fields
- **Test**: Enter credentials and click "Sign In"

#### 1.2 Test Successful Login
- **Credentials**: 
  - Email: `admin@test.com`
  - Password: `admin123`
- **Expected**: Redirect to admin panel at `/admin`
- **Verify**: User email should appear in header

#### 1.3 Test Failed Login
- **Credentials**: 
  - Email: `wrong@test.com`
  - Password: `wrongpass`
- **Expected**: Error message "Invalid credentials"
- **Verify**: Should stay on login page

### Test 2: Protected Routes

#### 2.1 Test Direct Admin Access (Unauthenticated)
- **URL**: `http://localhost:5173/admin`
- **Expected**: Redirect to login page
- **Verify**: Cannot access admin panel without login

#### 2.2 Test Admin Access (Authenticated)
- **Steps**: 
  1. Login successfully
  2. Navigate to `/admin`
- **Expected**: Can access admin panel
- **Verify**: All admin features are available

### Test 3: API Endpoint Testing

#### 3.1 Test Public Endpoints (No Auth Required)
```bash
# Test chat endpoint
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'

# Test common questions endpoint
curl http://localhost:8000/api/common-questions/
```

#### 3.2 Test Protected Endpoints (Auth Required)
```bash
# First, get a token
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@test.com", "password": "admin123"}'

# Copy the access_token from response, then test protected endpoint
curl http://localhost:8000/api/files/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

### Test 4: Frontend Authentication Features

#### 4.1 Test Logout Functionality
- **Steps**:
  1. Login successfully
  2. Click "Logout" button in admin panel
- **Expected**: Redirect to login page
- **Verify**: Cannot access admin panel anymore

#### 4.2 Test Session Persistence
- **Steps**:
  1. Login successfully
  2. Close browser tab
  3. Reopen and go to `/admin`
- **Expected**: Should still be logged in
- **Verify**: Can access admin panel without re-login

#### 4.3 Test Dark Mode in Login
- **Steps**:
  1. Go to login page
  2. Toggle dark mode
- **Expected**: Login page should switch themes
- **Verify**: Consistent with app theme

### Test 5: Admin Panel Features

#### 5.1 Test File Upload (Authenticated)
- **Steps**:
  1. Login to admin panel
  2. Upload a document (PDF, DOCX, TXT)
- **Expected**: File should upload successfully
- **Verify**: File appears in file list

#### 5.2 Test FAQ Management (Authenticated)
- **Steps**:
  1. Add a new FAQ
  2. Edit an existing FAQ
  3. Delete an FAQ
- **Expected**: All operations should work
- **Verify**: Changes persist in database

#### 5.3 Test Unauthenticated Access to Admin Features
- **Steps**:
  1. Logout
  2. Try to access admin features via API
- **Expected**: 401 Unauthorized errors
- **Verify**: Cannot perform admin operations

## 🔧 Manual Testing with Browser DevTools

### Test 1: Check Local Storage
1. Open browser DevTools (F12)
2. Go to Application/Storage tab
3. Login successfully
4. Check localStorage for:
   - `access_token`
   - `refresh_token`
   - `user`

### Test 2: Check Network Requests
1. Open DevTools Network tab
2. Login and observe:
   - POST request to `/api/auth/login/`
   - Response contains tokens
   - Subsequent requests include Authorization header

### Test 3: Test Token Expiration
1. Login successfully
2. In DevTools Console, run:
```javascript
// Clear tokens to simulate expiration
localStorage.removeItem('access_token');
localStorage.removeItem('refresh_token');
localStorage.removeItem('user');
```
3. Try to access admin panel
4. Expected: Redirect to login page

## 🐛 Debugging Common Issues

### Issue 1: "Module not found" errors
```bash
# Solution: Install missing dependencies
pip install djangorestframework-simplejwt django-cors-headers langdetect
```

### Issue 2: CORS errors in browser console
```bash
# Check Django settings
# Ensure CORS_ALLOWED_ORIGINS includes your frontend URL
```

### Issue 3: Database migration errors
```bash
# Solution: Reset database
cd backend/ai_chatbot
rm db.sqlite3
python manage.py makemigrations ai_chat
python manage.py migrate
python manage.py create_admin --email "admin@test.com" --username "admin" --password "admin123"
```

### Issue 4: Frontend build errors
```bash
# Solution: Clear node modules and reinstall
cd frontend/ai_interface
rm -rf node_modules package-lock.json
npm install
```

## 📊 Test Checklist

### ✅ Backend Tests
- [ ] Django server starts without errors
- [ ] Database migrations apply successfully
- [ ] Admin user creation works
- [ ] Login endpoint returns JWT tokens
- [ ] Protected endpoints require authentication
- [ ] Public endpoints work without authentication
- [ ] Logout endpoint blacklists tokens

### ✅ Frontend Tests
- [ ] React app starts without errors
- [ ] Login page loads correctly
- [ ] Login form validation works
- [ ] Successful login redirects to admin
- [ ] Failed login shows error message
- [ ] Protected routes redirect to login
- [ ] Logout clears tokens and redirects
- [ ] Dark mode works on login page
- [ ] User info displays in admin panel

### ✅ Integration Tests
- [ ] Login flow works end-to-end
- [ ] Admin panel features work when authenticated
- [ ] Admin panel features blocked when not authenticated
- [ ] Session persistence across browser refresh
- [ ] API calls include proper authentication headers

## 🎯 Performance Testing

### Test 1: Login Performance
```bash
# Test login response time
curl -w "@curl-format.txt" -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@test.com", "password": "admin123"}'
```

### Test 2: Token Validation Performance
```bash
# Test protected endpoint response time
curl -w "@curl-format.txt" http://localhost:8000/api/files/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔒 Security Testing

### Test 1: Token Security
- [ ] Tokens are not stored in plain text
- [ ] Tokens expire after configured time
- [ ] Invalid tokens are rejected
- [ ] Logout properly blacklists tokens

### Test 2: Route Protection
- [ ] Direct URL access to admin is blocked
- [ ] API endpoints require proper authentication
- [ ] CORS is properly configured
- [ ] No sensitive data in error messages

## 📝 Test Results Template

```
Test Date: _______________
Tester: _________________

Backend Tests:
□ Server starts: ___/___/___
□ Database setup: ___/___/___
□ Admin user creation: ___/___/___
□ Login endpoint: ___/___/___
□ Protected endpoints: ___/___/___
□ Public endpoints: ___/___/___

Frontend Tests:
□ App starts: ___/___/___
□ Login page: ___/___/___
□ Login flow: ___/___/___
□ Route protection: ___/___/___
□ Logout: ___/___/___
□ Dark mode: ___/___/___

Integration Tests:
□ End-to-end login: ___/___/___
□ Admin features: ___/___/___
□ Session persistence: ___/___/___
□ API authentication: ___/___/___

Issues Found:
1. ________________
2. ________________
3. ________________

Overall Status: □ PASS □ FAIL
```

## 🚀 Quick Test Script

Create a file called `quick_test.py`:

```python
#!/usr/bin/env python3
import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_auth():
    print("🧪 Testing Authentication System...")
    
    # Test 1: Login
    print("\n1. Testing login...")
    login_data = {
        "email": "admin@test.com",
        "password": "admin123"
    }
    
    response = requests.post(f"{BASE_URL}/auth/login/", json=login_data)
    if response.status_code == 200:
        print("✅ Login successful")
        tokens = response.json()
        access_token = tokens['access_token']
    else:
        print("❌ Login failed:", response.text)
        return
    
    # Test 2: Protected endpoint
    print("\n2. Testing protected endpoint...")
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get(f"{BASE_URL}/files/", headers=headers)
    if response.status_code == 200:
        print("✅ Protected endpoint accessible")
    else:
        print("❌ Protected endpoint failed:", response.text)
    
    # Test 3: Public endpoint
    print("\n3. Testing public endpoint...")
    response = requests.get(f"{BASE_URL}/common-questions/")
    if response.status_code == 200:
        print("✅ Public endpoint accessible")
    else:
        print("❌ Public endpoint failed:", response.text)
    
    print("\n🎉 Authentication system test completed!")

if __name__ == "__main__":
    test_auth()
```

Run it with:
```bash
python quick_test.py
```

---

**🎯 Your authentication system is ready for testing! Follow this guide to verify everything works correctly.** 