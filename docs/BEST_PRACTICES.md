# Development Best Practices

Guidelines for maintaining and contributing to the Bamboozle codebase.

## Frontend (React & TypeScript)

### React Components
- **Functional Components**: Use standard function declarations (e.g., `export const MyComponent = () => {}`).
- **Hooks**: Isolate side effects in custom hooks.
- **Props Interface**: Define a `Props` interface for component props immediately before the component.
- **TSDoc**: Add TSDoc comments for complex logic and public interfaces.

### State Management
- **Single Source of Truth**: `useGameService` is the central store.
- **Derived State**: Compute derived values (e.g., `playerCount`) during rendering or with `useMemo` if expensive.
- **Immutability**: Always update state immutably (e.g., `...prev, newProp: value`).

### Styling (Tailwind CSS)
- **Utility Classes**: Use Tailwind utility classes directly in `className`.
- **Clsx**: Use `clsx` or template literals for conditional styling.
- **Spacing**: Follow the 4-pixel grid (e.g., `p-4` = 16px).
- **Colors**: Use the `theme` defined in `tailwind.config.js`.

### Responsiveness
- **Mobile First**: Write styles for mobile first, then use `md:` or `lg:` breakpoints for larger screens.
  - Example: `className="text-sm md:text-lg"`
- **Avoid Height Issues**: On mobile browsers, `100vh` can be problematic due to the address bar. Use `h-full` within a fixed container or CSS custom properties.

## Backend (Socket.IO & Node.js)

### Event Handling
- **Broadcasting**: Use `io.to(roomCode).emit(...)` for room-wide updates.
- **Validation**: Validate all incoming payloads.
- **Disconnect Handling**: Handle player disconnects gracefully (remove from room, notify Host).

### Audio & TTS
- **Caching**: Permanent caching in Google Cloud Storage is the primary storage method.
- **Pre-Caching**: Always use the **Admin Dashboard** to pre-generate static assets before peak usage to minimize API latency and costs.
- **Error Handling**: Provide fallback logic if Google Cloud storage or TTS fails (falls back to browser `speechSynthesis`).

## Git Workflow
- **Features**: Develop features on separate branches.
- **Commits**: Write descriptive commit messages (e.g., `feat: Add player disconnect handling`).
- **PR Reviews**: Review code for logic, style, and potential edge cases.
