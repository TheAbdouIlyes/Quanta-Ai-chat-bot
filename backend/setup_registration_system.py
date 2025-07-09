#!/usr/bin/env python
"""
Setup script for the registration approval system
"""
import os
import sys
import django

# Change to the ai_chatbot directory
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ai_chatbot'))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ai_chatbot.settings')
django.setup()

from django.core.management import execute_from_command_line

def main():
    print("🚀 Setting up Registration Approval System...")
    
    # Make migrations
    print("\n📝 Creating migrations...")
    execute_from_command_line(['manage.py', 'makemigrations'])
    
    # Migrate
    print("\n🔄 Applying migrations...")
    execute_from_command_line(['manage.py', 'migrate'])
    
    print("\n✅ Setup complete!")
    print("\n📋 Next steps:")
    print("1. Create a super admin user:")
    print("   python manage.py create_super_admin --email admin@example.com --username admin --password your_password")
    print("\n2. Start the backend server:")
    print("   python manage.py runserver")
    print("\n3. Start the frontend server:")
    print("   cd ../frontend/ai_interface && npm run dev")
    print("\n4. Access the application:")
    print("   - Chat: http://localhost:5173")
    print("   - Register: http://localhost:5173/register")
    print("   - Login: http://localhost:5173/login")
    print("   - Admin Panel: http://localhost:5173/admin (after login)")

if __name__ == "__main__":
    main() 