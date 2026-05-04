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
        <Card className="rounded-3xl border-green-200 bg-green-50 shadow-sm">
            <CardHeader>
                <div className="flex items-start justify-between gap-3">
                    <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        Dados da Pessoa
                    </CardTitle>
                    <Badge className="bg-green-100" variant="outline">
                        {originLabel}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <p className="text-sm text-muted-foreground">Nome</p>
                        <p className="font-semibold">{result.nome || '-'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">CPF</p>
                        <p className="font-semibold">{result.cpf}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Data de Nascimento</p>
                        <p className="font-semibold">{result.dataNascimento || '-'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Situação Cadastral</p>
                        <p className="font-semibold text-green-700">{result.situacaoCadastral || '-'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Data de Inscrição</p>
                        <p className="font-semibold">{result.dataInscricao || '-'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Dígito Verificador</p>
                        <p className="font-semibold">{result.digitoVerificador || '-'}</p>
                    </div>
                    {result.comprovante ? (
                        <>
                            <div>
                                <p className="text-sm text-muted-foreground">Comprovante</p>
                                <p className="text-xs font-semibold">{result.comprovante}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Data do Comprovante</p>
                                <p className="text-xs font-semibold">{result.dataComprovante || '-'}</p>
                            </div>
                        </>
                    ) : null}
                </div>

                <div className="mt-6 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm">
                    <Zap className="h-4 w-4 text-blue-600" />
                    <span>
                        Créditos utilizados: <strong>{result.creditosConsumidos}</strong>
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}