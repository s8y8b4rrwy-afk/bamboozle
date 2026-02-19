---
name: documentation-standards
description: A comprehensive guide on maintaining documentation, coding standards, and best practices for the Bamboozle codebase.
---

# Documentation Standards & Best Practices

This skill provides guidelines for documenting the Bamboozle codebase. Use these standards when adding new features or refactoring existing code to ensure consistency and maintainability.

## 1. Codebase Structure

### Directory Organization
- **`/components`**: Reusable UI components (buttons, avatars, cards).
- **`/views`**: Major application screens (Host, Player, Lobby).
- **`/services`**: Core business logic and external integrations (GameService, AudioService).
- **`/types.ts`**: Centralized TypeScript definitions.
- **`/i18n`**: Localization files.
- **`/server`**: Node.js backend for socket.io handling and TTS generation.

## 2. Documentation Guidelines

### Component Documentation (TSDoc)
All major components should have a TSDoc comment explaining their purpose, props, and any side effects.

```tsx
/**
 * Displays the current game question with blank placeholders.
 *
 * @param fact - The question text with <BLANK> markers.
 * @param phase - Current game phase (affects visibility).
 * @returns JSX.Element
 */
export const QuestionDisplay = ({ fact, phase }: Props) => { ... }
```

### Service Documentation
Services managing state or side effects must document:
1. **Public API Methods**: What they do and expected inputs.
2. **Events Emitted**: For socket services.
3. **State Managed**: What part of the global state they control.

### READMEs
Each major subsystem (Audio, Network, Game Logic) should have a dedicated markdown file in `/docs`.

## 3. Best Practices

### State Management
- Use `useGameService` for global game state.
- Avoid prop drilling deeper than 2 levels; use composition or context if necessary.
- **Do not** mutate state directly; always use the provided setter actions.

### Styling
- Use **Tailwind CSS** for all styling.
- Avoid inline `style={{ ... }}` unless dynamic (e.g., coordinates).
- Use `clsx` or template literals for conditional classes.

### Responsiveness
- **Mobile First**: Design for mobile screens first, then enhance for desktop (`md:` prefix).
- Use `min-h-screen` and `h-full` carefully to avoid scrolling issues on mobile browsers (Safari address bar).

### Online Play & Networking
- All game-critical actions must be sent via `socket.emit`.
- Listen for `gameStateUpdate` to sync changes.
- Handle reconnection logic in `useGameService` (persist `playerId` and `roomCode`).

## 4. Workflows

### Adding a New Game Phase
1. Update `types.ts`: Add new `GamePhase` enum value.
2. Update `gameService.ts`: Handle phase transition in `processHostEvent` or server-side logic.
3. Update `HostView.tsx` & `PlayerView.tsx`: Render appropriate components for the new phase.
4. Add applicable TSDoc comments.

### Adding a New Socket Event
1. Update `GameEvent` type in `types.ts`.
2. Add handler in `gameService.ts` (`processHostEvent` or socket listener).
3. Update server-side logic if the event requires broadcasting or validation.
