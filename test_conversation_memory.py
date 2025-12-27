#!/usr/bin/env python3
"""
Test script to verify conversation memory functionality
"""

import requests
import json
import time

# Test the conversation memory feature
def test_conversation_memory():
    base_url = "http://localhost:8000/api"
    session_id = f"test_session_{int(time.time())}"
    
    print("🧪 Testing Conversation Memory Feature")
    print("=" * 50)
    
    # Test 1: First message
    print("\n1️⃣ Sending first message...")
    response1 = requests.post(f"{base_url}/chat", json={
        "message": "Hello, my name is John",
        "session_id": session_id
    })
    print(f"Response: {response1.text[:200]}...")
    
    # Test 2: Second message that references the first
    print("\n2️⃣ Sending second message (should remember name)...")
    response2 = requests.post(f"{base_url}/chat", json={
        "message": "What is my name?",
        "session_id": session_id
    })
    print(f"Response: {response2.text[:200]}...")
    
    # Test 3: Third message with more context
    print("\n3️⃣ Sending third message (should remember previous context)...")
    response3 = requests.post(f"{base_url}/chat", json={
        "message": "I want some recommendations",
        "session_id": session_id
    })
    print(f"Response: {response3.text[:200]}...")
    
    # Test 4: Fourth message that should remember the context
    print("\n4️⃣ Sending fourth message (should remember previous conversation)...")
    response4 = requests.post(f"{base_url}/chat", json={
        "message": "Yes, please provide them",
        "session_id": session_id
    })
    print(f"Response: {response4.text[:200]}...")
    
    # Test 5: Clear conversation
    print("\n5️⃣ Clearing conversation...")
    clear_response = requests.post(f"{base_url}/clear-conversation", json={
        "session_id": session_id
    })
    print(f"Clear response: {clear_response.json()}")
    
    # Test 6: New message after clearing (should not remember previous context)
    print("\n6️⃣ Sending message after clearing (should not remember previous context)...")
    response6 = requests.post(f"{base_url}/chat", json={
        "message": "What is my name?",
        "session_id": session_id
    })
    print(f"Response: {response6.text[:200]}...")
    
    print("\n✅ Conversation memory test completed!")
    print("\n📝 Summary:")
    print("- Messages 1-4 should maintain conversation context")
    print("- Message 6 should not remember the name from message 1")
    print("- Clear conversation should reset the context")

if __name__ == "__main__":
    try:
        test_conversation_memory()
    except requests.exceptions.ConnectionError:
        print("❌ Error: Could not connect to the server.")
        print("Make sure the Django server is running on http://localhost:8000")
    except Exception as e:
        print(f"❌ Error: {e}") 