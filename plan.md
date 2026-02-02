# Online Friends Mode Implementation Plan

## Goal
Enable a "Single Device Mode" (Online Friends Mode) where each player sees the full game experience (visuals, animations, scores) on their own device, eliminating the need for a shared "Big Screen" host device.

## Core Logic
- The game normally runs in **Split Mode**: One "Host" screen (TV) + Many "Player" screens (Controllers).
- New **Online Mode**: The "Host" screen is virtual/hidden or just used for control. The "Player" screens become hybrid: they show the TV content + the Controller inputs.

## Step-by-Step Implementation

### 1. State Management (types.ts)
- Add \`isOnlineMode: boolean\` to \`GameState\`.
- Default to \`false\` (Classic TV Mode).

### 2. Backend / Service (services/gameService.ts)
- Add action \`toggleOnlineMode\` that emits an event to the server.
- Server broadcasts this state change to all clients.

### 3. Host UI (views/HostView.tsx)
- In the \`LOBBY\` phase, add a visible toggle switch: "Online Friends Mode (Single Screen)".
- This allows the host to enable this mode before starting the game.

### 4. Player UI (views/PlayerView.tsx)
- **Conditional Rendering**:
    - **Classic Mode (isOnlineMode: false)**: Keep the current optimized "Controller-only" UI.
    - **Online Mode (isOnlineMode: true)**:
        - Render the \`HostView\` components (Narrator, Question display, Revealer, Leaderboard) as the main view.
        - Overlay the interactive elements (Input Box, Vote Buttons) on top of this view.
        - Ensure responsive design so the "TV View" looks good on mobile (stacking instead of side-by-side).

### 5. Component Refactoring
- **Reuse**: The logic inside \`HostView\` (rendering the question, showing the reveal loop) needs to be accessible to \`PlayerView\`.
- **Strategy**:
    - Extract key visual components from \`HostView\` if they are too tightly coupled, OR:
    - Simply import the components used in \`HostView\` (like \`Narrator\`, 
    - We will replicate the visual structure in \`PlayerView\` using the existing components (\`Avatar\`, \`Narrator\`, etc.) to ensure it fits the mobile form factor, rather than literally mounting the entire \`HostView\` component which might have host-specific controls.

## User Journey
1. Host opens game, sees "Lobby"., If it detects a phone it asks the user if they want the online friends mode.
2. Host toggles "Online Friends Mode".
3. Players join on their phones.
4. Instead of just seeing "Waiting...", players see the full lobby avatar grid on their phones.
5. Game starts.
6. **Writing Phase**: Players see the full question animation on top, with the input box below.
7. **Voting Phase**: Players see all answers presented nicely (like the TV), with vote buttons overlaying.
8. **Reveal Phase**: Players watch the suspenseful reveal animation on their own device.
9. **Leaderboard**: Players see the full scoreboard.

## Technical Tasks
- [ ] Update \`GameState\` type.
- [ ] Update \`gameService\` to handle toggle.
- [ ] Add Toggle UI to \`HostView\`.
- [ ] Create \`OnlinePlayerView\` wrapper component.
- [ ] Integrate "TV" visuals into \`OnlinePlayerView\` for each phase:
    - Lobby (Avatar Grid)
    - Writing (Question Display)
    - Voting (Option List)
    - Reveal (Step-by-step reveal)
    - Leaderboard (Full list)