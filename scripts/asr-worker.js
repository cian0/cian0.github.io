import { pipeline } from '@xenova/transformers';

console.log("Worker: Script loaded");

let transcriber = null;

async function loadModel(progress_callback) {
    try {
        console.log("Worker: Starting pipeline initialization");
        transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.en', { progress_callback });
        console.log("Worker: Pipeline initialized");
        self.postMessage({ status: 'ready' });
    } catch (error) {
        console.error("Worker: Error during model loading", error);
        self.postMessage({ status: 'error', error: error.message });
    }
}

self.addEventListener('message', async (event) => {
    console.log("Worker: Received message", event.data);

    if (event.data.command === 'load_model') {
        await loadModel((progress) => {
            self.postMessage({ 
                status: 'progress', 
                progress: typeof progress.progress === 'number' ? progress.progress : 0 
            });
        });
    } else if (event.data.command === 'transcribe') {
        if (!transcriber) {
            self.postMessage({ status: 'error', error: 'Model not loaded' });
            return;
        }

        const { audioData } = event.data;

        try {
            console.log("Worker: Starting transcription");
            const output = await transcriber(audioData);
            console.log("Worker: Transcription complete", output);
            
            self.postMessage({
                status: 'complete',
                output: output,
            });
        } catch (error) {
            console.error("Worker: Error during processing", error);
            self.postMessage({
                status: 'error',
                error: error.message,
            });
        }
    }
});