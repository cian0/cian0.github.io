import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

const EmojiChessGame = () => {
    const gameRef = useRef(null);
    const [message, setMessage] = useState('White to move');
    const [gameSize, setGameSize] = useState({ width: 800, height: 800 });

    useEffect(() => {
        const handleResize = () => {
            const containerWidth = window.innerWidth;
            const containerHeight = window.innerHeight - 100; // Subtracting 100px for potential margins/paddings
            const size = Math.min(containerWidth, containerHeight);
            setGameSize({ width: size, height: size });
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        let game;
        const initPhaser = async () => {
            console.log('Initializing Phaser...');
            const Phaser = (await import('phaser')).default;
            console.log('Phaser imported successfully:', Phaser);
            
            const config = {
                type: Phaser.AUTO,
                width: gameSize.width,
                height: gameSize.height,
                parent: 'game-container',
                backgroundColor: '#111111',
                scene: {
                    create: create,
                    update: update
                }
            };
            console.log('Game configuration:', config);

            const PIECES = {
                'wk': '♔', 'wq': '♕', 'wr': '♖', 'wb': '♗', 'wn': '♘', 'wp': '♙',
                'bk': '♚', 'bq': '♛', 'br': '♜', 'bb': '♝', 'bn': '♞', 'bp': '♟️'
            };

            let board = [
                ['wr', 'wn', 'wb', 'wq', 'wk', 'wb', 'wn', 'wr'],
                ['wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp'],
                ['', '', '', '', '', '', '', ''],
                ['', '', '', '', '', '', '', ''],
                ['', '', '', '', '', '', '', ''],
                ['', '', '', '', '', '', '', ''],
                ['bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp'],
                ['br', 'bn', 'bb', 'bq', 'bk', 'bb', 'bn', 'br']
            ];

            let selectedPiece = null;
            let turn = 'w';  // 'w' for white, 'b' for black
            let pieceObjects = [];

            function create() {
                console.log('Create function called');
                
                const tileSize = config.width / 8;

                // Create chessboard
                for (let y = 0; y < 8; y++) {
                    for (let x = 0; x < 8; x++) {
                        const color = (x + y) % 2 === 0 ? 0x444444 : 0x666666;
                        this.add.rectangle(x * tileSize + tileSize / 2, y * tileSize + tileSize / 2, tileSize, tileSize, color);
                    }
                }

                // Create chess pieces
                for (let y = 0; y < 8; y++) {
                    for (let x = 0; x < 8; x++) {
                        if (board[y][x]) {
                            const piece = this.add.text(x * tileSize + tileSize / 2, y * tileSize + tileSize / 2, PIECES[board[y][x]], 
                                { fontSize: `${tileSize * 0.7}px`, color: board[y][x][0] === 'w' ? '#00FFFF' : '#FF00FF' })
                                .setOrigin(0.5)
                                .setInteractive({ draggable: true });
                            piece.pieceType = board[y][x];
                            piece.gridX = x;
                            piece.gridY = y;
                            pieceObjects.push(piece);
                        }
                    }
                }

                // Set up input events
                this.input.on('dragstart', onDragStart);
                this.input.on('drag', onDrag);
                this.input.on('dragend', onDragEnd);

                console.log('Create function completed');
            }

            function update() {
                // This function is called every frame, but we don't need it for chess
            }

            function onDragStart(pointer, gameObject) {
                if (gameObject.pieceType[0] === turn) {
                    selectedPiece = gameObject;
                    setMessage(`Dragging ${gameObject.pieceType}. Release to move.`);
                    gameObject.setTint(0x00ff00);
                } else {
                    setMessage(`It's ${turn === 'w' ? 'White' : 'Black'}'s turn.`);
                }
            }

            function onDrag(pointer, gameObject, dragX, dragY) {
                gameObject.x = dragX;
                gameObject.y = dragY;
            }

            function onDragEnd(pointer, gameObject) {
                gameObject.clearTint();
                if (selectedPiece) {
                    const tileSize = config.width / 8;
                    const newX = Math.floor(gameObject.x / tileSize);
                    const newY = Math.floor(gameObject.y / tileSize);
                    
                    if (isValidMove(selectedPiece, newX, newY)) {
                        movePiece(selectedPiece, newX, newY);
                        turn = turn === 'w' ? 'b' : 'w';
                        setMessage(`${turn === 'w' ? 'White' : 'Black'} to move`);
                    } else {
                        // Move the piece back to its original position
                        gameObject.x = selectedPiece.gridX * tileSize + tileSize / 2;
                        gameObject.y = selectedPiece.gridY * tileSize + tileSize / 2;
                        setMessage('Invalid move. Try again.');
                    }
                    
                    selectedPiece = null;
                }
            }

            function isValidMove(piece, newX, newY) {
                // This is a simplified move validation.
                // In a real chess game, you'd need to implement all the rules for each piece type.
                return newX >= 0 && newX < 8 && newY >= 0 && newY < 8 &&
                       (board[newY][newX] === '' || board[newY][newX][0] !== piece.pieceType[0]);
            }

            function movePiece(piece, newX, newY) {
                const tileSize = config.width / 8;
                // Remove the piece from its old position
                board[piece.gridY][piece.gridX] = '';
                
                // Capture opponent's piece if present
                const capturedPiece = pieceObjects.find(p => p.gridX === newX && p.gridY === newY);
                if (capturedPiece) {
                    capturedPiece.destroy();
                    pieceObjects = pieceObjects.filter(p => p !== capturedPiece);
                }
                
                // Move the piece to the new position
                board[newY][newX] = piece.pieceType;
                piece.gridX = newX;
                piece.gridY = newY;
                piece.x = newX * tileSize + tileSize / 2;
                piece.y = newY * tileSize + tileSize / 2;
            }

            if (gameRef.current) {
                console.log('Creating new Phaser game instance');
                game = new Phaser.Game(config);
                console.log('Phaser game instance created:', game);
            } else {
                console.error('Game container ref is null');
            }
        };

        initPhaser().catch(error => {
            console.error('Error initializing Phaser:', error);
        });

        return () => {
            if (game) {
                console.log('Destroying Phaser game instance');
                game.destroy(true);
            }
        };
    }, [gameSize]);

    return (
        <div className="retro-post" style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <div ref={gameRef} id="game-container" style={{ width: `${gameSize.width}px`, height: `${gameSize.height}px` }}></div>
            <div className="retro-section" style={{ marginTop: '1rem', textAlign: 'center' }}>
                <p className="retro-text">{message}</p>
                <p className="retro-text">Drag and drop pieces to move them.</p>
            </div>
        </div>
    );
};

// Use dynamic import with ssr: false for this component
export default dynamic(() => Promise.resolve(EmojiChessGame), {
    ssr: false
});
