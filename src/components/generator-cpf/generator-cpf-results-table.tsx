import { GeneratedCpfRecord } from '@/components/generator-cpf/types';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface GeneratorCpfResultsTableProps {
    records: GeneratedCpfRecord[];
}

export function GeneratorCpfResultsTable({ records }: GeneratorCpfResultsTableProps) {
    return (
        <div className="rounded-3xl border bg-card p-2 shadow-sm md:p-4">
            <div className="mb-4 flex items-center justify-between px-2">
                <h2 className="text-lg font-semibold">Generated Candidates</h2>
                <Badge className="rounded-full" variant="secondary">
                    {records.length}
                </Badge>
            </div>

            <div className="max-h-[60vh] overflow-auto rounded-2xl border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>CPF</TableHead>
                            <TableHead>Formatted CPF</TableHead>
                            <TableHead>Base 9 Digits</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {records.map((record) => (
                            <TableRow key={record.cpf}>
                                <TableCell className="font-medium">{record.cpf}</TableCell>
                                <TableCell>{record.formattedCpf}</TableCell>
                                <TableCell className="font-mono text-muted-foreground">
                                    {record.baseNineDigits}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
