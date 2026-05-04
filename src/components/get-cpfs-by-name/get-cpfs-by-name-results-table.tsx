import { PortalRecord } from '@/components/get-cpfs-by-name/types';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface GetCpfsByNameResultsTableProps {
    records: PortalRecord[];
}

export function GetCpfsByNameResultsTable({ records }: GetCpfsByNameResultsTableProps) {
    return (
        <div className="rounded-3xl border bg-card p-2 shadow-sm md:p-4">
            <div className="mb-4 flex items-center justify-between px-2">
                <h2 className="text-lg font-semibold">Collected Records</h2>
                <Badge className="rounded-full" variant="secondary">
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
                        {records.map((record, index) => (
                            <TableRow key={`${record.cpf}-${record.sourcePage}-${index}`}>
                                <TableCell className="font-medium">{record.name}</TableCell>
                                <TableCell>{record.cpf}</TableCell>
                                <TableCell className="text-muted-foreground">{record.relation}</TableCell>
                                <TableCell>{record.sourcePage}</TableCell>
                                <TableCell>
                                    <a
                                        className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                                        href={record.detailsLink}
                                        rel="noreferrer"
                                        target="_blank"
                                    >
                                        Open
                                    </a>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
