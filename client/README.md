# Think Note AI - Frontend 🎨

**Live Site:** [https://think-note-ai.vercel.app](https://think-note-ai.vercel.app)  

The user interface of Think Note AI is built for speed, aesthetics, and a premium user experience. It leverages modern React patterns and the latest Next.js features to provide a seamless "second brain" experience.

## ✨ Highlights
- **Glassmorphism UI**: Beautiful, translucent layers with vibrant gradients.
- **Micro-interactions**: Subtle animations using `motion` for every state change.
- **Granular State**: Optimized Zustand selectors to prevent unnecessary re-renders.
- **Debounced Autosave**: Intelligent saving logic that preserves your work without overwhelming the API.
- **Responsive Workspace**: A sidebar-to-full-editor transition logic optimized for all viewports.

## 🛠 Tech Stack
- **Next.js 16 (App Router)**: Utilizing Turbopack for lightning-fast development.
- **React 19**: Leveraging the latest concurrent features.
- **Tailwind CSS 4**: Next-gen styling with better performance and simplified configuration.
- **Shadcn UI**: Beautifully designed components built with Radix UI.
- **Zustand**: Lightweight and scalable global state management.
- **Motion**: Advanced animations and gestures.

## 🚀 Getting Started
1. Install dependencies: `pnpm install`
2. Configure `.env.local`:
   ```env
   BACKEND_URL="http://localhost:5000"
   ```
3. Start dev server: `pnpm run dev`

## 📁 Directory Structure
- `src/app`: Next.js App Router pages, layouts, and auth flows.
- `src/components/ui`: Reusable, atomic UI components (Shadcn based).
- `src/components/features`: Feature-specific modules like `Workspace` and `Sidebar`.
- `src/hooks`: Custom React hooks for state, AI processing, and debouncing.
- `src/stores`: Zustand store definitions for global application state.
- `src/lib`: Shared utilities, Axios API client, and shared TypeScript types.
