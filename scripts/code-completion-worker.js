import { pipeline, env } from '@xenova/transformers';

env.allowLocalModels = false;

class CodeCompletionPipeline {
    static task = 'text-generation';
    static model = null;
    static instance = null;

    static async getInstance(progress_callback = null) {
        if (this.instance === null) {
            this.instance = pipeline(this.task, this.model, { progress_callback });
        }
        return this.instance;
    }
}

self.addEventListener('message', async (event) => {
    const {
        model, text, max_new_tokens,
        temperature,
        top_k,
        do_sample,
    } = event.data;

    if (CodeCompletionPipeline.model !== model) {
        CodeCompletionPipeline.model = model;
        if (CodeCompletionPipeline.instance !== null) {
            (await CodeCompletionPipeline.getInstance()).dispose();
            CodeCompletionPipeline.instance = null;
        }
    }

    try {
        let generator = await CodeCompletionPipeline.getInstance(x => {
            self.postMessage({
                status: x.status,
                file: x.file,
                progress: x.progress
            });
        });

        let output = await generator(text, {
            max_new_tokens,
            temperature,
            top_k,
            do_sample,
            callback_function: x => {
                self.postMessage({
                    status: 'update',
                    output: generator.tokenizer.decode(x[0].output_token_ids, { skip_special_tokens: true })
                });
            }
        });

        self.postMessage({
            status: 'complete',
            output: output,
        });
    } catch (error) {
        self.postMessage({
            status: 'error',
            error: error.message
        });
    }
});