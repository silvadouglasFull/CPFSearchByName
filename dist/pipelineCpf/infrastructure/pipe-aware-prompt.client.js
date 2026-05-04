"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PipeAwarePromptClient = void 0;
const fs_1 = __importDefault(require("fs"));
const process_1 = require("process");
const promises_1 = __importDefault(require("readline/promises"));
class PipeAwarePromptClient {
    constructor() {
        this.pipedAnswers = process_1.stdin.isTTY
            ? null
            : fs_1.default.readFileSync(0, 'utf-8').split(/\r?\n/);
    }
    async ask(question) {
        if (this.pipedAnswers) {
            process_1.stdout.write(question);
            const answer = this.pipedAnswers.shift() ?? '';
            process_1.stdout.write(`${answer}\n`);
            return answer.trim();
        }
        const rl = promises_1.default.createInterface({ input: process_1.stdin, output: process_1.stdout });
        try {
            return (await rl.question(question)).trim();
        }
        finally {
            rl.close();
        }
    }
}
exports.PipeAwarePromptClient = PipeAwarePromptClient;
