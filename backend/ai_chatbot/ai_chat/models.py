from django.db import models
import numpy as np

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
        fields = ['id', 'name', 'path']





class CommonQuestion(models.Model):
    question = models.CharField(max_length=255)
    answer = models.TextField()

    def __str__(self):
        return self.question
