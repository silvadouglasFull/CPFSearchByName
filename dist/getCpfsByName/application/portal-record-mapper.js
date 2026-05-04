"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortalRecordMapper = void 0;
const constants_1 = require("../../getCpfsByName/domain/constants");
const slug_utils_1 = require("../../getCpfsByName/domain/slug.utils");
class PortalRecordMapper {
    mapRecords(records, sourcePage) {
        return records.map((record) => ({
            name: record.nome,
            cpf: record.cpfNis,
            relation: record.descricaoRelacoesGovernoFederal,
            detailsLink: `${constants_1.DETAILS_PAGE_URL}/${record.skPessoa}-${(0, slug_utils_1.slugifyName)(record.nome)}`,
            sourcePage,
        }));
    }
}
exports.PortalRecordMapper = PortalRecordMapper;
