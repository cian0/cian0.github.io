export function updateStory(message) {
    document.getElementById('story').textContent = message;
}

export function updateInventory(inventory) {
    document.getElementById('inventory').textContent = 'Inventory: ' + (inventory.length > 0 ? inventory.join(', ') : 'Empty');
}

const riddles = [
    { question: "I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?", answer: "map" },
    { question: "What has keys, but no locks; space, but no room; you can enter, but not go in?", answer: "keyboard" },
    { question: "I am not alive, but I grow; I don't have lungs, but I need air; I don't have a mouth, but water kills me. What am I?", answer: "fire" }
];

const puzzles = [
    { question: "Arrange the numbers to make the equation true: 2 _ 3 _ 4 _ 5 = 25", answer: "2x3+4+5" },
    { question: "What's the next number in the sequence? 2, 4, 8, 16, __", answer: "32" }
];

export function showRiddle(callback) {
    const riddle = riddles[Math.floor(Math.random() * riddles.length)];
    const answer = prompt(riddle.question);
    callback(answer.toLowerCase() === riddle.answer);
}

export function showPuzzle(callback) {
    const puzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
    const answer = prompt(puzzle.question);
    callback(answer === puzzle.answer);
}