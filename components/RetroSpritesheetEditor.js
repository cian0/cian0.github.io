import React, { useState, useRef, useEffect } from 'react';
import styles from '../styles/RetroSpritesheetEditor.module.css';

const RetroSpritesheetEditor = () => {
  const [frames, setFrames] = useState([]);
  const [currentFrame, setCurrentFrame] = useState(null);
  const [img, setImg] = useState(null);
  const [imgPosition, setImgPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 200, height: 200 });
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayOpacity, setOverlayOpacity] = useState(50);
  const [fps, setFps] = useState(10);
  const [isAnimating, setIsAnimating] = useState(false);

  const editorCanvasRef = useRef(null);
  const animationCanvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    drawCanvas();
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [img, imgPosition, showOverlay, currentFrame, frames, overlayOpacity]);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, dragStart]);

  const handleResize = () => {
    const container = document.querySelector(`.${styles.canvasContainer}`);
    if (container) {
      const newWidth = Math.min(container.clientWidth, 400);
      setCanvasSize(prev => ({ ...prev, width: newWidth, height: newWidth }));
    }
  };

  const drawCanvas = () => {
    const canvas = editorCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (img) {
      ctx.drawImage(img, imgPosition.x, imgPosition.y);
    }
    
    if (showOverlay && currentFrame !== null && frames[currentFrame]) {
      ctx.globalAlpha = overlayOpacity / 100;
      ctx.drawImage(frames[currentFrame], 0, 0);
      ctx.globalAlpha = 1;
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const newImg = new Image();
    newImg.onload = () => {
      URL.revokeObjectURL(newImg.src);
      setImg(newImg);
      setImgPosition({ x: 0, y: 0 });
    };
    newImg.src = URL.createObjectURL(file);
  };

  const handleCanvasSizeChange = (e) => {
    const { name, value } = e.target;
    setCanvasSize(prev => ({ ...prev, [name]: parseInt(value) }));
  };

  const handleMouseDown = (e) => {
    handleStart(e.clientX, e.clientY);
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };

  const handleStart = (clientX, clientY) => {
    if (img) {
      setIsDragging(true);
      const rect = editorCanvasRef.current.getBoundingClientRect();
      setDragStart({
        x: clientX - rect.left - imgPosition.x,
        y: clientY - rect.top - imgPosition.y
      });
    }
  };

  const handleMouseMove = (e) => {
    handleMove(e.clientX, e.clientY);
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };

  const handleMove = (clientX, clientY) => {
    if (isDragging && img) {
      const rect = editorCanvasRef.current.getBoundingClientRect();
      setImgPosition({
        x: clientX - rect.left - dragStart.x,
        y: clientY - rect.top - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const addFrame = () => {
    const canvas = document.createElement('canvas');
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(editorCanvasRef.current, 0, 0);
    
    setFrames(prev => [...prev, canvas]);
    setCurrentFrame(frames.length);
  };

  const deleteFrame = (index) => {
    setFrames(prev => prev.filter((_, i) => i !== index));
    if (currentFrame >= frames.length - 1) {
      setCurrentFrame(frames.length - 2);
    }
  };

  const animate = () => {
    if (frames.length === 0) {
      alert('Please add at least one frame before animating.');
      return;
    }
    setIsAnimating(true);

    const canvas = animationCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let currentAnimationFrame = 0;
    let lastFrameTime = 0;

    const step = (timestamp) => {
      if (!lastFrameTime) lastFrameTime = timestamp;

      const interval = 1000 / fps;
      const elapsed = timestamp - lastFrameTime;

      if (elapsed > interval) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(frames[currentAnimationFrame], 0, 0, canvas.width, canvas.height);
        currentAnimationFrame = (currentAnimationFrame + 1) % frames.length;
        lastFrameTime = timestamp - (elapsed % interval);
      }

      animationRef.current = requestAnimationFrame(step);
    };

    animationRef.current = requestAnimationFrame(step);
  };

  return (
    <div className={`retro-container ${styles.spritesheetEditor}`}>
      <div className="retro-post">
        <div className="retro-header">
          🎬 Retro Spritesheet Editor 🖼️
        </div>
        <div className="retro-section">
          <div className={styles.editorContainer}>
            <div className={styles.canvasContainer}>
              <canvas
                ref={editorCanvasRef}
                width={canvasSize.width}
                height={canvasSize.height}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
              />
            </div>
            <div className={styles.controls}>
              <input type="file" onChange={handleImageUpload} className="retro-input" />
              <div>
                <label htmlFor="width">Canvas Width:</label>
                <input
                  type="number"
                  id="width"
                  name="width"
                  value={canvasSize.width}
                  onChange={handleCanvasSizeChange}
                  className="retro-input"
                />
              </div>
              <div>
                <label htmlFor="height">Canvas Height:</label>
                <input
                  type="number"
                  id="height"
                  name="height"
                  value={canvasSize.height}
                  onChange={handleCanvasSizeChange}
                  className="retro-input"
                />
              </div>
              <div>
                <input
                  type="checkbox"
                  id="showOverlay"
                  checked={showOverlay}
                  onChange={(e) => setShowOverlay(e.target.checked)}
                />
                <label htmlFor="showOverlay">Show Overlay</label>
              </div>
              <div>
                <label htmlFor="overlayOpacity">Overlay Opacity:</label>
                <input
                  type="range"
                  id="overlayOpacity"
                  min="0"
                  max="100"
                  value={overlayOpacity}
                  onChange={(e) => setOverlayOpacity(parseInt(e.target.value))}
                />
              </div>
              <button onClick={addFrame} className="retro-button">Add Frame</button>
              <button onClick={animate} className="retro-button">Animate</button>
            </div>
          </div>
        </div>
        <div className={styles.framesContainer}>
          {frames.map((frame, index) => (
            <div key={index} className={styles.framePreviewContainer}>
              <canvas
                width="100"
                height="100"
                className={`${styles.framePreview} ${index === currentFrame ? styles.active : ''}`}
                onClick={() => setCurrentFrame(index)}
                ref={(canvasElem) => {
                  if (canvasElem) {
                    const ctx = canvasElem.getContext('2d');
                    ctx.drawImage(frame, 0, 0, 100, 100);
                  }
                }}
              />
              <button onClick={() => deleteFrame(index)} className={styles.deleteFrame}>X</button>
            </div>
          ))}
        </div>
        {isAnimating && (
          <div className={styles.animationContainer}>
            <h3 className="retro-header">Animation Preview</h3>
            <canvas ref={animationCanvasRef} width={canvasSize.width} height={canvasSize.height} />
            <div>
              <label htmlFor="fpsInput">FPS:</label>
              <input
                type="number"
                id="fpsInput"
                value={fps}
                onChange={(e) => setFps(parseInt(e.target.value))}
                min="1"
                max="60"
                className="retro-input"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RetroSpritesheetEditor;