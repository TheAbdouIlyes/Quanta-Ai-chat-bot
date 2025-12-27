#!/usr/bin/env python3
import requests
import json
import time

BASE_URL = "http://localhost:8000/api"

def test_auth():
    print("🧪 Testing Authentication System...")
    print("=" * 50)
    
    # Test 1: Login
    print("\n1. Testing login...")
    login_data = {
        "email": "admin@test.com",
        "password": "admin123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login/", json=login_data, timeout=10)
        if response.status_code == 200:
            print("✅ Login successful")
            tokens = response.json()
            access_token = tokens['access_token']
            print(f"   User: {tokens['user']['email']}")
        else:
            print(f"❌ Login failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Connection failed. Make sure Django server is running on http://localhost:8000")
        return False
    except Exception as e:
        print(f"❌ Login error: {e}")
        return False
    
    # Test 2: Protected endpoint
    print("\n2. Testing protected endpoint...")
    headers = {"Authorization": f"Bearer {access_token}"}
    try:
        response = requests.get(f"{BASE_URL}/files/", headers=headers, timeout=10)
        if response.status_code == 200:
            print("✅ Protected endpoint accessible")
        else:
            print(f"❌ Protected endpoint failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Protected endpoint error: {e}")
        return False
    
    # Test 3: Public endpoint
    print("\n3. Testing public endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/common-questions/", timeout=10)
        if response.status_code == 200:
            print("✅ Public endpoint accessible")
        else:
            print(f"❌ Public endpoint failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Public endpoint error: {e}")
        return False
    
    # Test 4: Unauthenticated access to protected endpoint
    print("\n4. Testing unauthenticated access...")
    try:
        response = requests.get(f"{BASE_URL}/files/", timeout=10)
        if response.status_code == 401:
            print("✅ Unauthenticated access properly blocked")
        else:
            print(f"❌ Unauthenticated access not blocked: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Unauthenticated test error: {e}")
        return False
    
    print("\n🎉 All authentication tests passed!")
    return True

def test_frontend_urls():
    print("\n🌐 Testing Frontend URLs...")
    print("=" * 50)
    
    urls_to_test = [
        "http://localhost:5173/login",
        "http://localhost:5173/admin",
        "http://localhost:5173/"
    ]
    
    for url in urls_to_test:
        try:
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                print(f"✅ {url} - Accessible")
            else:
                print(f"❌ {url} - Status: {response.status_code}")
        except requests.exceptions.ConnectionError:
            print(f"❌ {url} - Connection failed (frontend not running)")
        except Exception as e:
            print(f"❌ {url} - Error: {e}")

def main():
    print("🚀 Quanta AI Chatbot Authentication Test")
    print("=" * 50)
    
    # Test backend authentication
    backend_success = test_auth()
    
    # Test frontend URLs
    test_frontend_urls()
    
    print("\n" + "=" * 50)
    if backend_success:
        print("✅ Backend authentication system is working correctly!")
        print("\n📋 Next steps:")
        print("1. Start the frontend: cd frontend/ai_interface && npm run dev")
        print("2. Open http://localhost:5173/login in your browser")
        print("3. Login with: admin@test.com / admin123")
        print("4. Test the admin panel features")
    else:
        print("❌ Backend authentication system has issues.")
        print("\n🔧 Troubleshooting:")
        print("1. Make sure Django server is running: cd backend/ai_chatbot && python manage.py runserver")
        print("2. Check if admin user exists: python manage.py create_admin --email admin@test.com --username admin --password admin123")
        print("3. Verify database migrations: python manage.py migrate")

if __name__ == "__main__":
    main() 