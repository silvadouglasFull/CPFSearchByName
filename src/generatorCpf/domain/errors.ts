export class InvalidPartialCpfError extends Error {
    constructor(message = 'Provide a partial CPF with 1 to 9 digits.') {
        super(message);
        this.name = 'InvalidPartialCpfError';
    }
}

export class InvalidRegionDigitError extends Error {
    constructor(message = 'Provide a region digit between 0 and 9.') {
        super(message);
        this.name = 'InvalidRegionDigitError';
    }
}
