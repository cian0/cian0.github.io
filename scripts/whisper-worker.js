// Located at ./scripts/whisper-worker.js
import { pipeline, env } from "@xenova/transformers";

// Skip local model check
env.allowLocalModels = false;

// Use the Singleton pattern to enable lazy construction of the pipeline.
class PipelineSingleton {
    static task = 'text-classification';
    static model = 'Xenova/distilbert-base-uncased-finetuned-sst-2-english';
    static instance = null;

    static async getInstance(progress_callback = null) {
        if (this.instance === null) {
            this.instance = pipeline(this.task, this.model, { progress_callback });
        }
        return this.instance;
    }
}

class TranscriptionPipeline {
    static task = 'automatic-speech-recognition';
    static model = null;
    static instance = null;

    static async getInstance(progress_callback = null) {
        if (this.instance === null) {
            this.instance = pipeline(this.task, this.model, {
                progress_callback,
                chunk_length_s: 30,
                stride_length_s: 5,
            });
        }
        return this.instance;
    }
}

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
    const { type, data } = event.data;

    if (type === 'classify') {
        // Retrieve the classification pipeline
        let classifier = await PipelineSingleton.getInstance(x => {
            self.postMessage({ type: 'progress', data: x });
        });

        // Perform the classification
        let output = await classifier(data.text);

        // Send the output back to the main thread
        self.postMessage({
            type: 'complete',
            data: output,
        });
    } else if (type === 'transcribe') {
        // Set the model if it's different from the current one
        if (TranscriptionPipeline.model !== data.model) {
            TranscriptionPipeline.model = data.model;
            TranscriptionPipeline.instance = null;
        }

        // Retrieve the transcription pipeline
        let transcriber = await TranscriptionPipeline.getInstance(x => {
            self.postMessage({ type: 'progress', data: x });
        });

        try {
            // Perform the transcription
            let output = await transcriber(data.audio, {
                language: data.language,
                return_timestamps: true,
            });

            // Send the output back to the main thread
            self.postMessage({
                type: 'complete',
                data: output,
            });
        } catch (error) {
            self.postMessage({ type: 'error', data: error.message });
        }
    }
});