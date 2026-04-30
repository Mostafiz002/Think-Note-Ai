# Think Note AI 🧠✨

**Live Site:** [https://think-note-ai.vercel.app](https://think-note-ai.vercel.app)  

**Think Note AI** is a state-of-the-art, AI-powered note-taking application designed to transform how you organize, synthesize, and interact with your thoughts. Built with a premium aesthetic and powered by Google Gemini AI, it's more than just an editor—it's your second brain.

---

## 🚀 Key Features

- **🧠 AI Studio**: Integrated AI commands to Summarize, Rewrite, Generate Titles, and Extract Key Insights from your notes.
- **📁 Smart Organization**: Nested folders and a streamlined workspace for managing thousands of notes effortlessly.
- **⚡ Real-time Workspace**: A premium, distraction-free editor with real-time state management and autosave.
- **🔐 Secure Authentication**: OTP-based verification and JWT-secured sessions for maximum privacy.
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
- **Authentication**: JWT (JSON Web Tokens)
- **Email/OTP**: Nodemailer
- **Security**: Bcrypt Hashing

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
JWT_SECRET="your_secret"
GEMINI_API_KEY="your_google_ai_key"
MAIL_HOST="smtp.gmail.com"
MAIL_USER="your_email@gmail.com"
MAIL_PASS="your_app_password"
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
NEXT_PUBLIC_API_URL="http://localhost:5000"
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
