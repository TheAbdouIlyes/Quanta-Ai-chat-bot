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
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from sentence_transformers import SentenceTransformer
from langdetect import detect
from django.contrib.auth import authenticate
from .models import UploadedFile, Chunk, User, RegistrationRequest
from django.core.mail import send_mail

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
from difflib import get_close_matches
from .models import CommonQuestion  # Import your model
from langdetect import detect
from django.http import StreamingHttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
import re
import ollama


# === AUTHENTICATION VIEWS ===

class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response({'error': 'Email and password are required'}, status=400)
        
        # Check if user exists and is approved
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'Invalid credentials'}, status=401)
        
        # Check if user is approved
        if not user.is_approved:
            return Response({'error': 'Your account is pending approval. Please wait for admin approval.'}, status=403)
        
        # Authenticate user
        user = authenticate(request, username=email, password=password)
        
        if user is None:
            return Response({'error': 'Invalid credentials'}, status=401)
        
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'access_token': str(refresh.access_token),
            'refresh_token': str(refresh),
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username,
                'is_admin': user.is_admin,
                'is_super_admin': user.is_super_admin
            }
        })

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({'message': 'Successfully logged out'})
        except Exception as e:
            return Response({'error': str(e)}, status=400)

class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not email or not username or not password:
            return Response({'error': 'Email, username and password are required'}, status=400)
        
        # Check if user already exists
        if User.objects.filter(email=email).exists():
            return Response({'error': 'Email already exists'}, status=400)
        
        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists'}, status=400)
        
        # Check if registration request already exists
        if RegistrationRequest.objects.filter(email=email).exists():
            return Response({'error': 'Registration request already exists for this email'}, status=400)
        
        # Create registration request
        registration_request = RegistrationRequest.objects.create(
            email=email,
            username=username,
            password=password
        )
        
        return Response({
            'message': 'Registration request submitted successfully. Please wait for admin approval.',
            'request_id': registration_request.id
        }, status=201)

class RegistrationRequestsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        print('DEBUG: user:', request.user)
        print('DEBUG: is_authenticated:', request.user.is_authenticated)
        print('DEBUG: is_super_admin:', getattr(request.user, 'is_super_admin', None))
        print('DEBUG: is_admin:', getattr(request.user, 'is_admin', None))
        print('DEBUG: is_approved:', getattr(request.user, 'is_approved', None))
        # Only super admin can see registration requests
        if not request.user.is_super_admin:
            return Response({'error': 'Access denied. Super admin privileges required.'}, status=403)
        
        requests = RegistrationRequest.objects.filter(is_approved=False, is_declined=False).order_by('-created_at')
        data = []
        for req in requests:
            data.append({
                'id': req.id,
                'email': req.email,
                'username': req.username,
                'created_at': req.created_at,
                'is_approved': req.is_approved,
                'is_declined': req.is_declined,
                'declined_reason': req.declined_reason
            })
        return Response({'requests': data})

class ApproveRegistrationView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, request_id):
        # Only super admin can approve registrations
        if not request.user.is_super_admin:
            return Response({'error': 'Access denied. Super admin privileges required.'}, status=403)
        
        try:
            registration_request = RegistrationRequest.objects.get(id=request_id)
        except RegistrationRequest.DoesNotExist:
            return Response({'error': 'Registration request not found'}, status=404)
        
        if registration_request.is_approved or registration_request.is_declined:
            return Response({'error': 'Request already processed'}, status=400)
        
        # Create user from registration request
        user = User.objects.create_user(
            email=registration_request.email,
            username=registration_request.username,
            password=registration_request.password,
            is_approved=True,
            is_admin=True  # All approved users become admins
        )
        
        # Mark request as approved
        registration_request.is_approved = True
        registration_request.save()
        
        return Response({
            'message': f'User {user.email} approved successfully',
            'user_id': user.id
        })

class DeclineRegistrationView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, request_id):
        # Only super admin can decline registrations
        if not request.user.is_super_admin:
            return Response({'error': 'Access denied. Super admin privileges required.'}, status=403)
        
        try:
            registration_request = RegistrationRequest.objects.get(id=request_id)
        except RegistrationRequest.DoesNotExist:
            return Response({'error': 'Registration request not found'}, status=404)
        
        if registration_request.is_approved or registration_request.is_declined:
            return Response({'error': 'Request already processed'}, status=400)
        
        declined_reason = request.data.get('reason', 'Registration request declined by admin.')
        
        # Mark request as declined
        registration_request.is_declined = True
        registration_request.declined_reason = declined_reason
        registration_request.save()
        
        # Send email to user with decline reason
        send_mail(
            subject="Your Quanta Club registration was declined",
            message=f"Dear {registration_request.username},\n\nYour registration request was declined for the following reason:\n\n{declined_reason}\n\nIf you believe this is a mistake, please contact support.",
            from_email=None,  # Use DEFAULT_FROM_EMAIL
            recipient_list=[registration_request.email],
            fail_silently=True,
        )
        
        return Response({
            'message': f'Registration request from {registration_request.email} declined',
            'reason': declined_reason
        })

