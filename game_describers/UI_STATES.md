# UI States and Descriptions

This document outlines the various states of the game's user interface (UI) and provides a description of what the player should see in each state. The overall aesthetic should be clean, futuristic, and infused with mathematical and quantum-inspired motifs.

## 1. Connecting State

This is the initial state of the game when the client is attempting to establish a connection with the WebSocket server. The goal is to create a sense of anticipation and technological immersion.

-   **Visuals**:
    -   **Background**: A dark, deep-space background with slowly drifting stars and faint, glowing nebulae in the distance.
    -   **Central Element**: A pulsating, abstract geometric shape in the center of the screen, reminiscent of a quantum wave function collapsing and reforming.
    -   **Text**: Below the shape, the text **"Connecting..."** appears in a clean, sans-serif font (like Orbitron or Exo). The text should have a subtle glow effect, synchronized with the pulse of the central shape.
-   **Animation**:
    -   The central shape should pulse gently, with light emitting from its core.
    -   The "Connecting..." text should fade in and out slowly.
-   **Functionality**:
    -   The game is actively trying to connect to the server.
    -   No other UI elements are visible or interactive.

## 2. Connected / In-Game HUD

Once a connection is established, the player enters the game world, and the main Heads-Up Display (HUD) becomes visible. The HUD should be minimalistic and non-intrusive, providing essential information without cluttering the view.

-   **Visuals**:
    -   **Connection Status**: The "Connecting..." text is replaced with a vibrant, cyan **"Connection Established"** message, which then fades out.
    -   **Health Bar**: A sleek, thin bar at the bottom-left of the screen. It should be a bright, solid color (e.g., cyan) that depletes to a darker, desaturated color as the player takes damage.
    -   **Weapon & Ammo UI**: In the bottom-right corner, this UI displays:
        -   The weapon name in a stylized, angular font.
        -   Ammo count shown as `current/total` (e.g., `30/150`), with the numbers having a slight digital glow.
    -   **Kill Feed**: In the top-right corner, displaying `[Player A] eliminated [Player B]` with a custom icon for the weapon used. Entries should fade in and then slide out after a few seconds.
    -   **Crosshair**: A dynamic, geometric crosshair in the center of the screen. It could be a simple dot that expands or changes color when aiming at a target.
-   **Functionality**:
    -   All in-game controls are active.
    -   HUD elements update smoothly in real-time.

## 3. Mathematical UI (Toggleable)

This is a special UI panel that provides a deep dive into the game's mathematical systems. It should look like a sophisticated diagnostics screen.

-   **Visuals**:
    -   A semi-transparent, dark-themed overlay on the right side of the screen, with a fine grid pattern.
    -   **Title**: "MATHEMATICAL & AI ANALYSIS" at the top in a bold, capitalized font.
    -   **Data Readouts**: Real-time stats are displayed with clear labels and values that update smoothly. Each stat should have a small, corresponding icon (e.g., a fractal for complexity, a wave for quantum state).
    -   **Graphs**: A live-updating line graph could show the ebb and flow of key values like "Adaptive Difficulty".
-   **Functionality**:
    -   Toggled on/off with the 'M' key.
    -   Provides at-a-glance insight into the game's core mechanics.

## 4. Death Screen

This screen appears when the player is eliminated. It should feel impactful but not frustrating, quickly providing information and getting the player back into the action.

-   **Visuals**:
    -   The entire screen is overlaid with a deep red, vignetted filter.
    -   **Central Text**: The message **"YOU WERE ELIMINATED"** appears in large, stark white letters.
    -   **Kill Information**: Below the main text, it shows "Eliminated by: [Player Name]".
    -   **Respawn Timer**: A circular progress bar in the center of the screen counts down to respawn, with the remaining seconds displayed in the middle.
-   **Animation**:
    -   The screen should "glitch" for a moment upon death, with some digital artifacting, before the death screen fades in.
-   **Functionality**:
    -   Player controls are disabled.
    -   The player respawns automatically when the timer hits zero.

## 5. Rocket Menu (Planet Travel)

This menu appears when the player interacts with their rocket. It should feel like a futuristic navigation system.

-   **Visuals**:
    -   A holographic-style interface that appears to float in front of the player.
    -   **Planet List**: A scrollable list of available planets, each with a rotating 3D model and key stats (gravity, environment type).
    -   **Selection**: When a planet is highlighted, a glowing line connects the player's current location to the destination on a star map in the background.
-   **Functionality**:
    -   The player can use the mouse or keyboard to navigate the list.
    -   Selecting a planet and confirming initiates the travel sequence. 