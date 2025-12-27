#!/usr/bin/env python3
"""
Setup script for Quanta AI Chatbot Authentication
This script helps set up the authentication system for the admin panel.
"""

import os
import sys
import subprocess
import getpass

def run_command(command, cwd=None):
    """Run a command and return the result"""
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True, cwd=cwd)
        return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {command}")
        print(f"Error: {e.stderr}")
        return None

def main():
    print("🔐 Quanta AI Chatbot Authentication Setup")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists("backend/ai_chatbot/manage.py"):
        print("❌ Error: Please run this script from the project root directory")
        sys.exit(1)
    
    # Step 1: Install Python dependencies
    print("\n📦 Step 1: Installing Python dependencies...")
    if run_command("pip install -r requirements.txt"):
        print("✅ Dependencies installed successfully")
    else:
        print("❌ Failed to install dependencies")
        sys.exit(1)
    
    # Step 2: Run Django migrations
    print("\n🗄️ Step 2: Running Django migrations...")
    if run_command("python manage.py makemigrations", cwd="backend/ai_chatbot"):
        print("✅ Migrations created successfully")
    else:
        print("❌ Failed to create migrations")
        sys.exit(1)
    
    if run_command("python manage.py migrate", cwd="backend/ai_chatbot"):
        print("✅ Database migrated successfully")
    else:
        print("❌ Failed to migrate database")
        sys.exit(1)
    
    # Step 3: Create admin user
    print("\n👤 Step 3: Creating admin user...")
    print("Please enter the admin credentials:")
    
    email = input("Email: ").strip()
    username = input("Username: ").strip()
    password = getpass.getpass("Password: ").strip()
    
    if not email or not username or not password:
        print("❌ All fields are required")
        sys.exit(1)
    
    # Create admin user
    command = f'python manage.py create_admin --email "{email}" --username "{username}" --password "{password}"'
    if run_command(command, cwd="backend/ai_chatbot"):
        print("✅ Admin user created successfully")
    else:
        print("❌ Failed to create admin user")
        sys.exit(1)
    
    # Step 4: Install frontend dependencies
    print("\n📦 Step 4: Installing frontend dependencies...")
    if run_command("npm install", cwd="frontend/ai_interface"):
        print("✅ Frontend dependencies installed successfully")
    else:
        print("❌ Failed to install frontend dependencies")
        sys.exit(1)
    
    print("\n🎉 Setup completed successfully!")
    print("\n📋 Next steps:")
    print("1. Start the backend server: cd backend/ai_chatbot && python manage.py runserver")
    print("2. Start the frontend: cd frontend/ai_interface && npm run dev")
    print("3. Access the admin panel at: http://localhost:5173/login")
    print(f"4. Login with email: {email}")
    print("\n🔐 The admin panel is now protected with authentication!")

if __name__ == "__main__":
    main() 