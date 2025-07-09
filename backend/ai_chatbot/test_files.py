import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ai_chatbot.settings')
django.setup()

from ai_chat.models import UploadedFile

# Check if files exist in database
files = UploadedFile.objects.all()
print(f"Total files in database: {files.count()}")
for file in files:
    print(f"ID: {file.id}, Name: {file.name}, Path: {file.path}, Uploaded: {file.uploaded_at}")
    print(f"File exists on disk: {os.path.exists(file.path)}")
    print("---") 