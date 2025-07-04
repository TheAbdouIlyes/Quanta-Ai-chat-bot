import os
import re
import nltk
import faiss
import fitz  # PyMuPDF
import docx
import numpy as np
import ollama
from django.conf import settings
from django.http import StreamingHttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from sentence_transformers import SentenceTransformer
from langdetect import detect
# from symspellpy.symspellpy import SymSpell, Verbosity
from .models import UploadedFile, Chunk

nltk.download("punkt")
UPLOAD_FOLDER = os.path.join(settings.BASE_DIR, "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
model = SentenceTransformer("all-MiniLM-L6-v2")
# === UTILITY FUNCTIONS ===

def extract_text(file_path):
    ext = os.path.splitext(file_path)[-1].lower()
    if ext == ".pdf":
        with fitz.open(file_path) as doc:
            return "\n".join(page.get_text() for page in doc)
    elif ext == ".docx":
        return "\n".join(p.text for p in docx.Document(file_path).paragraphs)
    elif ext == ".txt":
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()
    return ""

def chunk_text(text, max_length=500):
    sentences = nltk.sent_tokenize(text.lower())
    chunk, chunked = [], []
    length = 0
    for sentence in sentences:
        length += len(sentence)
        chunk.append(sentence)
        if length > max_length:
            chunked.append(" ".join(chunk))
            chunk, length = [], 0
    if chunk:
        chunked.append(" ".join(chunk))
    return chunked

def fix_with_symspell(text):
    words = text.split()
    i = 0
    fixed = []
    while i < len(words):
        if i < len(words) - 1:
            combined = words[i] + words[i + 1]
            suggestions = sym_spell.lookup(combined, Verbosity.CLOSEST, max_edit_distance=1)
            if suggestions:
                fixed.append(suggestions[0].term)
                i += 2
                continue
        fixed.append(words[i])
        i += 1
    return " ".join(fixed)



def search_similar(query, top_k=5):
    all_chunks = list(Chunk.objects.all())
    if not all_chunks:
        return []
    chunk_texts = [c.text for c in all_chunks]
    chunk_vectors = [np.frombuffer(c.embedding, dtype=np.float32) for c in all_chunks]
    index = faiss.IndexFlatL2(384)
    index.add(np.array(chunk_vectors, dtype="float32"))
    query_vec = model.encode([query])
    D, I = index.search(np.array(query_vec, dtype="float32"), top_k)
    return [chunk_texts[i] for i in I[0] if i < len(chunk_texts)]

# === VIEWS ===

class ChatView(APIView):
    def post(self, request):
        user_msg = request.data.get("message", "").strip()
        if not user_msg:
            return Response({"reply": "Please enter a message."}, status=400)

        try:
            lang = detect(user_msg)
        except:
            lang = "en"

        relevant_chunks = search_similar(user_msg)

        relevant_chunks = sorted(
            relevant_chunks,
            key=lambda c: detect(c) == lang,
            reverse=True
        )

        instruction = (
            f"You are a multilingual assistant. The user's message is written in '{lang}'. "
            f"Your answer MUST be written in the same language as the message, no matter the context. "
            f"Do NOT use the language of the context if it's different. "
            f"If the question is in French, answer in French. If it's Arabic, answer in Arabic. "
            f"If it's English, answer in English. Do not translate."
        )

        context = "\n\n".join(relevant_chunks)
        prompt = f"""{instruction}

Context (can be in a different language):
{context}

User message (detect language and respond in same language):
{user_msg}
"""

        def generate():
            try:
                buffer = ""
                for chunk in ollama.generate(model='quanta-chatbot', prompt=prompt, stream=True):
                    raw = chunk.get("response", "")
                    buffer += raw
                    if re.search(r"[.!?،؛؟]\s*$", buffer):
                        cleaned = buffer
                        if cleaned:
                            yield f"{cleaned}\n\n"
                        buffer = ""
                if buffer.strip():
                    cleaned = buffer
                    if cleaned:
                        yield f"{cleaned}\n\n"
            except Exception as e:
                yield f"data: [LLM Error] {str(e)}\n\n"

        response = StreamingHttpResponse(generate(), content_type="text/event-stream")
        response["Cache-Control"] = "no-cache"
        response["X-Accel-Buffering"] = "no"
        return response


class UploadDocView(APIView):
    parser_classes = [MultiPartParser]

    def post(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response({"message": "No file uploaded."}, status=400)

        filename = file.name
        path = os.path.join(UPLOAD_FOLDER, filename)
        with open(path, "wb+") as f:
            for chunk in file.chunks():
                f.write(chunk)

        text = extract_text(path)
        if not text.strip():
            return Response({"message": "Uploaded file is empty or unsupported."}, status=400)

        uploaded_file = UploadedFile.objects.create(name=filename, path=path)
        text_chunks = chunk_text(text)
        embeddings = model.encode(text_chunks)

        for t, vector in zip(text_chunks, embeddings):
            Chunk.objects.create(
                file=uploaded_file,
                text=t,
                embedding=np.array(vector, dtype=np.float32).tobytes(),
            )

        return Response({"message": "File processed and knowledge added."})
    

from .models import UploadedFileSerializer

class ListFilesView(APIView):
    def get(self, request):
        files = UploadedFile.objects.all()
        serializer = UploadedFileSerializer(files, many=True)
        return Response(serializer.data)




class DeleteFileView(APIView):
    def delete(self, request, file_id):
        try:
            uploaded_file = UploadedFile.objects.get(id=file_id)

            # Delete related chunks
            Chunk.objects.filter(file=uploaded_file).delete()

            # Delete the physical file
            if os.path.exists(uploaded_file.path):
                os.remove(uploaded_file.path)

            # Delete DB record
            uploaded_file.delete()

            return Response({"message": "File and related data deleted."}, status=200)
        except UploadedFile.DoesNotExist:
            return Response({"error": "File not found."}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=500)


from .models import CommonQuestion

class CommonQuestionsView(APIView):
    def get(self, request):
        data = [
            {"question": q.question, "answer": q.answer}
            for q in CommonQuestion.objects.all()
        ]
        return Response({"questions": data})
    


class AddCommonQuestionView(APIView):
    def post(self, request):
        question = request.data.get("question")
        answer = request.data.get("answer")

        if not question or not answer:
            return Response({"error": "Both question and answer are required."}, status=400)

        q = CommonQuestion.objects.create(question=question, answer=answer)
        return Response({
            "message": "Question added successfully.",
            "id": q.id,
            "question": q.question,
            "answer": q.answer
        }, status=201)
    

