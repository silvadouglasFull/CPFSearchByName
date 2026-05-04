import { PromptClient } from '@/pipelineCpf/domain/types';
import fs from 'fs';
import { stdin, stdout } from 'process';
import readline from 'readline/promises';

export class PipeAwarePromptClient implements PromptClient {
    private readonly pipedAnswers = stdin.isTTY
        ? null
        : fs.readFileSync(0, 'utf-8').split(/\r?\n/);

    async ask(question: string): Promise<string> {
        if (this.pipedAnswers) {
            stdout.write(question);
            const answer = this.pipedAnswers.shift() ?? '';
            stdout.write(`${answer}\n`);
            return answer.trim();
        }

        const rl = readline.createInterface({ input: stdin, output: stdout });

        try {
            return (await rl.question(question)).trim();
        } finally {
            rl.close();
        }
    }
}
