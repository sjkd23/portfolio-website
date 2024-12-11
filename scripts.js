const pieces = document.querySelectorAll('.puzzle-piece');
let dragSrcEl = null;

pieces.forEach(piece => {
    piece.addEventListener('dragstart', dragStart);
    piece.addEventListener('dragover', dragOver);
    piece.addEventListener('drop', drop);
    piece.addEventListener('dragend', dragEnd);
});

function dragStart(e) {
    dragSrcEl = this;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.outerHTML);
    this.classList.add('dragElem');
}

function dragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function drop(e) {
    e.preventDefault();

    if (dragSrcEl !== this) {
        // Swap the elements
        dragSrcEl.outerHTML = this.outerHTML;
        this.outerHTML = e.dataTransfer.getData('text/html');

        // Reattach event listeners
        const newPieces = document.querySelectorAll('.puzzle-piece');
        newPieces.forEach(piece => {
            piece.addEventListener('dragstart', dragStart);
            piece.addEventListener('dragover', dragOver);
            piece.addEventListener('drop', drop);
            piece.addEventListener('dragend', dragEnd);
        });

        // Check if the puzzle is complete
        checkOrder();
    }
}

function dragEnd(e) {
    this.classList.remove('dragElem');
}

function checkOrder() {
    const containers = document.querySelectorAll('.left-images, .right-images');
    let pieces = [];

    containers.forEach(container => {
        pieces = pieces.concat(Array.from(container.children));
    });

    // Group pieces by their positions on the grid
    const gridPositions = {};

    // Assuming your grid is 4 columns wide
    const columns = 4;

    pieces.forEach((piece, index) => {
        const row = Math.floor(index / columns);
        const col = index % columns;
        gridPositions[`${row}-${col}`] = piece;
    });

    // Function to check if a 2x2 block forms a complete image
    function checkBlock(row, col) {
        const positions = ['TL', 'TR', 'BL', 'BR'];
        const piecesInBlock = [];

        positions.forEach((pos, idx) => {
            const r = row + Math.floor(idx / 2);
            const c = col + (idx % 2);
            const key = `${r}-${c}`;
            if (gridPositions[key]) {
                piecesInBlock.push(gridPositions[key]);
            }
        });

        if (piecesInBlock.length === 4) {
            const imageNames = piecesInBlock.map(piece => piece.getAttribute('data-image'));
            const uniqueImages = new Set(imageNames);
            if (uniqueImages.size === 1) {
                const positions = piecesInBlock.map(piece => piece.getAttribute('data-position'));
                const requiredPositions = ['TL', 'TR', 'BL', 'BR'];
                const hasAllPositions = requiredPositions.every(pos => positions.includes(pos));
                if (hasAllPositions) {
                    return imageNames[0]; // Return the name of the completed image
                }
            }
        }
        return null;
    }

    // Check all possible 2x2 blocks
    const completedImages = new Set();
    const totalRows = Math.ceil(pieces.length / columns);
    for (let row = 0; row < totalRows - 1; row++) {
        for (let col = 0; col < columns - 1; col++) {
            const completedImage = checkBlock(row, col);
            if (completedImage) {
                completedImages.add(completedImage);
            }
        }
    }

    if (completedImages.size === 4) {
        alert('Congratulations! All images are assembled correctly.');
    }
}

// Add event listener for the Skip Puzzle button
document.getElementById('skip-button').addEventListener('click', skipPuzzle);

function skipPuzzle() {
    // Get all puzzle pieces
    const containers = document.querySelectorAll('.left-images, .right-images');
    let pieces = [];
    containers.forEach(container => {
        pieces = pieces.concat(Array.from(container.children));
    });

    // Define the correct order of pieces
    const correctOrder = [
        { image: 'robot', position: 'TL' },
        { image: 'robot', position: 'TR' },
        { image: 'robot', position: 'BL' },
        { image: 'robot', position: 'BR' },
        { image: 'fish', position: 'TL' },
        { image: 'fish', position: 'TR' },
        { image: 'fish', position: 'BL' },
        { image: 'fish', position: 'BR' },
        { image: 'pirate', position: 'TL' },
        { image: 'pirate', position: 'TR' },
        { image: 'pirate', position: 'BL' },
        { image: 'pirate', position: 'BR' },
        { image: 'space', position: 'TL' },
        { image: 'space', position: 'TR' },
        { image: 'space', position: 'BL' },
        { image: 'space', position: 'BR' }
    ];

    // Sort the pieces according to the correct order
    pieces.sort((a, b) => {
        const aIndex = correctOrder.findIndex(item =>
            item.image === a.getAttribute('data-image') &&
            item.position === a.getAttribute('data-position')
        );
        const bIndex = correctOrder.findIndex(item =>
            item.image === b.getAttribute('data-image') &&
            item.position === b.getAttribute('data-position')
        );
        return aIndex - bIndex;
    });

    // Clear containers
    containers.forEach(container => {
        container.innerHTML = '';
    });

    // Append sorted pieces back to the containers
    const totalPieces = pieces.length;
    const leftContainer = document.querySelector('.left-images');
    const rightContainer = document.querySelector('.right-images');

    // Distribute pieces between the two containers
    pieces.forEach((piece, index) => {
        if (index < totalPieces / 2) {
            leftContainer.appendChild(piece);
        } else {
            rightContainer.appendChild(piece);
        }
    });

    // Reattach event listeners
    const newPieces = document.querySelectorAll('.puzzle-piece');
    newPieces.forEach(piece => {
        piece.addEventListener('dragstart', dragStart);
        piece.addEventListener('dragover', dragOver);
        piece.addEventListener('drop', drop);
        piece.addEventListener('dragend', dragEnd);
    });

    // Check if the puzzle is complete
    checkOrder();
}