import { GeneratedCpfRecord } from '@/components/generator-cpf/types';
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

interface GeneratorCpfResultsTableProps {
    records: GeneratedCpfRecord[];
    selectionEnabled?: boolean;
    selectedCpfs?: string[];
    onToggleSelectionMode?: () => void;
    onToggleCpfSelection?: (cpf: string) => void;
    onEnqueueSelectedCpfs?: () => void;
    isEnqueueingSelectedCpfs?: boolean;
    selectedCount?: number;
    enqueueButtonLabel?: string;
    showHubdoLookupStatus?: boolean;
}

export function GeneratorCpfResultsTable({
    records,
    selectionEnabled = false,
    selectedCpfs = [],
    onToggleSelectionMode,
    onToggleCpfSelection,
    onEnqueueSelectedCpfs,
    isEnqueueingSelectedCpfs = false,
    selectedCount = 0,
    enqueueButtonLabel = 'Queue selected CPFs',
    showHubdoLookupStatus = false,
}: GeneratorCpfResultsTableProps) {
    return (
        <div className="rounded-3xl border bg-card p-2 shadow-sm md:p-4">
            <div className="mb-4 flex items-center justify-between px-2">
                <h2 className="text-lg font-semibold">Generated Candidates</h2>
                <div className="flex items-center gap-2">
                    {onToggleSelectionMode ? (
                        <Button
                            className="rounded-2xl"
                            onClick={onToggleSelectionMode}
                            size="sm"
                            type="button"
                            variant="outline"
                        >
                            {selectionEnabled ? 'Disable selection' : 'Enable selection'}
                        </Button>
                    ) : null}
                    {onEnqueueSelectedCpfs ? (
                        <Button
                            className="rounded-2xl"
                            disabled={selectedCount <= 0 || isEnqueueingSelectedCpfs}
                            onClick={onEnqueueSelectedCpfs}
                            size="sm"
                            type="button"
                        >
                            {isEnqueueingSelectedCpfs ? 'Queueing...' : enqueueButtonLabel}
                        </Button>
                    ) : null}
                    <Badge className="rounded-full" variant="secondary">
                        {records.length}
                    </Badge>
                </div>
            </div>

            <div className="max-h-[60vh] overflow-auto rounded-2xl border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {selectionEnabled ? <TableHead>Select</TableHead> : null}
                            <TableHead>CPF</TableHead>
                            <TableHead>Formatted CPF</TableHead>
                            <TableHead>Base 9 Digits</TableHead>
                            {showHubdoLookupStatus ? <TableHead>HubDo</TableHead> : null}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {records.map((record) => (
                            <TableRow key={record.cpf}>
                                {selectionEnabled ? (
                                    <TableCell>
                                        <input
                                            aria-label={`Select CPF ${record.formattedCpf}`}
                                            checked={selectedCpfs.includes(record.cpf)}
                                            onChange={() => onToggleCpfSelection?.(record.cpf)}
                                            role="checkbox"
                                            type="checkbox"
                                        />
                                    </TableCell>
                                ) : null}
                                <TableCell className="font-medium">{record.cpf}</TableCell>
                                <TableCell>{record.formattedCpf}</TableCell>
                                <TableCell className="font-mono text-muted-foreground">
                                    {record.baseNineDigits}
                                </TableCell>
                                {showHubdoLookupStatus ? (
                                    <TableCell>
                                        {record.hubdoLookup ? (
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium">
                                                    {record.hubdoLookup.requestStatus} ({record.hubdoLookup.queryMode})
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Credits: {record.hubdoLookup.creditosConsumidos} | Origin: {record.hubdoLookup.origem}
                                                </p>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-muted-foreground">Sem consulta HubDo vinculada</span>
                                        )}
                                    </TableCell>
                                ) : null}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
