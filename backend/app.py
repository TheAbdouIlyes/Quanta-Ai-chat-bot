from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
import nltk
import faiss
import fitz  # PyMuPDF
import docx
import numpy as np
from sentence_transformers import SentenceTransformer

# Download NLTK data
nltk.download("punkt")

# === Setup ===
app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# === Load model & vector store ===
model = SentenceTransformer("all-MiniLM-L6-v2")
index = faiss.IndexFlatL2(384)  # 384 is the dimension of MiniLM
chunks = []  # Stores original text chunks

# === Helpers ===
def extract_text(file_path):
    ext = os.path.splitext(file_path)[-1].lower()
    if ext == ".pdf":
        with fitz.open(file_path) as doc:
            return "\n".join(page.get_text() for page in doc)
    elif ext == ".docx":
        doc = docx.Document(file_path)
        return "\n".join(p.text for p in doc.paragraphs)
    elif ext == ".txt":
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()
    return ""

def chunk_text(text, max_length=300):
    sentences = nltk.sent_tokenize(text)
    chunk = []
    chunked = []
    length = 0
    for sentence in sentences:
        length += len(sentence)
        chunk.append(sentence)
        if length > max_length:
            chunked.append(" ".join(chunk))
            chunk = []
            length = 0
    if chunk:
        chunked.append(" ".join(chunk))
    return chunked

def embed_and_store(chunks_to_add):
    if not chunks_to_add:
        return
    embeddings = model.encode(chunks_to_add)
    global chunks
    chunks.extend(chunks_to_add)
    index.add(np.array(embeddings, dtype="float32"))

def search_similar(query, top_k=3):
    if index.ntotal == 0:
        return []
    query_vec = model.encode([query])
    D, I = index.search(np.array(query_vec, dtype="float32"), top_k)
    return [chunks[i] for i in I[0] if 0 <= i < len(chunks)]

# === Routes ===
@app.route("/api/chat", methods=["POST"])
def chat():
    user_msg = request.json.get("message", "").strip()
    if not user_msg:
        return jsonify({"reply": "Please enter a message."}), 400

    # Search vector DB
    relevant_chunks = search_similar(user_msg)
    
    if not relevant_chunks:
     prompt = f"{user_msg}".strip()
    else:
     context = "\n\n".join(relevant_chunks)
     prompt = f"Use the context below to answer:\n\nContext:\n{context}\n\nQuestion: {user_msg}".strip()

    if not prompt:
     return jsonify({"reply": "Prompt is empty. Cannot proceed."}), 400
 
    try:
     import ollama
     response = ollama.generate(model='deepseek-r1:1.5b', prompt=prompt)
     answer = response.get('response', "I'm not sure.") 
     answer = answer.replace("<think>", "").replace("</think>", "")
    except Exception as e:
     answer = f"[LLM Error] {str(e)}"

    return jsonify({"reply": answer})


@app.route("/api/admin/upload_doc", methods=["POST"])
def upload_doc():
    if "file" not in request.files:
        return jsonify({"message": "No file uploaded."}), 400

    file = request.files["file"]
    path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(path)

    text = extract_text(path)
    if not text.strip():
        return jsonify({"message": "Uploaded file is empty or unsupported."}), 400

    text_chunks = chunk_text(text)
    embed_and_store(text_chunks)

    return jsonify({"message": "File processed and knowledge added."})

if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)