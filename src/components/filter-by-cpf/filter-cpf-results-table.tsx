import { PortalResultRecord } from '@/components/filter-by-cpf/types';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface FilterCpfResultsTableProps {
    records: PortalResultRecord[];
}

function getDisplayName(record: PortalResultRecord): string {
    if (typeof record.name === 'string' && record.name.trim()) {
        return record.name;
    }

    if (typeof record.nome === 'string' && record.nome.trim()) {
        return record.nome;
    }

    return 'Name not available';
}

function getDisplayRelation(record: PortalResultRecord): string {
    if (typeof record.relation === 'string' && record.relation.trim()) {
        return record.relation;
    }

    if (typeof record.vinculo === 'string' && record.vinculo.trim()) {
        return record.vinculo;
    }

    return 'Relation not available';
}

function getDetailsLink(record: PortalResultRecord): string | null {
    if (typeof record.detailsLink === 'string' && record.detailsLink.trim()) {
        return record.detailsLink;
    }

    if (typeof record.linkDetalhes === 'string' && record.linkDetalhes.trim()) {
        return record.linkDetalhes;
    }

    return null;
}

function getSourcePage(record: PortalResultRecord): string {
    if (typeof record.sourcePage === 'number') {
        return String(record.sourcePage);
    }

    if (typeof record.paginaOrigem === 'number') {
        return String(record.paginaOrigem);
    }

    return '-';
}

export function FilterCpfResultsTable({ records }: FilterCpfResultsTableProps) {
    return (
        <div className="rounded-3xl border bg-card p-2 shadow-sm md:p-4">
            <div className="mb-4 flex items-center justify-between px-2">
                <h2 className="text-lg font-semibold">Found Records</h2>
                <Badge variant="secondary" className="rounded-full">
                    {records.length}
                </Badge>
            </div>

            <div className="max-h-[60vh] overflow-auto rounded-2xl border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="min-w-[220px]">Name</TableHead>
                            <TableHead>CPF</TableHead>
                            <TableHead className="min-w-[220px]">Relation</TableHead>
                            <TableHead>Source Page</TableHead>
                            <TableHead>Details</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {records.map((record, index) => {
                            const detailsLink = getDetailsLink(record);

                            return (
                                <TableRow key={`${record.cpf}-${index}`}>
                                    <TableCell className="font-medium">{getDisplayName(record)}</TableCell>
                                    <TableCell>{record.cpf}</TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {getDisplayRelation(record)}
                                    </TableCell>
                                    <TableCell>{getSourcePage(record)}</TableCell>
                                    <TableCell>
                                        {detailsLink ? (
                                            <a
                                                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                                                href={detailsLink}
                                                rel="noreferrer"
                                                target="_blank"
                                            >
                                                Open
                                            </a>
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
