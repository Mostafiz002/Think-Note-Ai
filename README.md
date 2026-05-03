# Think Note AI 🧠✨

**Live Site:** [https://think-note-ai.vercel.app](https://think-note-ai.vercel.app)  

#### Here's a demo video
[![Think Note AI Video Demo](https://img.youtube.com/vi/L3JD8xFzOKY/maxresdefault.jpg)](https://youtu.be/L3JD8xFzOKY)

**Think Note AI** is a state-of-the-art, AI-powered note-taking application designed to transform how you organize, synthesize, and interact with your thoughts. Built with a premium aesthetic and powered by Google Gemini AI, it's more than just an editor—it's your second brain.

---

## 🚀 Key Features

- **🧠 AI Studio**: Integrated AI commands to Summarize, Rewrite, Generate Titles, and Extract Key Insights from your notes using Google Gemini.
- **📁 Smart Organization**: Nested folders and robust tag management system for managing thousands of notes effortlessly.
- **⚡ Real-time Workspace**: A premium, distraction-free editor with real-time state management and debounced autosave.
- **🔐 Secure Authentication**: OTP-based verification via email and JWT-secured sessions.
- **🛡️ Rate Limiting & Caching**: Robust Redis-backed API throttling, caching for optimized performance, and maximum stability.
- **🔒 Advanced Security**: Secured with Helmet to set HTTP headers, alongside robust validation.
- **📝 Comprehensive Logging**: Centralized logging system powered by Winston and daily log rotation.
- **📱 Ultra Responsive**: Fluid design that works perfectly on desktop, tablet, and mobile.
- **🔍 Global Search**: Lightning-fast search across all your notes and folders.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI System**: Shadcn UI + Radix UI
- **State Management**: Zustand
- **Styling**: Tailwind CSS 4.0
- **Animations**: Motion (Framer Motion)
- **Icons**: Lucide React
- **Data Fetching**: Axios

### Backend
- **Framework**: NestJS
- **Database**: SQLite (via Prisma ORM)
- **AI Integration**: Google Generative AI (Gemini 1.5/2.0)
- **Caching & Rate Limiting**: Redis
- **Authentication**: JWT (JSON Web Tokens)
- **Email/OTP**: Brevo
- **Security**: Bcrypt Hashing & Helmet
- **Logging**: Winston

---

## 📦 Installation & Setup

### Prerequisites
- Node.js (v20+)
- pnpm (Recommended)
- Google Gemini API Key

### 1. Clone the Repository
```bash
git clone https://github.com/Mostafiz002/Think-Note-Ai.git
cd Think-Note-Ai
```

### 2. Backend Setup
```bash
cd Backend
pnpm install
```
Create a `.env` file in the `Backend` directory:
```env
# No DATABASE_URL needed for default SQLite setup, 
# but you can specify one if using a custom path.
PORT=
JWT_SECRET=
FRONTEND_URL=
GEMINI_MODEL=
GEMINI_API_KEY=
BREVO_API_KEY=
EMAIL_FROM=your_email@gmail.com
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=
REDIS_URL=

```
Initialize the database:
```bash
npx prisma migrate dev
pnpm run dev
```

### 3. Frontend Setup
```bash
cd ../Frontend
pnpm install
```
Create a `.env.local` file in the `Frontend` directory:
```env
BACKEND_URL="http://localhost:5000"
```
Run the development server:
```bash
pnpm run dev
```

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author
**Mostafizur Rahman**
- GitHub: [@Mostafiz002](https://github.com/Mostafiz002)
- Portfolio: [mostafiz.dev](https://dev-mostafiz.vercel.app/)
