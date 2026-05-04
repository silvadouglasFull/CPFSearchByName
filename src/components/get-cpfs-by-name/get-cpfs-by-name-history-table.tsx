import { GetCpfsByNameHistoryRecord } from '@/components/get-cpfs-by-name/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface GetCpfsByNameHistoryTableProps {
    items: GetCpfsByNameHistoryRecord[];
    isViewingItemId: string | null;
    onViewRecords: (itemId: string) => void;
}

function formatDate(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '-';
    }

    return date.toLocaleString();
}

export function GetCpfsByNameHistoryTable({
    items,
    isViewingItemId,
    onViewRecords,
}: GetCpfsByNameHistoryTableProps) {
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
                            <TableHead>Search Name</TableHead>
                            <TableHead>Saved Results</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.searchName}</TableCell>
                                <TableCell>{item.resultCount}</TableCell>
                                <TableCell className="text-muted-foreground">{formatDate(item.createdAt)}</TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        className="rounded-xl"
                                        disabled={isViewingItemId === item.id}
                                        onClick={() => onViewRecords(item.id)}
                                        size="sm"
                                        type="button"
                                        variant="outline"
                                    >
                                        {isViewingItemId === item.id ? 'Carregando...' : 'Visualizar Resultados'}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
