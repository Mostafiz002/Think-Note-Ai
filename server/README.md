# Think Note AI - Backend ⚙️

**Live Site:** [https://think-note-ai.vercel.app](https://think-note-ai.vercel.app)  

[![Think Note AI Video Demo](https://img.youtube.com/vi/Tt5s8qmTZck/maxresdefault.jpg)](https://youtu.be/Tt5s8qmTZck)

The robust backbone of Think Note AI, built with NestJS and Prisma. It handles secure data persistence, AI orchestration, and multi-user synchronization.

## ✨ Highlights
- **Multimodal AI Processing**: Sophisticated backend logic for parsing and analyzing PDF and Image uploads via Gemini.
- **AI Orchestration**: Direct integration with Google Gemini for advanced content processing and real-time chat.
- **Relational Integrity**: Serverless SQLite powered by Turso, managed with Prisma.
- **JWT Authentication**: Secure, stateless user sessions with token-based auth.
- **Advanced Throttling & Caching**: Redis-backed distributed rate limiting for API stability, and robust caching to enhance read performance.
- **Robust Validation & Security**: Comprehensive DTO-based validation, custom exception filters, and Helmet for HTTP header security.
- **Comprehensive Logging**: Centralized application logging and request monitoring using Winston.
- **Swagger Documentation**: Interactive API documentation at `/api`.
- **OTP Auth**: Secure email-based verification using Brevo.
- **Tagging & Folders**: Robust nested folder hierarchies and extensive tagging APIs.

## 🛠 Tech Stack
- **NestJS**: A progressive Node.js framework for building efficient server-side applications.
- **Prisma**: Next-generation ORM for Node.js and TypeScript.
- **SQLite**: Serverless SQLite (Turso).
- **Redis**: Caching and Rate Limiting.
- **Google Generative AI**: SDK for interacting with Gemini models.
- **Security & Logging**: Bcrypt for hashing, Helmet for HTTP security, and Winston for robust logging.
- **Brevo**: Email delivery for OTP and verification.

## 🚀 Getting Started
1. Install dependencies: `pnpm install`
2. Configure `.env`:
   ```env
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
3. Run migrations: `npx prisma migrate dev`
4. Start dev server: `pnpm run dev`

## 📁 Directory Structure
- `src/auth`: Login, Signup, OTP, and JWT strategy logic.
- `src/ai`: Gemini provider and AI service logic.
- `src/note`: Note management, searching, and movement endpoints.
- `src/folder`: Nested folder hierarchies and ownership checks.
- `src/user`: User profile and data management.
- `prisma/`: Database schema and SQLite migrations.
