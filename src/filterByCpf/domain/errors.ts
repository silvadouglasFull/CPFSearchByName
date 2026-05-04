export class InvalidCpfPartialError extends Error {
    constructor(message = 'Provide a partial CPF with at least one digit.') {
        super(message);
        this.name = 'InvalidCpfPartialError';
    }
}
