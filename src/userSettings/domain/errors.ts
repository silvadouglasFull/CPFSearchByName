export class MissingUserIdError extends Error {
    constructor(message = 'userId is required.') {
        super(message);
        this.name = 'MissingUserIdError';
    }
}
