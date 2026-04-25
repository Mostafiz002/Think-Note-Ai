<!-- BEGIN:nextjs-agent-rules -->
📂 Architectural Rules
Modular Organization: Maintain a strict separation of concerns.

src/hooks/: All custom logic (e.g., useEditor, useAI).

src/context/: Global states (e.g., AuthContext, NoteContext).

src/components/: Atomic design (UI, Layout, Features).

Type Safety: Every hook and context must be fully typed with TypeScript interfaces.

Performance: Use useMemo and useCallback within hooks to prevent unnecessary re-renders in the note editor.

🏛 Structural Integrity: "The Separation Mandate"
1. Zero Logic in page.tsx
Rule: Pages are for routing and layout only.

Implementation: page.tsx should only serve as a "shell" that imports and arranges feature-level components.

Constraint: No useEffect, useState, or complex event handlers should live in a page.tsx file.

2. Atomic Function Extraction
Rule: If a function is more than 5 lines or performs a specific calculation/transformation, move it out.

Folders:

src/lib/: For pure utility functions (e.g., formatNoteDate.ts, truncateAIResponse.ts).

src/services/: For external API calls (e.g., openai.service.ts, supabase.service.ts).

src/actions/: For Next.js Server Actions.

3. Custom Hook Pattern
Rule: All stateful logic related to a feature must be encapsulated in a Custom Hook.

Example: Instead of handling editor state in the component, use const { content, saveNote, isSyncing } = useNoteEditor(noteId);.

Benefit: This keeps components "dumb" (presentational) and makes the logic "smart" and reusable.

🌌 Design Rules: "Futuristic Notion"
1. The "Glass-Grid" Surface
Background: Use a deep charcoal or midnight-black background with a subtle, non-scrolling SVG dot grid (opacity 0.05).

Panels: Use backdrop-blur-xl combined with a 1px border of white/10. Surfaces should look like floating panes of glass.

Shadows: Replace heavy black shadows with soft, colored "ambient glows" that match the UI accent (e.g., a faint violet glow under the active note).

2. Interactive Logic
Cursor States: All interactive elements (buttons, menu items, sidebar links) must explicitly have cursor: pointer.

Magnetic Hover: Buttons should utilize a subtle scale-[1.02] transition on hover to feel responsive.

AI Indicators: AI-driven features (Rewrite, Summarize) should use a shimmering gradient text effect or a "breathing" border animation to indicate active "intelligence."

3. Typography & Layout
Monospace Accents: While the main note text should be a clean Sans-serif (like Inter), use a Monospace font for metadata (dates, word counts, AI status) to give it a "terminal" feel.

Slash Commands: Maintain the / command menu logic from Notion, but render the menu with a neon-border glow and micro-interactions for each selection.

4. Motion & Transitions (Framer Motion)
Layout Transitions: Notes should "slide and fade" into view when opened.

Loading States: Use "Pulse" animations for skeleton loaders that move in a linear gradient, simulating data flowing through a circuit.

<!-- END:nextjs-agent-rules -->
