export function updateStory(message) {
    document.getElementById('story').textContent = message;
}

export function updateInventory(inventory) {
    document.getElementById('inventory').textContent = 'Inventory: ' + (inventory.length > 0 ? inventory.join(', ') : 'Empty');
}

export function showDialog(text) {
    const dialogElement = document.getElementById('dialog');
    dialogElement.textContent = text;
    dialogElement.style.display = 'block';
}

export function showChoices(choices, onChoiceSelected) {
    const choicesElement = document.getElementById('choices');
    choicesElement.innerHTML = '';
    choices.forEach(choice => {
        const button = document.createElement('button');
        button.textContent = choice.text;
        button.onclick = () => {
            onChoiceSelected(choice);
            choicesElement.style.display = 'none';
        };
        choicesElement.appendChild(button);
    });
    choicesElement.style.display = 'flex';
}