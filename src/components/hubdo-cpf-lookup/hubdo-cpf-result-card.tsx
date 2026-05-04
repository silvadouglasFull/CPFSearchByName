'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HubdoCpfLookupResponse } from '@/hubdoCpf';
import { CheckCircle, Zap } from 'lucide-react';

interface HubdoCpfResultCardProps {
    result: HubdoCpfLookupResponse;
}

export function HubdoCpfResultCard({ result }: HubdoCpfResultCardProps) {
    if (result.status !== 'success') {
        return null;
    }

    const originLabel = {
        database: 'Banco de Dados',
        receita_federal: 'Receita Federal',
        turbo: 'Turbo',
    }[result.origem || 'receita_federal'];

    return (
        <Card className="rounded-3xl border-emerald-200 bg-linear-to-br from-emerald-50 to-card shadow-sm">
            <CardHeader>
                <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            Consulta concluída
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Dados retornados pela fonte selecionada para esta validação oficial.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                        <Badge className="bg-green-100" variant="outline">
                            {originLabel}
                        </Badge>
                        <Badge className="bg-blue-100 text-blue-800" variant="outline">
                            {result.creditosConsumidos} créditos
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    <div className="rounded-2xl border bg-background/80 p-4">
                        <p className="text-sm text-muted-foreground">Nome</p>
                        <p className="font-semibold">{result.nome || '-'}</p>
                    </div>
                    <div className="rounded-2xl border bg-background/80 p-4">
                        <p className="text-sm text-muted-foreground">CPF</p>
                        <p className="font-semibold">{result.cpf}</p>
                    </div>
                    <div className="rounded-2xl border bg-background/80 p-4">
                        <p className="text-sm text-muted-foreground">Data de Nascimento</p>
                        <p className="font-semibold">{result.dataNascimento || '-'}</p>
                    </div>
                    <div className="rounded-2xl border bg-background/80 p-4">
                        <p className="text-sm text-muted-foreground">Situação Cadastral</p>
                        <p className="font-semibold text-green-700">{result.situacaoCadastral || '-'}</p>
                    </div>
                    <div className="rounded-2xl border bg-background/80 p-4">
                        <p className="text-sm text-muted-foreground">Data de Inscrição</p>
                        <p className="font-semibold">{result.dataInscricao || '-'}</p>
                    </div>
                    <div className="rounded-2xl border bg-background/80 p-4">
                        <p className="text-sm text-muted-foreground">Dígito Verificador</p>
                        <p className="font-semibold">{result.digitoVerificador || '-'}</p>
                    </div>
                    {result.comprovante ? (
                        <>
                            <div className="rounded-2xl border bg-background/80 p-4 xl:col-span-2">
                                <p className="text-sm text-muted-foreground">Comprovante</p>
                                <p className="text-xs font-semibold">{result.comprovante}</p>
                            </div>
                            <div className="rounded-2xl border bg-background/80 p-4">
                                <p className="text-sm text-muted-foreground">Data do Comprovante</p>
                                <p className="text-xs font-semibold">{result.dataComprovante || '-'}</p>
                            </div>
                        </>
                    ) : null}
                </div>

                <div className="mt-6 flex items-center gap-2 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm">
                    <Zap className="h-4 w-4 text-blue-600" />
                    <span>
                        Consumo confirmado nesta consulta: <strong>{result.creditosConsumidos} créditos</strong>
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}