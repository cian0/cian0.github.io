export function updateStory(message) {
    document.getElementById('story').textContent = message;
}

export function updateInventory(inventory) {
    document.getElementById('inventory').textContent = 'Inventory: ' + (inventory.length > 0 ? inventory.join(', ') : 'Empty');
}