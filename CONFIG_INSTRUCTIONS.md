# Game Configuration Instructions

This document provides detailed instructions on how to create and modify the JSON configuration file for the Level 2 Charade game.

## File Structure

The configuration file should be named `game-config.json` and placed in the root directory of the project./ask

## JSON Structure

The JSON file contains the following main sections:

1. Global game settings
2. Array of puzzle objects

### Global Game Settings

- `totalPuzzles`: The total number of puzzles in the game (integer)
- `timePerPuzzle`: Time allowed for each puzzle in seconds (integer)
- `initialRevealedLetters`: Number of letters to reveal at the start of each puzzle (integer)

### Puzzle Objects

Each puzzle is represented by an object in the `puzzles` array. Each puzzle object contains:

- `word`: The word to be guessed (string, uppercase)
- `emojis`: An array of two emojis representing the word components (array of strings)
- `theme`: The theme of the puzzle (string)
- `background`: CSS gradient for the background (string)
- `elements`: An array of theme-related emojis for background animation (array of strings)

## Example Configuration

```json
{
    "totalPuzzles": 5,
    "timePerPuzzle": 20,
    "initialRevealedLetters": 2,
    "puzzles": [
        {
            "word": "SEASHELL",
            "emojis": ["🌊", "🐚"],
            "theme": "ocean",
            "background": "linear-gradient(135deg, #006994, #00FFFF)",
            "elements": ["🐙", "🦀", "🐠", "🌊", "🏖️", "🐳"]
        },
        // More puzzle objects...
    ]
}
```

## How to Add or Modify Puzzles

1. To add a new puzzle, create a new object in the `puzzles` array following the structure above.
2. To modify an existing puzzle, locate its object in the `puzzles` array and update the desired properties.

### Guidelines for Creating Puzzles

1. **Word Selection**: Choose compound words that can be represented by two distinct emojis.
2. **Emoji Selection**: Select two clear and relevant emojis that represent the components of the word.
3. **Theme**: Choose a theme that relates to the word and influences the background and animations.
4. **Background**: Use a CSS linear gradient that fits the theme. Format: `"linear-gradient(135deg, [color1], [color2])"`
5. **Elements**: Select 5-6 emojis that relate to the theme for background animations.

## Validating the Configuration

After modifying the JSON file:

1. Ensure the JSON is valid. You can use online JSON validators or your code editor's built-in validation.
2. Check that the number of puzzle objects matches the `totalPuzzles` value.
3. Verify that each puzzle object has all required properties.
4. Test the game to ensure the new configuration loads correctly and the puzzles display as intended.

## Best Practices

1. Keep the `timePerPuzzle` consistent across all puzzles for a uniform experience.
2. Ensure `initialRevealedLetters` is less than the length of the shortest word in your puzzles.
3. Use clear, high-contrast color combinations for backgrounds to ensure readability.
4. Test the game on various screen sizes to ensure the chosen words and emojis display well on all devices.

By following these instructions, you can easily create and modify the game configuration to add new puzzles or adjust the game settings.
