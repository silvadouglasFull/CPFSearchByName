export class InvalidStateCodeError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidStateCodeError';
    }
}
