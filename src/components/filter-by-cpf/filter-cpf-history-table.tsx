import { FilterCpfHistoryRecord } from '@/components/filter-by-cpf/types';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface FilterCpfHistoryTableProps {
    items: FilterCpfHistoryRecord[];
}

function formatDate(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '-';
    }

    return date.toLocaleString();
}

export function FilterCpfHistoryTable({ items }: FilterCpfHistoryTableProps) {
    return (
        <div className="rounded-3xl border bg-card p-2 shadow-sm md:p-4">
            <div className="mb-4 flex items-center justify-between px-2">
                <h2 className="text-lg font-semibold">Search History</h2>
                <Badge className="rounded-full" variant="secondary">
                    {items.length}
                </Badge>
            </div>

            <div className="max-h-[60vh] overflow-auto rounded-2xl border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Search CPF</TableHead>
                            <TableHead>Saved Results</TableHead>
                            <TableHead>Created At</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.searchTerm}</TableCell>
                                <TableCell>{item.resultCount}</TableCell>
                                <TableCell className="text-muted-foreground">{formatDate(item.createdAt)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