class CheckRegistrationStatusView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        
        if not email:
            return Response({'error': 'Email is required'}, status=400)
        
        # Check if user exists and is approved
        try:
            user = User.objects.get(email=email)
            if user.is_approved:
                return Response({'status': 'approved', 'message': 'Account is approved. You can login.'})
            else:
                return Response({'status': 'pending', 'message': 'Account is pending approval.'})
        except User.DoesNotExist:
            # Check if there's a declined registration request
            try:
                registration_request = RegistrationRequest.objects.get(email=email)
                if registration_request.is_declined:
                    return Response({
                        'status': 'declined', 
                        'message': f'Registration request declined: {registration_request.declined_reason}'
                    })
                elif registration_request.is_approved:
                    return Response({'status': 'approved', 'message': 'Account is approved. You can login.'})
                else:
                    return Response({'status': 'pending', 'message': 'Registration request is pending approval.'})
            except RegistrationRequest.DoesNotExist:
                return Response({'status': 'not_found', 'message': 'No registration found for this email.'})

# === UPDATED VIEWS WITH AUTHENTICATION ===

class ChatView(APIView):
    permission_classes = [AllowAny]  # Chat is public
    
    def post(self, request):
        user_msg = request.data.get("message", "").strip()
        if not user_msg:
            return Response({"reply": "Please enter a message."}, status=400)

        # Step 1: Try to match a common question from DB
        all_questions = list(CommonQuestion.objects.values_list("question", flat=True))
        matched = get_close_matches(user_msg.lower(), [q.lower() for q in all_questions], n=1, cutoff=0.85)

        if matched:
            matched_question = CommonQuestion.objects.filter(question__iexact=matched[0]).first()
            if matched_question:
                return Response(  matched_question.answer.strip('"'))

        # Step 2: Continue with LLM if no match
        try:
            lang = detect(user_msg)
        except:
            lang = "en"

        relevant_chunks = search_similar(user_msg)

        # Use all relevant chunks without language filtering since we want English responses
        relevant_chunks = relevant_chunks[:3]  # Limit to top 3 chunks

        # Always use English instruction regardless of user's message language
        instruction = "You are an English assistant. Always respond in English only. Do not use any other language. Even if the user writes in a different language, respond in English."

        # Limit context to prevent huge prompts
        context = "\n\n".join(relevant_chunks)  # Use filtered chunks
        # print("context:",context)
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
                            yield f"{cleaned}\n"
                        buffer = ""
                if buffer.strip():
                    cleaned = buffer
                    if cleaned:
                        yield f"{cleaned}\n"
            except Exception as e:
                yield f"data: [LLM Error] {str(e)}\n\n"

        response = StreamingHttpResponse(generate(), content_type="text/event-stream")
        response["Cache-Control"] = "no-cache"
        response["X-Accel-Buffering"] = "no"
        return response


class UploadDocView(APIView):
    parser_classes = [MultiPartParser]
    permission_classes = [IsAuthenticated]  # Require authentication for uploads

    def post(self, request):
        try:
            file = request.FILES.get("file")
            if not file:
                return Response({"error": "No file uploaded."}, status=400)

            # Check file size (limit to 10MB)
            if file.size > 10 * 1024 * 1024:
                return Response({"error": "File size too large. Maximum size is 10MB."}, status=400)

            # Check file extension
            allowed_extensions = ['.pdf', '.docx', '.txt']
            file_extension = os.path.splitext(file.name)[1].lower()
            if file_extension not in allowed_extensions:
                return Response({"error": f"Unsupported file type. Allowed types: {', '.join(allowed_extensions)}"}, status=400)

            filename = file.name
            path = os.path.join(UPLOAD_FOLDER, filename)
            
            # Save file
            with open(path, "wb+") as f:
                for chunk in file.chunks():
                    f.write(chunk)

            # Extract text
            text = extract_text(path)
            if not text.strip():
                # Clean up the file if text extraction failed
                if os.path.exists(path):
                    os.remove(path)
                return Response({"error": "Could not extract text from the uploaded file. Please ensure the file contains readable text."}, status=400)

            # Create database record
            uploaded_file = UploadedFile.objects.create(name=filename, path=path)
            
            # Process text into chunks and create embeddings
            text_chunks = chunk_text(text)
            embeddings = model.encode(text_chunks)

            for t, vector in zip(text_chunks, embeddings):
                Chunk.objects.create(
                    file=uploaded_file,
                    text=t,
                    embedding=np.array(vector, dtype=np.float32).tobytes(),
                )

            return Response({"message": "File processed and knowledge added successfully."})
            
        except Exception as e:
            # Clean up any partially saved file
            if 'path' in locals() and os.path.exists(path):
                os.remove(path)
            return Response({"error": f"Error processing file: {str(e)}"}, status=500)
    

