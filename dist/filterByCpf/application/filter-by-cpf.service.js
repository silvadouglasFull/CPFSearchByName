"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterByCpfService = void 0;
const cpf_utils_1 = require("../../filterByCpf/domain/cpf-utils");
class FilterByCpfService {
    constructor(repository) {
        this.repository = repository;
    }
    filterByPartialCpf(partialCpf) {
        const normalizedTerm = (0, cpf_utils_1.normalizeCpf)(partialCpf);
        (0, cpf_utils_1.validatePartialCpf)(normalizedTerm);
        const records = this.repository.getAll();
        return records.filter((item) => (0, cpf_utils_1.normalizeCpf)(item.cpf).includes(normalizedTerm));
    }
}
exports.FilterByCpfService = FilterByCpfService;
