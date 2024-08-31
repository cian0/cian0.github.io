This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
# portfolio
# JSON-Driven Animation System

This document provides a comprehensive guide on how to create JSON animations using our custom animation system. This system allows you to create complex, interactive animations using a simple JSON structure.

## Table of Contents

1. [Overview](#overview)
2. [JSON Structure](#json-structure)
3. [Elements](#elements)
4. [Animation Steps](#animation-steps)
5. [Particle Systems](#particle-systems)
6. [Scene Management](#scene-management)
7. [Camera Controls](#camera-controls)
8. [Dialogs](#dialogs)
9. [Custom Functions](#custom-functions)
10. [Best Practices](#best-practices)

## Overview

The JSON-driven animation system allows you to define complex animations using a declarative JSON structure. This structure describes the elements in your animation, their properties, and the sequence of steps that make up the animation.

## JSON Structure

The main JSON structure consists of two primary sections:

1. `elements`: Defines all the visual elements in your animation.
2. `steps`: Defines the sequence of actions that make up your animation.

Example:

```json
{
    "elements": {
        // Element definitions go here
    },
    "steps": [
        // Animation steps go here
    ]
}
```

## Elements

Elements are the visual components of your animation. Each element is defined with a unique key and has properties that describe its appearance and behavior.

### Element Types

1. **Background**: Sets the overall scene background.
2. **Characters**: Animated figures in the scene (e.g., superhero, wizard).
3. **Props**: Static or animated objects in the scene (e.g., buildings, clouds).
4. **Overlays**: Elements that cover the entire scene (e.g., transition effects).
5. **Particle Systems**: Special effects using multiple small elements.

### Element Properties

- `class`: CSS class for styling.
- `content`: Text content or SVG for the element.
- `style`: CSS styles applied to the element.
- `scenes`: Array of scene names where the element appears.

Example:

```json
"superhero": {
    "class": "character",
    "content": "🦸‍♂️",
    "style": {
        "position": "absolute",
        "font-size": "80px",
        "bottom": "20%",
        "left": "20%",
        "z-index": "3"
    },
    "scenes": ["city", "sky", "castle"]
}
```

## Animation Steps

Animation steps define the sequence of actions in your animation. Each step is an object with properties that describe the action to be performed.

### Step Types

1. `changeScene`: Switch to a different scene.
2. `set`: Set properties of an element.
3. `to`: Animate properties of an element.
4. `dialog`: Display a dialog bubble.
5. `startParticles`: Start a particle system effect.
6. `stopParticles`: Stop a particle system effect.
7. `function`: Call a custom function.

Example:

```json
{
    "type": "to",
    "target": "superhero",
    "props": {
        "duration": 1,
        "x": "100px",
        "y": "-50px",
        "ease": "power2.out"
    }
}
```

## Particle Systems

Particle systems create special effects using multiple small elements. They are defined in the `elements` section and started using the `startParticles` step.

Example:

```json
"heroEnergy": {
    "type": "particle",
    "options": {
        "emoji": "⚡",
        "number": 30,
        "size": 30,
        "opacity": 0.7,
        "duration": 1.5,
        "durationVariation": 0.5,
        "movementType": "explosion",
        "centerX": "30%",
        "centerY": "70%"
    }
}
```

## Scene Management

Scenes allow you to group elements and create distinct parts of your animation. Use the `changeScene` step to switch between scenes.

Example:

```json
{
    "type": "changeScene",
    "sceneName": "sky"
}
```

## Camera Controls

Camera controls allow you to zoom and pan the view. Use the `zoomCamera` and `resetCamera` functions.

Example:

```json
{
    "type": "function",
    "function": "zoomCamera",
    "args": ["buildings", 1.5, 2]
}
```

## Dialogs

Dialogs display speech bubbles for characters. Use the `dialog` step type.

Example:

```json
{
    "type": "dialog",
    "target": "superhero",
    "text": "Evil wizard! Your reign of terror ends now! ⚡️",
    "duration": 3
}
```

## Custom Functions

Custom functions allow you to extend the animation system with your own logic. Use the `function` step type to call them.

Example:

```json
{
    "type": "function",
    "function": "addCurrentParticleSystem",
    "args": ["heroEnergy"]
}
```

## Best Practices

1. **Organize your elements**: Group related elements and use clear, descriptive names.
2. **Use scenes**: Divide your animation into logical scenes for better organization.
3. **Reuse elements**: Define elements once and reuse them across multiple scenes.
4. **Balance complexity**: While the system is powerful, overly complex animations can be hard to manage.
5. **Test incrementally**: Build your animation step by step, testing each addition.
6. **Use comments**: Although JSON doesn't support comments natively, you can use description fields to add notes.
7. **Optimize performance**: Be mindful of the number of elements and particles to ensure smooth animations.

By following this guide, you can create rich, interactive animations using our JSON-driven animation system. Experiment with different combinations of elements, steps, and effects to bring your stories to life!
