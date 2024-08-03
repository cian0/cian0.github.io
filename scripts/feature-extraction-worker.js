// Located at ./scripts/feature-extraction-worker.js
import { pipeline, env } from "@xenova/transformers";

// Skip local model check
env.allowLocalModels = false;

class PipelineSingleton {
    static task = 'feature-extraction';
    static model = 'Xenova/all-MiniLM-L6-v2';
    static instance = null;

    static async getInstance(progress_callback = null) {
        if (this.instance === null) {
            this.instance = pipeline(this.task, this.model, { progress_callback });
        }
        return this.instance;
    }
}

function serializeTensor(tensor) {
    return {
        data: Array.from(tensor.data),
        dims: tensor.dims,
        type: tensor.type
    };
}

self.addEventListener('message', async (event) => {
    console.log('Worker received message:', event.data);

    let extractor = await PipelineSingleton.getInstance(x => {
        console.log('Model loading progress:', x);
        self.postMessage({
            status: 'progress',
            progress: x.progress,
            file: x.file,
            loaded: x.loaded,
            total: x.total,
        });
    });

    console.log('Model loaded, extractor created');
    self.postMessage({ status: 'ready' });

    if (event.data.texts && event.data.texts.length > 0) {
        console.log('Processing texts:', event.data.texts);
        const results = [];

        try {
            const output = await extractor(event.data.texts, { pooling: 'mean', normalize: true });
            console.log('Extractor output:', output);

            if (Array.isArray(output)) {
                for (let i = 0; i < output.length; i++) {
                    results.push(serializeTensor(output[i]));
                }
            } else if (output.dims && output.dims.length > 1) {
                // If output is a single tensor with multiple embeddings
                for (let i = 0; i < output.dims[0]; i++) {
                    const start = i * output.dims[1];
                    const end = start + output.dims[1];
                    results.push(serializeTensor({
                        data: output.data.slice(start, end),
                        dims: [output.dims[1]],
                        type: output.type
                    }));
                }
            } else {
                console.error('Unexpected output format:', output);
            }

            console.log('Processed results:', results);
        } catch (error) {
            console.error('Error processing texts:', error);
        }

        self.postMessage({
            status: 'progress',
            progress: 100
        });

        console.log('Sending results back to main thread:', results);
        self.postMessage({
            status: 'complete',
            output: results
        });
    } else {
        console.log('No texts to process');
    }
});