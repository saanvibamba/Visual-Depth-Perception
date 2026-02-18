# DepthShift
## A Depth Perception Puzzle Platformer

Overview

DepthShift is a 2D puzzle-platformer game inspired by classic side-scrolling platformers (e.g., Mario-style movement), designed to explore psychological principles of visual perception, specifically depth perception.
The game challenges players to navigate a 2D environment that visually mimics 3D space using perceptual cues such as:
- Occlusion
- Relative size
- Shading and shadow
- Parallax motion
- Perspective lines

The player must activate a hidden key block, collect the revealed key, and unlock the exit door to complete the level.

## Psychological Concepts Used

1. Monocular Depth Cues
The game relies on pictorial depth cues to create the illusion of 3D space in a 2D canvas:
- Occlusion – Objects overlap to create a perception of foreground/background.
- Relative size – Smaller objects appear further away.
- Linear perspective – Converging lines inside the illusion room suggest depth.
- Motion parallax – Background layers move at different speeds relative to the camera.

2. Dorsal (“Where/How”) Pathway
The game engages the dorsal stream by requiring spatial navigation and depth judgments. Players must interpret visual cues to determine:
- Platform placement
- Enemy positions
- The perceived depth of the illusion room

3. Top-Down Processing & The Beholder’s Share
Players construct their perception of depth using prior experience with platformers and environmental cues. The illusion room demonstrates that perception is actively constructed, not passively received.

## Gameplay Mechanics
- Arrow keys: Move left/right
- Spacebar: Jump
- Jump into the hidden key block to activate it
- Collect the revealed key
- Unlock and enter the exit door
- If the player collides with an enemy or falls off the map, they die and restart.

## Artistic Design Choices
- Soft parallax clouds to simulate background depth
- Layered platform shading to imply 3D thickness
- Drop shadows to enhance object separation
- A visually ambiguous “illusion room” to manipulate spatial interpretation

# Technologies Used
- JavaScript
- p5.js
- HTML5 Canvas
- VS Code

## Educational Purpose
This project demonstrates how visual art and game design can operationalize psychological principles. It serves as an interactive exploration of how humans construct depth perception from flat visual stimuli.

## Link To Play
https://saanvibamba.github.io/Visual-Depth-Perception/