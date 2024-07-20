export function updateScore(score) {
    document.getElementById('score').textContent = `Score: ${score}`;
}

export function updateHighScore(highScore) {
    document.getElementById('high-score').textContent = `High Score: ${highScore}`;
}