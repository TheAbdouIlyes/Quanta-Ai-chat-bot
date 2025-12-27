Quanti-Ai version 0.1 is the first release of Quanta Club’s official AI chatbot.
Its goal is to assist students and anyone interested in learning more about the Quanta Club — including its events, members, registration process, location, and more.




*** Key Features: ----------------------------------------------------

    File-Based Knowledge:
Admins can upload documents (PDF, DOCX, TXT) containing information about the club. The chatbot uses these files to answer user questions. If it can’t find a matching answer, it will respond politely and let the user know.

    FAQ Access:
Admins can add frequently asked questions with their answers. Users can access the FAQ section directly to find quick answers without having to type a question.




*** User Roles: ------------------------------------------------------

    Visitor:
Can chat with the bot, view the FAQ section, and submit a registration request to become an admin.

    Admin:
Inherits all visitor permissions, and gains access to the admin panel, where they can manage uploaded files and the FAQ section (add, edit, or delete entries).

    Super Admin:
Has full admin privileges, with the additional ability to approve or reject registration requests and manage current admins (e.g., remove admin accounts if necessary).




*** Development Stack: -----------------------------------------------

    Frontend: React.js

    Backend: Django

    Database: SQLite (via Django ORM)

    AI Model: llama3.2:3b served through Ollama





⚠️ Note on Performance: ----------------------------------------------

One major challenge is the high memory usage of the AI model, which causes slow response times — typically between 40 seconds and 1 minute on standard devices.
We currently use the "llama3.2:3b" model from Ollama. Response time may increase based on the number and size of uploaded documents.

We hope to overcome this limitation in future versions. However, at the moment, there is no solution for the slow response time.