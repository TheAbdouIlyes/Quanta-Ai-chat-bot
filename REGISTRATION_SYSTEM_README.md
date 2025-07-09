# Registration Approval System

This system implements a user registration approval workflow where:

1. **Anyone can request registration** with email/password
2. **Super admin reviews and approves/declines** registration requests
3. **Approved users can login** anytime
4. **Declined users get a message** explaining why they were refused
5. **Only super admin can approve/decline**, but other admins can still access admin panel for FAQ/upload management

## 🚀 Quick Setup

### 1. Backend Setup
```bash
cd backend/ai_chatbot

# Run the setup script
python ../setup_registration_system.py

# Create the first super admin
python manage.py create_super_admin --email admin@example.com --username admin --password your_password

# Start the backend server
python manage.py runserver
```

### 2. Frontend Setup
```bash
cd frontend/ai_interface

# Install dependencies (if not already done)
npm install

# Start the frontend server
npm run dev
```

## 🔐 User Roles

### Super Admin
- **Can approve/decline registration requests**
- **Can access all admin features** (FAQ management, file uploads)
- **Only one super admin exists** (first user created)
- **Can see registration requests** in admin panel

### Regular Admin
- **Cannot approve/decline registrations**
- **Can access admin features** (FAQ management, file uploads)
- **Cannot see registration requests**

### Regular User
- **Can register** (submits approval request)
- **Can login** (only if approved)
- **Cannot access admin panel**

## 📋 User Flow

### Registration Process
1. **User visits** `/register`
2. **Submits** email, username, password
3. **Request is stored** in `RegistrationRequest` table
4. **Super admin sees** request in admin panel
5. **Super admin approves/declines** with reason
6. **If approved**: User account is created and can login
7. **If declined**: User gets message when trying to login

### Login Process
1. **User visits** `/login`
2. **Enters** email and password
3. **System checks** if user exists and is approved
4. **If approved**: Login successful, access granted
5. **If pending**: Message "Account pending approval"
6. **If declined**: Message with decline reason
7. **If not found**: "Invalid credentials"

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/register/` - Submit registration request
- `POST /api/auth/login/` - Login (checks approval status)
- `POST /api/auth/logout/` - Logout
- `POST /api/auth/check-status/` - Check registration status

### Registration Management (Super Admin Only)
- `GET /api/admin/registration-requests/` - List pending requests
- `POST /api/admin/approve-registration/{id}/` - Approve request
- `POST /api/admin/decline-registration/{id}/` - Decline request

## 📊 Database Models

### User Model (Extended)
```python
class User(AbstractUser):
    email = models.EmailField(unique=True)
    is_admin = models.BooleanField(default=False)
    is_approved = models.BooleanField(default=False)
    is_super_admin = models.BooleanField(default=False)
```

### RegistrationRequest Model
```python
class RegistrationRequest(models.Model):
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    username = models.CharField(max_length=150)
    created_at = models.DateTimeField(auto_now_add=True)
    is_approved = models.BooleanField(default=False)
    is_declined = models.BooleanField(default=False)
    declined_reason = models.TextField(blank=True, null=True)
```

## 🎨 Frontend Features

### Registration Page (`/register`)
- Clean form with email, username, password fields
- Password confirmation
- Validation and error handling
- Success message explaining approval process

### Login Page (`/login`)
- Updated to check approval status
- Shows appropriate messages for different states
- Link to registration page

### Admin Panel
- **Super admin sees**: FAQ management, file uploads, registration requests
- **Regular admin sees**: FAQ management, file uploads only
- **Registration requests tab** (super admin only)
- **Approve/decline buttons** with reason input

### Chat Page
- **User status indicator** when logged in
- **Login/logout button** in header
- **Admin panel button** only for authenticated users

## 🔧 Management Commands

### Create Super Admin
```bash
python manage.py create_super_admin --email admin@example.com --username admin --password your_password
```

### Create Regular Admin (after super admin exists)
```bash
python manage.py create_admin --email admin2@example.com --username admin2 --password password123
```

## 🚨 Security Features

- **Password hashing** for all users
- **JWT token authentication**
- **Role-based access control**
- **Approval workflow** prevents unauthorized access
- **Decline reasons** for transparency

## 🐛 Troubleshooting

### Common Issues

1. **Migration errors**: Delete `db.sqlite3` and run migrations again
2. **Import errors**: Make sure you're in the correct virtual environment
3. **CORS errors**: Check that backend is running on port 8000
4. **Authentication errors**: Verify JWT tokens are being sent correctly

### Reset Everything
```bash
# Backend
cd backend/ai_chatbot
rm db.sqlite3
python manage.py makemigrations
python manage.py migrate
python manage.py create_super_admin --email admin@example.com --username admin --password admin123

# Frontend
cd frontend/ai_interface
npm install
npm run dev
```

## 📝 Testing the System

1. **Create super admin** using management command
2. **Start both servers** (backend:8000, frontend:5173)
3. **Register a new user** at `/register`
4. **Login as super admin** and check registration requests
5. **Approve/decline** the registration request
6. **Test login** with the approved/declined user

## 🎯 Key Benefits

- **Controlled access**: Only approved users can login
- **Transparency**: Declined users know why they were refused
- **Scalability**: Multiple admins can manage content
- **Security**: Super admin controls user approval
- **User-friendly**: Clear messages and status indicators 