from .models import UploadedFileSerializer

class ListFilesView(APIView):
    permission_classes = [IsAuthenticated]  # Require authentication for listing files
    
    def get(self, request):
        try:
            files = UploadedFile.objects.all().order_by('-uploaded_at')
            serializer = UploadedFileSerializer(files, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": f"Error fetching files: {str(e)}"}, status=500)



class DeleteFileView(APIView):
    permission_classes = [IsAuthenticated]  # Require authentication for deletions
    
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

            return Response({"message": "File and related data deleted successfully."}, status=200)
        except UploadedFile.DoesNotExist:
            return Response({"error": "File not found."}, status=404)
        except Exception as e:
            return Response({"error": f"Error deleting file: {str(e)}"}, status=500)


from .models import CommonQuestion

class CommonQuestionsView(APIView):
    permission_classes = [AllowAny]  # Public access for viewing questions
    
    def get(self, request):
        data = [
            {"id": q.id, "question": q.question, "answer": q.answer}
            for q in CommonQuestion.objects.all()
        ]
        return Response({"questions": data})
    


class AddCommonQuestionView(APIView):
    permission_classes = [IsAuthenticated]
    
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
    

class UpdateCommonQuestionView(APIView):
    permission_classes = [IsAuthenticated]
    
    def put(self, request, question_id):
        try:
            question_obj = CommonQuestion.objects.get(id=question_id)
            question = request.data.get("question")
            answer = request.data.get("answer")

            if not question or not answer:
                return Response({"error": "Both question and answer are required."}, status=400)

            question_obj.question = question
            question_obj.answer = answer
            question_obj.save()

            return Response({
                "message": "Question updated successfully.",
                "id": question_obj.id,
                "question": question_obj.question,
                "answer": question_obj.answer
            }, status=200)
        except CommonQuestion.DoesNotExist:
            return Response({"error": "Question not found."}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=500)


class DeleteCommonQuestionView(APIView):
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, question_id):
        try:
            question_obj = CommonQuestion.objects.get(id=question_id)
            question_obj.delete()
            return Response({"message": "Question deleted successfully."}, status=200)
        except CommonQuestion.DoesNotExist:
            return Response({"error": "Question not found."}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=500)
    

class AdminAccountsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        print('DEBUG: HEADERS:', dict(request.headers))
        print('DEBUG: user:', request.user)
        print('DEBUG: is_authenticated:', request.user.is_authenticated)
        print('DEBUG: is_super_admin:', getattr(request.user, 'is_super_admin', None))
        print('DEBUG: is_admin:', getattr(request.user, 'is_admin', None))
        print('DEBUG: is_approved:', getattr(request.user, 'is_approved', None))
        if not request.user.is_authenticated:
            return Response({'error': 'Not authenticated. Please log in again.'}, status=401)
        if not getattr(request.user, 'is_super_admin', False):
            return Response({'error': 'Access denied. Super admin privileges required.'}, status=403)
        admins = User.objects.filter(is_admin=True).exclude(id=request.user.id)
        data = [
            {
                'id': u.id,
                'email': u.email,
                'username': u.username,
                'is_approved': u.is_approved,
                'is_super_admin': u.is_super_admin,
            }
            for u in admins
        ]
        return Response({'admins': data})

class DeleteAdminAccountView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, user_id):
        if not request.user.is_super_admin:
            return Response({'error': 'Access denied. Super admin privileges required.'}, status=403)
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=404)
        if user.id == request.user.id or user.is_super_admin:
            return Response({'error': 'Cannot delete yourself or another super admin.'}, status=400)
        user.delete()
        return Response({'message': f'Admin account {user.email} deleted.'})
    

# Add this at the top of views.py
_cached_index = None
_cached_chunks = None

def get_or_create_index():
    global _cached_index, _cached_chunks
    if _cached_index is None:
        all_chunks = list(Chunk.objects.all())
        chunk_vectors = [np.frombuffer(c.embedding, dtype=np.float32) for c in all_chunks]
        _cached_index = faiss.IndexFlatL2(384)
        _cached_index.add(np.array(chunk_vectors, dtype="float32"))
        _cached_chunks = [c.text for c in all_chunks]
    return _cached_index, _cached_chunks
    

