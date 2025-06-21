from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import os
import re
import json
import nltk
import faiss
import fitz  # PyMuPDF
import docx
import numpy as np
from sentence_transformers import SentenceTransformer
from langdetect import detect
from symspellpy.symspellpy import SymSpell, Verbosity

# === Setup ===
nltk.download("punkt")
app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

model = SentenceTransformer("all-MiniLM-L6-v2")
index = faiss.IndexFlatL2(384)
chunks = []

# SymSpell setup
sym_spell = SymSpell(max_dictionary_edit_distance=2, prefix_length=7)
dictionary_path = "dectionnaire.txt"
sym_spell.load_dictionary(dictionary_path, term_index=0, count_index=1)

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

def clean_response(text):
    # Only show what comes after </think>
    think_match = re.search(r"<\s*think\s*>.*?<\s*/\s*think\s*>(.*)", text, flags=re.DOTALL | re.IGNORECASE)
    if think_match:
        text = think_match.group(1)

    # Fix branding
    replacements = {
        r"Deep\s*Seek\s*-\s*R\s*1\s*-\s*L\s*ite\s*-\s*Preview": "Quanta Club Chatbot",
        r"Deep\s*Seek\s*-\s*R\s*1": "Quanta Club Chatbot",
    }
    for pattern, repl in replacements.items():
        text = re.sub(pattern, repl, text, flags=re.IGNORECASE)

    # Remove generic AI reasoning
    meta_patterns = [
        r"(?i)\b(the user wrote|the user sent)[^.!?]*[.!?]",
        r"(?i)\bi need to [^.!?]*[.!?]",
        r"(?i)\bi should [^.!?]*[.!?]",
        r"(?i)\bi can [^.!?]*[.!?]",
        r"(?i)\blet me [^.!?]*[.!?]",
        r"(?i)\bi will [^.!?]*[.!?]",
        r"(?i)\bhmm[,\.]?\s*[^.!?]*[.!?]",
        r"(?i)\bit's (probably|likely)[^.!?]*[.!?]",
        r"(?i)\bas an (ai|assistant)[^.!?]*[.!?]",
        r"(?i)\bi'm going to [^.!?]*[.!?]",
        r"(?i)^okay[^.!?]*[.!?]",
        r"(?i)^alright[^.!?]*[.!?]",
    ]
    for pattern in meta_patterns:
        text = re.sub(pattern, '', text)

    text = re.sub(r'\s+', ' ', text)
    arabic_punct = "،؛؟"
    latin_punct = ":!?."

    text = re.sub(rf'\s+([{arabic_punct}{latin_punct}])', r'\1', text)
    text = re.sub(rf'([{arabic_punct}{latin_punct}])(?=\S)', r'\1 ', text)

    return fix_with_symspell(text).strip()

# === Routes ===
@app.route("/api/chat", methods=["POST"])
def chat():
    user_msg = request.json.get("message", "").strip()
    if not user_msg:
        return jsonify({"reply": "Please enter a message."}), 400

    try:
        lang = detect(user_msg)
    except:
        lang = "en"

    relevant_chunks = search_similar(user_msg)

    language_instruction = {
        "en": "Answer in English.",
        "fr": "Répondez en français.",
        "ar": "أجب باللغة العربية.",
    }.get(lang, "Answer in the same language as the question.")

    if not relevant_chunks:
        prompt = f"{language_instruction}\n\nQuestion: {user_msg}"
    else:
        context = "\n\n".join(relevant_chunks)
        prompt = (
            f"{language_instruction}\n"
            f"Answer the question using only the information provided in the document exactly as written.\n"
            f"Mention that the information is sourced from the uploaded file.\n\n"
            f"Context from uploaded file:\n{context}\n\n"
            f"Question: {user_msg}"
        )

    def generate_response():
        try:
            import ollama
            buffer = ""
            seen_think_close = False

            for chunk in ollama.generate(model='quanta-chatbot', prompt=prompt, stream=True):
                raw = chunk.get("response", "")
                buffer += raw

                if not seen_think_close:
                    if re.search(r"</\s*think\s*>", buffer, flags=re.IGNORECASE):
                        seen_think_close = True
                        after_think = re.split(r"</\s*think\s*>", buffer, flags=re.IGNORECASE)[-1]
                        cleaned = clean_response(after_think)
                        if cleaned:
                            yield f"{cleaned}\n\n"
                        buffer = ""
                else:
                    cleaned = clean_response(raw)
                    if cleaned:
                        yield f"{cleaned}\n\n"
        except Exception as e:
            yield f"data: [LLM Error] {str(e)}\n\n"

    return Response(generate_response(), mimetype="text/event-stream")

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
