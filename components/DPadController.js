import React from 'react';

const DPadController = ({ onDirectionChange }) => {
    const handleButtonPress = (direction) => {
        onDirectionChange(direction, true);
    };

    const handleButtonRelease = (direction) => {
        onDirectionChange(direction, false);
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5px', width: '150px', height: '150px' }}>
            <div></div>
            <button
                className="nes-btn"
                onMouseDown={() => handleButtonPress('up')}
                onMouseUp={() => handleButtonRelease('up')}
                onTouchStart={() => handleButtonPress('up')}
                onTouchEnd={() => handleButtonRelease('up')}
            >
                ▲
            </button>
            <div></div>
            <button
                className="nes-btn"
                onMouseDown={() => handleButtonPress('left')}
                onMouseUp={() => handleButtonRelease('left')}
                onTouchStart={() => handleButtonPress('left')}
                onTouchEnd={() => handleButtonRelease('left')}
            >
                ◀
            </button>
            <div></div>
            <button
                className="nes-btn"
                onMouseDown={() => handleButtonPress('right')}
                onMouseUp={() => handleButtonRelease('right')}
                onTouchStart={() => handleButtonPress('right')}
                onTouchEnd={() => handleButtonRelease('right')}
            >
                ▶
            </button>
            <div></div>
            <button
                className="nes-btn"
                onMouseDown={() => handleButtonPress('down')}
                onMouseUp={() => handleButtonRelease('down')}
                onTouchStart={() => handleButtonPress('down')}
                onTouchEnd={() => handleButtonRelease('down')}
            >
                ▼
            </button>
            <div></div>
        </div>
    );
};

export default DPadController;
