// Located at ./hooks/useTranscriber.js
import { useState, useEffect, useRef, useCallback } from 'react';

export function useTranscriber() {
    const [output, setOutput] = useState(null);
    const [isModelLoading, setIsModelLoading] = useState(false);
    const [isBusy, setIsBusy] = useState(false);
    const [progressItems, setProgressItems] = useState([]);
    const [model, setModel] = useState('Xenova/whisper-small');
    const [language, setLanguage] = useState('en');
    const [multilingual, setMultilingual] = useState(false);
    const [quantized, setQuantized] = useState(true);

    const workerRef = useRef(null);

    useEffect(() => {
        if (!workerRef.current) {
            workerRef.current = new Worker(new URL('../scripts/worker.js', import.meta.url), { type: 'module' });
            workerRef.current.onmessage = (event) => {
                const { type, data } = event.data;
                if (type === 'progress') {
                    setProgressItems(prev => [...prev, data]);
                } else if (type === 'complete') {
                    setOutput(data);
                    setIsBusy(false);
                } else if (type === 'error') {
                    console.error('Transcription error:', data);
                    setIsBusy(false);
                }
            };
        }
        return () => {
            if (workerRef.current) {
                workerRef.current.terminate();
            }
        };
    }, []);

    const start = useCallback((audioBuffer) => {
        setIsBusy(true);
        setOutput(null);
        setProgressItems([]);

        workerRef.current.postMessage({
            type: 'transcribe',
            data: {
                audio: audioBuffer,
                model: model + (multilingual ? '' : '.en'),
                language: language,
            }
        });
    }, [model, multilingual, language]);

    const onInputChange = useCallback(() => {
        setOutput(null);
    }, []);

    return {
        output,
        isModelLoading,
        isBusy,
        progressItems,
        model,
        setModel,
        language,
        setLanguage,
        multilingual,
        setMultilingual,
        quantized,
        setQuantized,
        start,
        onInputChange,
    };
}