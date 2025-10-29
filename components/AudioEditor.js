import React, { useState, useRef, useEffect } from 'react';
import styles from '../styles/AudioEditor.module.css';
import lamejs from 'lamejs';

const AudioEditor = () => {
  const [audioFile, setAudioFile] = useState(null);
  const [audioBuffer, setAudioBuffer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selection, setSelection] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [originalDuration, setOriginalDuration] = useState(0);
  const [splitPoints, setSplitPoints] = useState([]);
  const [exportFormat, setExportFormat] = useState('wav');
  
  const audioContextRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const canvasRef = useRef(null);
  const waveformContainerRef = useRef(null);
  const startTimeRef = useRef(0);
  const animationFrameRef = useRef(null);
  const drawRequestRef = useRef(null);
  const isDrawingRef = useRef(false);

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (audioBuffer) {
      drawWaveform();
    }
  }, [audioBuffer, zoom]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    setAudioFile(file);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      setAudioBuffer(buffer);
      setDuration(buffer.duration);
      setOriginalDuration(buffer.duration);
      setCurrentTime(0);
      setSelection(null);
    } catch (error) {
      console.error('Error loading audio:', error);
      alert('Error loading audio file. Please try a different file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const drawWaveform = async () => {
    if (!audioBuffer || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const width = canvas.width;
    const height = canvas.height;
    const displayWidth = rect.width;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    const data = audioBuffer.getChannelData(0);
    const step = Math.ceil(data.length / (width * zoom));
    const amp = height / 2;

    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 1;
    ctx.beginPath();

    // Process in chunks to avoid blocking
    const chunkSize = 100;
    for (let chunk = 0; chunk < width; chunk += chunkSize) {
      const endChunk = Math.min(chunk + chunkSize, width);
      
      for (let i = chunk; i < endChunk; i++) {
        let min = 1;
        let max = -1;
        
        // Sample every Nth point for very large steps to improve performance
        const sampleStep = step > 10000 ? Math.ceil(step / 1000) : 1;
        
        for (let j = 0; j < step; j += sampleStep) {
          const index = i * step + j;
          if (index >= data.length) break;
          const value = data[index];
          if (value < min) min = value;
          if (value > max) max = value;
        }
        
        const y1 = (1 + min) * amp;
        const y2 = (1 + max) * amp;

        if (i === 0) {
          ctx.moveTo(i, y1);
        }
        ctx.lineTo(i, y1);
        ctx.lineTo(i, y2);
      }
      
      // Yield to browser every chunk
      if (chunk + chunkSize < width) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }

    ctx.stroke();

    // Scale factor to convert display coordinates to canvas coordinates
    const scale = width / displayWidth;

    // Draw selection
    if (selection) {
      ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
      const startX = (selection.start / duration) * width;
      const endX = (selection.end / duration) * width;
      ctx.fillRect(startX, 0, endX - startX, height);
    }

    // Draw split points
    splitPoints.forEach((splitPoint) => {
      const splitX = (splitPoint / duration) * width;
      ctx.strokeStyle = '#ff9800';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(splitX, 0);
      ctx.lineTo(splitX, height);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Draw playback cursor
    const cursorX = (currentTime / duration) * width;
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cursorX, 0);
    ctx.lineTo(cursorX, height);
    ctx.stroke();
  };

  const handleCanvasClick = (event) => {
    if (!audioBuffer) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const clickTime = (x / rect.width) * duration;

    if (event.shiftKey && selection) {
      // Extend selection
      setSelection({
        start: Math.min(selection.start, clickTime),
        end: Math.max(selection.end, clickTime)
      });
    } else {
      setCurrentTime(clickTime);
      drawWaveform();
    }
  };

  const handleTouchStart = (event) => {
    if (!audioBuffer) return;
    
    event.preventDefault();
    const touch = event.touches[0];
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
    const touchTime = (x / rect.width) * duration;
    
    // Start a potential selection
    setCurrentTime(touchTime);
    setSelection({ start: touchTime, end: touchTime });
  };

  const handleTouchMove = (event) => {
    if (!audioBuffer) return;
    
    event.preventDefault();
    const touch = event.touches[0];
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
    const touchTime = (x / rect.width) * duration;
    
    // Update selection if we have one
    if (selection) {
      setSelection({
        start: Math.min(selection.start, touchTime),
        end: Math.max(selection.start, touchTime)
      });
    }
  };

  const handleTouchEnd = (event) => {
    event.preventDefault();
    
    // If selection is too small (less than 0.1s), treat it as a tap and add split
    if (selection && Math.abs(selection.end - selection.start) < 0.1) {
      const tapTime = selection.start;
      setCurrentTime(tapTime);
      setSelection(null);
      
      // Add split if tap is not at edges
      if (tapTime > 0 && tapTime < duration) {
        const newSplitPoints = [...splitPoints, tapTime].sort((a, b) => a - b);
        setSplitPoints(newSplitPoints);
      }
    }
  };

  const playAudio = async () => {
    if (!audioBuffer || isPlaying) return;

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContextRef.current.destination);
    
    const startOffset = currentTime;
    source.start(0, startOffset);
    sourceNodeRef.current = source;
    startTimeRef.current = audioContextRef.current.currentTime - startOffset;
    setIsPlaying(true);

    const updateTime = () => {
      if (sourceNodeRef.current) {
        const elapsed = audioContextRef.current.currentTime - startTimeRef.current;
        setCurrentTime(elapsed);
        
        if (elapsed < duration) {
          animationFrameRef.current = requestAnimationFrame(updateTime);
        } else {
          stopAudio();
        }
      }
    };
    animationFrameRef.current = requestAnimationFrame(updateTime);

    source.onended = () => {
      if (isPlaying) stopAudio();
    };
  };

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsPlaying(false);
  };

  const cutSelection = () => {
    if (!audioBuffer || !selection) return;

    const sampleRate = audioBuffer.sampleRate;
    const startSample = Math.floor(selection.start * sampleRate);
    const endSample = Math.floor(selection.end * sampleRate);
    const newLength = audioBuffer.length - (endSample - startSample);

    const newBuffer = audioContextRef.current.createBuffer(
      audioBuffer.numberOfChannels,
      newLength,
      sampleRate
    );

    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const oldData = audioBuffer.getChannelData(channel);
      const newData = newBuffer.getChannelData(channel);

      for (let i = 0; i < startSample; i++) {
        newData[i] = oldData[i];
      }

      for (let i = endSample; i < audioBuffer.length; i++) {
        newData[i - (endSample - startSample)] = oldData[i];
      }
    }

    setAudioBuffer(newBuffer);
    setDuration(newBuffer.duration);
    setSelection(null);
    setCurrentTime(0);
  };

  const splitAtCursor = () => {
    if (!audioBuffer || currentTime <= 0 || currentTime >= duration) return;

    // Add split point at current time
    const newSplitPoints = [...splitPoints, currentTime].sort((a, b) => a - b);
    setSplitPoints(newSplitPoints);
  };

  const clearSplits = () => {
    setSplitPoints([]);
  };

  const getSegments = () => {
    if (splitPoints.length === 0) {
      return [{ start: 0, end: duration, index: 0 }];
    }

    const segments = [];
    let start = 0;

    splitPoints.forEach((splitPoint, index) => {
      segments.push({ start, end: splitPoint, index });
      start = splitPoint;
    });

    // Add final segment
    segments.push({ start, end: duration, index: splitPoints.length });

    return segments;
  };

  const encodeMP3 = async (audioBuffer, startSample, endSample) => {
    const sampleRate = audioBuffer.sampleRate;
    const numberOfChannels = audioBuffer.numberOfChannels;
    const segmentLength = endSample - startSample;
    
    // Create MP3 encoder - 128kbps is a good default
    const mp3encoder = new lamejs.Mp3Encoder(numberOfChannels, sampleRate, 128);
    const mp3Data = [];
    
    const sampleBlockSize = 1152; // Must be a multiple of 576
    
    // Convert float samples to 16-bit PCM
    const leftChannel = new Int16Array(segmentLength);
    const rightChannel = numberOfChannels > 1 ? new Int16Array(segmentLength) : null;
    
    for (let i = 0; i < segmentLength; i++) {
      const sample0 = audioBuffer.getChannelData(0)[startSample + i];
      leftChannel[i] = sample0 < 0 ? sample0 * 0x8000 : sample0 * 0x7FFF;
      
      if (numberOfChannels > 1) {
        const sample1 = audioBuffer.getChannelData(1)[startSample + i];
        rightChannel[i] = sample1 < 0 ? sample1 * 0x8000 : sample1 * 0x7FFF;
      }
    }
    
    // Encode in blocks
    for (let i = 0; i < segmentLength; i += sampleBlockSize) {
      const leftChunk = leftChannel.subarray(i, i + sampleBlockSize);
      const rightChunk = rightChannel ? rightChannel.subarray(i, i + sampleBlockSize) : leftChunk;
      
      const mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
      if (mp3buf.length > 0) {
        mp3Data.push(mp3buf);
      }
      
      // Yield to browser periodically
      if (i % (sampleBlockSize * 10) === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
    
    // Flush remaining data
    const mp3buf = mp3encoder.flush();
    if (mp3buf.length > 0) {
      mp3Data.push(mp3buf);
    }
    
    return new Blob(mp3Data, { type: 'audio/mp3' });
  };

  const exportSegment = async (segment) => {
    if (!audioBuffer) return;

    setIsProcessing(true);
    setShowExportModal(false);

    try {
      const sampleRate = audioBuffer.sampleRate;
      const startSample = Math.floor(segment.start * sampleRate);
      const endSample = Math.floor(segment.end * sampleRate);
      const segmentLength = endSample - startSample;
      const numberOfChannels = audioBuffer.numberOfChannels;

      let blob;
      let mimeType;
      let fileExtension;

      if (exportFormat === 'mp3') {
        // Export as MP3
        blob = await encodeMP3(audioBuffer, startSample, endSample);
        mimeType = 'audio/mp3';
        fileExtension = 'mp3';
      } else {
        // Export as WAV
        const buffer = new ArrayBuffer(44 + segmentLength * numberOfChannels * 2);
        const view = new DataView(buffer);

        // WAV header
        const writeString = (offset, string) => {
          for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
          }
        };

        writeString(0, 'RIFF');
        view.setUint32(4, 36 + segmentLength * numberOfChannels * 2, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, numberOfChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * numberOfChannels * 2, true);
        view.setUint16(32, numberOfChannels * 2, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, segmentLength * numberOfChannels * 2, true);

        // Write audio data in chunks
        let offset = 44;
        const chunkSize = 50000;
        
        for (let i = startSample; i < endSample; i += chunkSize) {
          const end = Math.min(i + chunkSize, endSample);
          for (let j = i; j < end; j++) {
            for (let channel = 0; channel < numberOfChannels; channel++) {
              const sample = Math.max(-1, Math.min(1, audioBuffer.getChannelData(channel)[j]));
              view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
              offset += 2;
            }
          }
          // Yield to browser every chunk
          if (i + chunkSize < endSample) {
            await new Promise(resolve => setTimeout(resolve, 0));
          }
        }

        blob = new Blob([buffer], { type: 'audio/wav' });
        mimeType = 'audio/wav';
        fileExtension = 'wav';
      }

      // Generate filename
      const now = new Date();
      const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const originalName = audioFile ? audioFile.name.replace(/\.[^/.]+$/, '') : 'edited-audio';
      const segmentName = splitPoints.length > 0 ? `_segment${segment.index + 1}` : '';
      const filename = `${originalName}${segmentName}_${timestamp}.${fileExtension}`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting segment:', error);
      alert('Error exporting audio segment.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportClick = () => {
    if (!audioBuffer) return;
    setShowExportModal(true);
  };

  const confirmExport = async () => {
    setShowExportModal(false);
    await performExport();
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  const performExport = async () => {
    if (!audioBuffer) return;

    setIsProcessing(true);

    try {
      const numberOfChannels = audioBuffer.numberOfChannels;
      const length = audioBuffer.length;
      const sampleRate = audioBuffer.sampleRate;
      const buffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
      const view = new DataView(buffer);

      // WAV header
      const writeString = (offset, string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      };

      writeString(0, 'RIFF');
      view.setUint32(4, 36 + length * numberOfChannels * 2, true);
      writeString(8, 'WAVE');
      writeString(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, numberOfChannels, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * numberOfChannels * 2, true);
      view.setUint16(32, numberOfChannels * 2, true);
      view.setUint16(34, 16, true);
      writeString(36, 'data');
      view.setUint32(40, length * numberOfChannels * 2, true);

      // Write audio data in chunks to avoid freezing
      let offset = 44;
      const chunkSize = 50000;
      for (let i = 0; i < length; i += chunkSize) {
        const end = Math.min(i + chunkSize, length);
        for (let j = i; j < end; j++) {
          for (let channel = 0; channel < numberOfChannels; channel++) {
            const sample = Math.max(-1, Math.min(1, audioBuffer.getChannelData(channel)[j]));
            view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
            offset += 2;
          }
        }
        // Yield to browser every chunk
        if (i + chunkSize < length) {
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }

      // Generate timestamp for unique filename
      const now = new Date();
      const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const originalName = audioFile ? audioFile.name.replace(/\.[^/.]+$/, '') : 'edited-audio';
      const filename = `${originalName}_${timestamp}.wav`;

      const blob = new Blob([buffer], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting audio:', error);
      alert('Error exporting audio file.');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    // Cancel any pending draw request
    if (drawRequestRef.current) {
      cancelAnimationFrame(drawRequestRef.current);
    }
    
    // Skip if already drawing
    if (isDrawingRef.current) {
      return;
    }
    
    // Schedule a draw on next frame
    drawRequestRef.current = requestAnimationFrame(async () => {
      isDrawingRef.current = true;
      await drawWaveform();
      isDrawingRef.current = false;
      drawRequestRef.current = null;
    });
    
    // Cleanup
    return () => {
      if (drawRequestRef.current) {
        cancelAnimationFrame(drawRequestRef.current);
        drawRequestRef.current = null;
      }
    };
  }, [currentTime, selection, splitPoints]);

  return (
    <div className={styles.container}>
      <div className={styles.uploadSection}>
        <label className={styles.uploadButton}>
          📁 Load Audio File
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            disabled={isProcessing}
          />
        </label>
        {audioFile && (
          <div className={styles.fileName}>
            {audioFile.name}
          </div>
        )}
        {isProcessing && (
          <div className={styles.loadingMessage}>
            ⏳ Loading audio file... This may take a moment for large files.
          </div>
        )}
      </div>

      {audioBuffer && (
        <>
          <div className={styles.waveformSection} ref={waveformContainerRef}>
            <canvas
              ref={canvasRef}
              width={800}
              height={200}
              className={styles.waveform}
              onClick={handleCanvasClick}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            />
            <div className={styles.timeDisplay}>
              {currentTime.toFixed(2)}s / {duration.toFixed(2)}s
            </div>
          </div>

          <div className={styles.zoomControls}>
            <button onClick={() => setZoom(Math.max(0.5, zoom - 0.5))}>🔍-</button>
            <span>Zoom: {zoom.toFixed(1)}x</span>
            <button onClick={() => setZoom(Math.min(5, zoom + 0.5))}>🔍+</button>
          </div>

          <div className={styles.controls}>
            <button
              className={styles.controlButton}
              onClick={isPlaying ? stopAudio : playAudio}
            >
              {isPlaying ? '⏸️ Pause' : '▶️ Play'}
            </button>
          </div>

          <div className={styles.instructions}>
            <p><strong>Mobile:</strong> Tap to split • Drag to select range for export</p>
            <p><strong>Desktop:</strong> Click to split • Shift+Click to select range</p>
          </div>

          {/* Export Panel */}
          <div className={styles.exportPanel}>
            {!selection && splitPoints.length === 0 && (
              <div className={styles.exportPanelEmpty}>
                <p>👆 Tap to split or drag to select a range to export</p>
              </div>
            )}

            {selection && Math.abs(selection.end - selection.start) >= 0.1 && (
              <div className={styles.exportPanelContent}>
                <h3>📤 Export Selected Range</h3>
                <div className={styles.formatSelector}>
                  <label>Export Format:</label>
                  <select 
                    value={exportFormat} 
                    onChange={(e) => setExportFormat(e.target.value)}
                    className={styles.formatSelect}
                  >
                    <option value="wav">WAV (Lossless)</option>
                    <option value="mp3">MP3 (128kbps)</option>
                  </select>
                </div>
                <div className={styles.exportDetails}>
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Range:</span>
                    <span className={styles.value}>{formatTime(selection.start)} → {formatTime(selection.end)}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Duration:</span>
                    <span className={styles.value}>{formatTime(selection.end - selection.start)}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.label}>File size:</span>
                    <span className={styles.value}>
                      {formatFileSize(
                        Math.floor((selection.end - selection.start) * audioBuffer.sampleRate) * 
                        audioBuffer.numberOfChannels * 2 + 44
                      )}
                    </span>
                  </div>
                </div>
                <button
                  className={styles.exportButton}
                  onClick={() => exportSegment({ 
                    start: selection.start, 
                    end: selection.end, 
                    index: 0 
                  })}
                  disabled={isProcessing}
                >
                  💾 Export Selected Range
                </button>
              </div>
            )}

            {!selection && splitPoints.length > 0 && (
              <div className={styles.exportPanelContent}>
                <h3>📤 Export Segments ({getSegments().length})</h3>
                <div className={styles.formatSelector}>
                  <label>Export Format:</label>
                  <select 
                    value={exportFormat} 
                    onChange={(e) => setExportFormat(e.target.value)}
                    className={styles.formatSelect}
                  >
                    <option value="wav">WAV (Lossless)</option>
                    <option value="mp3">MP3 (128kbps)</option>
                  </select>
                </div>
                <div className={styles.segmentsList}>
                  {getSegments().map((segment) => {
                    const segmentDuration = segment.end - segment.start;
                    const segmentSamples = Math.floor(segmentDuration * audioBuffer.sampleRate);
                    const segmentSize = 44 + segmentSamples * audioBuffer.numberOfChannels * 2;
                    
                    return (
                      <div key={segment.index} className={styles.segmentItem}>
                        <div className={styles.segmentHeader}>
                          <h4>Segment {segment.index + 1}</h4>
                          <span className={styles.segmentDuration}>{formatTime(segmentDuration)}</span>
                        </div>
                        <div className={styles.segmentDetails}>
                          <div className={styles.infoRow}>
                            <span className={styles.label}>Range:</span>
                            <span className={styles.value}>{formatTime(segment.start)} → {formatTime(segment.end)}</span>
                          </div>
                          <div className={styles.infoRow}>
                            <span className={styles.label}>Size:</span>
                            <span className={styles.value}>{formatFileSize(segmentSize)}</span>
                          </div>
                        </div>
                        <button
                          className={styles.segmentExportButton}
                          onClick={() => exportSegment(segment)}
                          disabled={isProcessing}
                        >
                          💾 Export Segment {segment.index + 1}
                        </button>
                      </div>
                    );
                  })}
                </div>
                <button
                  className={styles.clearButton}
                  onClick={clearSplits}
                >
                  🗑️ Clear All Splits
                </button>
              </div>
            )}
          </div>
        </>
      )}

    </div>
  );
};

export default AudioEditor;
