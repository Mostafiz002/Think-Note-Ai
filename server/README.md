# Think Note AI - Backend ⚙️

**Live Site:** [https://think-note-ai.vercel.app](https://think-note-ai.vercel.app)  

The robust backbone of Think Note AI, built with NestJS and Prisma. It handles secure data persistence, AI orchestration, and multi-user synchronization.

## ✨ Highlights
- **AI Orchestration**: Direct integration with Google Gemini for advanced content processing.
- **Relational Integrity**: SQLite database managed with Prisma for local speed and simplicity.
- **JWT Authentication**: Secure, stateless user sessions with token-based auth.
- **Quota Management**: In-memory rate limiting for AI services to ensure stability.
- **Robust Validation**: Comprehensive DTO-based validation using `class-validator`.
- **Swagger Documentation**: Interactive API documentation at `/api`.
- **OTP Auth**: Secure email-based verification using Nodemailer.

## 🛠 Tech Stack
- **NestJS**: A progressive Node.js framework for building efficient server-side applications.
- **Prisma**: Next-generation ORM for Node.js and TypeScript.
- **SQLite**: Lightweight, file-based database for rapid development and deployment.
- **Google Generative AI**: SDK for interacting with Gemini models.
- **Bcrypt**: Industrial-strength password hashing.
- **Nodemailer**: Email delivery for OTP and verification.

## 🚀 Getting Started
1. Install dependencies: `pnpm install`
2. Configure `.env`:
   ```env
   JWT_SECRET="your_secret"
   GEMINI_API_KEY="your_api_key"
   MAIL_HOST="smtp.gmail.com"
   MAIL_USER="your_email@gmail.com"
   MAIL_PASS="your_app_password"
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
