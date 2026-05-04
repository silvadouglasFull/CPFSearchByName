export class InvalidSearchNameError extends Error {
    constructor(message = 'Provide a search name.') {
        super(message);
        this.name = 'InvalidSearchNameError';
    }
}
