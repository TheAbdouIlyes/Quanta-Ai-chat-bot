from django.db import models
import numpy as np
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.hashers import make_password

class User(AbstractUser):
    email = models.EmailField(unique=True)
    is_admin = models.BooleanField(default=False)
    is_approved = models.BooleanField(default=False)
    is_super_admin = models.BooleanField(default=False)  # Only super admin can approve users
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    def save(self, *args, **kwargs):
        if self.password and not self.password.startswith('pbkdf2_sha256$'):
            self.password = make_password(self.password)
        super().save(*args, **kwargs)

class RegistrationRequest(models.Model):
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    username = models.CharField(max_length=150)
    created_at = models.DateTimeField(auto_now_add=True)
    is_approved = models.BooleanField(default=False)
    is_declined = models.BooleanField(default=False)
    declined_reason = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"Registration request from {self.email}"

class UploadedFile(models.Model):
    name = models.CharField(max_length=255)
    path = models.TextField(default="uploads")
    uploaded_at = models.DateTimeField(auto_now_add=True)

class Chunk(models.Model):
    file = models.ForeignKey(UploadedFile, on_delete=models.CASCADE, related_name="chunks")
    text = models.TextField()
    embedding = models.BinaryField()

    def set_embedding(self, array: np.ndarray):
        self.embedding = array.astype(np.float32).tobytes()

    def get_embedding(self) -> np.ndarray:
        return np.frombuffer(self.embedding, dtype=np.float32)
from rest_framework import serializers

class UploadedFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UploadedFile
        fields = ['id', 'name', 'path', 'uploaded_at']





class CommonQuestion(models.Model):
    question = models.CharField(max_length=255)
    answer = models.TextField()

    def __str__(self):
        return self.question
