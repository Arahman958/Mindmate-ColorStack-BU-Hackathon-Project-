# Mindmate-ColorStack-BU-Hackathon-Project-
# MindMate 🌿
### An AI-Powered Mental Wellness Companion

MindMate is an AI-powered mental wellness companion designed to give users a welcoming space to express their thoughts, reflect on their emotions, and take small steps toward improving their well-being.

Built as a solo hackathon project, MindMate combines supportive AI conversations with journaling and guided breathing exercises in a simple, approachable interface.

> **Important:** MindMate is a student-built prototype intended for general wellness and self-reflection. It is not a substitute for professional mental health care, medical advice, diagnosis, or treatment.

## ✨ Features

### 💬 AI-Powered Conversations
- Chat with an AI wellness companion powered by Groq.
- Choose from three conversation modes:
  - **Just Listen:** Express your thoughts and feelings.
  - **Help Me Understand:** Reflect on emotions and explore what may be contributing to them.
  - **One Small Step:** Explore manageable next steps.
- Create multiple conversations and revisit previous chats.

### 📓 Personal Journal
- Write and save personal journal entries.
- View short previews of saved entries.
- Edit or delete existing entries.
- Keep journal entries saved in your browser's local storage.

### 🧘 Meditation and Breathing
- Follow a simple breathing animation.
- Use inhale and exhale prompts to guide your breathing.
- Choose a session duration.
- Start, pause, resume, and reset the meditation timer.

### 💾 Local Data Persistence
- Conversations and journal entries are saved in browser local storage.
- The selected application page can persist across refreshes.
- Data is associated with the browser and device being used; it is not automatically synchronized between devices.

## 🛠️ Technologies Used

- **Frontend:** React, JavaScript, Vite, CSS
- **Backend:** Node.js, Express
- **AI Integration:** Groq API
- **Configuration:** dotenv
- **Development Tools:** Visual Studio Code, Git, GitHub

## 🚀 Getting Started

### Prerequisites

Before running MindMate, install:

- [Node.js and npm](https://nodejs.org/)
- A [Groq API account](https://console.groq.com/) and your own API key
- Git (optional, for cloning the repository)

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd mindmate
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with the actual URL of this repository.

Alternatively, download the repository as a ZIP file and extract it.

### 2. Install Backend Dependencies

From the project root, run:

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root.

Use `.env.example` as a template, if available:

```dotenv
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-120b
```

Replace `your_groq_api_key_here` with your own Groq API key.

**Never share your API key or commit your `.env` file to GitHub.**

### 4. Install Frontend Dependencies

Open a terminal in the `client` directory:

```bash
cd client
npm install
```

### 5. Start the Backend

Open a terminal in the project root directory and run:

```bash
node server.js
```

The backend should start on port `3000`.

You can check that the backend is running by visiting:

```text
http://localhost:3000/
```

### 6. Start the Frontend

In a second terminal, navigate to the `client` directory and run:

```bash
npm run dev
```

Open the local URL printed by Vite, typically:

```text
http://localhost:5173/
```

Keep both terminals running while using the application.

## 🔐 Privacy and Data Storage

MindMate currently uses browser local storage to save conversations and journal entries.

- Stored data is local to the browser and device.
- Clearing browser storage may permanently delete saved conversations and journal entries.
- Data does not automatically synchronize across devices.
- Messages sent to the AI feature are transmitted to the backend and processed through the Groq API.
- Review Groq's applicable privacy policies and terms before submitting sensitive information.

**Avoid entering passwords, financial information, identifying details, or other highly sensitive personal information.**

This prototype has not been independently audited for security or privacy.

## ⚠️ Medical and Mental Health Disclaimer

MindMate is an experimental wellness application, not a medical device or clinical mental health service.

The creator is not a doctor, physician, therapist, psychologist, psychiatrist, or other licensed medical or mental health professional.

MindMate's AI-generated responses are for general informational, emotional-support, and self-reflection purposes only. They are not professional medical advice, mental health advice, diagnosis, treatment, or a substitute for consultation with a qualified professional.

AI-generated responses may be inaccurate, incomplete, inappropriate, or unsuitable for a particular situation. The application cannot reliably assess a person's mental health or determine whether a response is clinically appropriate.

Do not rely on MindMate for emergencies, crisis intervention, diagnosis, or treatment decisions.

If you are experiencing a mental health emergency or believe you may be in immediate danger, contact local emergency services. In the United States, call or text **988** for the Suicide & Crisis Lifeline; call **911** for immediate danger.

By using MindMate, users acknowledge that it is a student-built prototype and that its responses have limitations.

## 🤖 AI-Assisted Development Disclosure

**AI was used extensively in the development of MindMate.**

The project was developed by a student using AI assistance for substantial portions of the coding and development process, including code generation, implementation guidance, debugging, and troubleshooting.

The project creator directed the development process, integrated and tested features, reviewed AI-generated suggestions, and made adjustments while building the application.

AI assistance was a major part of the development workflow. This disclosure is intended to be transparent about how the project was created and does not imply that every generated suggestion was used unchanged or that every component was independently written from scratch.

The application itself also integrates an AI model through the Groq API.

## 🎯 Project Purpose

MindMate was created as a solo hackathon project to explore how AI, accessible interfaces, personal journaling, and guided breathing exercises can be combined into a simple wellness-oriented application.

The project also provided an opportunity to learn about full-stack development, API integration, React, Express, browser storage, debugging, and AI-assisted software development.

## 📌 Current Limitations

- Requires a valid Groq API key to use AI chat.
- Requires the frontend and backend servers to be running when used locally.
- Conversations and journal entries are not synchronized between devices.
- Does not provide professional medical or mental health services.
- Has not been independently audited for clinical safety, security, or privacy.

## 📄 License

No license has been specified yet. Unless a license is added to this repository, others should not assume they have permission to redistribute or modify the project.

---

**Built with curiosity, AI assistance, and a focus on making space for self-reflection.** 🌿
