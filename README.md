# EduAssist AI

**EduAssist AI** is a smart Prompt Engineering chatbot built for academic learning and practical demonstration. It allows users to select different chatbot roles and prompting techniques, then generates structured AI responses using the Google Gemini API.

## Live Demo

Deployment link will be added after hosting the application on Render.

## Project Overview

EduAssist AI demonstrates how prompt engineering can control the behavior, tone, structure, and quality of AI-generated responses.

The application dynamically combines:

- Selected chatbot role
- Selected prompt engineering technique
- System instructions
- User request

The final engineered prompt is then sent to the Gemini API for response generation.

## Key Features

- AI-powered educational chatbot
- Google Gemini API integration
- Role-based prompting
- Zero-shot, one-shot, and few-shot prompting
- Structured reasoning
- Dynamic prompt preview
- Markdown-formatted responses
- Copy AI response
- Export AI response as PDF
- Response generation time
- Suggested prompt buttons
- Clear chat option
- About project modal
- Responsive user interface
- Secure API key handling using environment variables

## Chatbot Roles

- Student Assistant
- Teacher
- Programmer
- HR Interviewer
- Cloud Engineer
- Assignment Assistant

## Prompt Engineering Techniques

### Zero-Shot Prompting
The AI answers directly without receiving any examples.

### One-Shot Prompting
The AI receives one example before answering the user's request.

### Few-Shot Prompting
The AI receives multiple examples to understand the expected response pattern.

### Role-Based Prompting
The AI behaves according to the selected professional or educational role.

### Structured Reasoning
The AI provides a clear and organized step-by-step explanation.

## Technology Stack

### Frontend
- HTML5
- CSS3
- JavaScript
- Marked.js
- jsPDF

### Backend
- Node.js
- Express.js

### AI Integration
- Google Gemini API
- Google Gen AI JavaScript SDK

### Development Tools
- Visual Studio Code
- Git
- GitHub
- Render

## Project Structure

```text
EduAssist-AI-Chatbot/
│
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── .env
├── .gitignore
├── package.json
├── package-lock.json
├── server.js
└── README.md
```

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/roshan-2708/ChatBot.git
```

### 2. Open the project folder

```bash
cd EduAssist-AI-Chatbot
```

### 3. Install dependencies

```bash
npm install
```

### 4. Create a `.env` file

```env
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
```

Do not upload the `.env` file to GitHub.

### 5. Start the server

```bash
npm start
```

### 6. Open the application

```text
http://localhost:5000
```

## Environment Variables

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Gemini API key from Google AI Studio |
| `PORT` | Local server port, default `5000` |

## Example Prompts

```text
Explain cloud computing in simple words.
```

```text
Generate five IoT viva questions with answers.
```

```text
Create a two-hour JavaScript study timetable.
```

```text
Start a mock interview for a cloud engineer role.
```

```text
Compare IaaS, PaaS, and SaaS using a table.
```

## How Prompt Engineering Is Implemented

The frontend sends the user's message, selected role, and selected prompting technique to the backend.

The backend selects the correct role prompt and technique prompt, combines them with the user request, and sends the final engineered prompt to Gemini.

This allows the same user question to produce different responses depending on the selected settings.

## API Security

The Gemini API key is stored inside the `.env` file and is not exposed in frontend JavaScript.

The `.gitignore` file contains:

```gitignore
node_modules/
.env
```

## Deployment

The application can be deployed as a Node.js Web Service on Render.

Recommended settings:

```text
Build Command: npm install
Start Command: npm start
```

Add this environment variable in Render:

```text
GEMINI_API_KEY=your_actual_gemini_api_key
```

## Academic Purpose

This project was developed for the subject:

**Prompt Engineering using ChatGPT**

Experiments demonstrated:

- Designing prompts for chatbots
- Developing prompts for virtual assistants

## Future Improvements

- Dark and light mode
- Chat history
- Voice input
- Text-to-speech
- File upload
- Streaming AI responses
- User authentication
- Saved conversations

## Author

**Roshan Kumar Patra**

B.Tech in Computer Science and Engineering  
Centurion University of Technology and Management  
Bhubaneswar, Odisha

## Disclaimer

EduAssist AI may occasionally generate incorrect or incomplete information. Verify important academic, technical, medical, legal, or financial information from reliable sources.
