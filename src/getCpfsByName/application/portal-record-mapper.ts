import { DETAILS_PAGE_URL } from '@/getCpfsByName/domain/constants';
import { slugifyName } from '@/getCpfsByName/domain/slug.utils';
import { PortalRecord, RawPortalRecord } from '@/getCpfsByName/domain/types';

export class PortalRecordMapper {
    mapRecords(records: RawPortalRecord[], sourcePage: number): PortalRecord[] {
        return records.map((record) => ({
            name: record.nome,
            cpf: record.cpfNis,
            relation: record.descricaoRelacoesGovernoFederal,
            detailsLink: `${DETAILS_PAGE_URL}/${record.skPessoa}-${slugifyName(record.nome)}`,
            sourcePage,
        }));
    }
}
