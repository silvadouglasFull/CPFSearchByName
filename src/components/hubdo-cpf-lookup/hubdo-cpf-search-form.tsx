'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { RotateCcw, Search } from 'lucide-react';
import { FormEvent } from 'react';

interface HubdoCpfSearchFormProps {
    cpf: string;
    birthDate: string;
    mode: 'normal' | 'turbo';
    isLoading: boolean;
    onCpfChange: (value: string) => void;
    onBirthDateChange: (value: string) => void;
    onModeChange: (mode: 'normal' | 'turbo') => void;
    onSearch: () => void;
    onReset: () => void;
}

export function HubdoCpfSearchForm({
    cpf,
    birthDate,
    mode,
    isLoading,
    onCpfChange,
    onBirthDateChange,
    onModeChange,
    onSearch,
    onReset,
}: HubdoCpfSearchFormProps) {
    const canSearch = cpf.trim().length > 0;
    const estimatedCredits = mode === 'turbo' ? 25 : 5;

    function handleSubmit(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();

        if (!canSearch || isLoading) {
            return;
        }

        onSearch();
    }

    return (
        <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-2xl border bg-muted/20 p-4">
                    <label className="mb-2 block text-sm font-medium" htmlFor="hubdo-cpf-input">
                        CPF <span className="text-red-500">*</span>
                    </label>
                    <Input
                        className="h-11 rounded-2xl bg-background"
                        disabled={isLoading}
                        id="hubdo-cpf-input"
                        onChange={(event) => onCpfChange(event.target.value)}
                        placeholder="123.456.789-01 ou 12345678901"
                        type="text"
                        value={cpf}
                    />
                    <p className="mt-2 text-xs text-muted-foreground">
                        Aceita CPF com ou sem máscara. O retorno é padronizado automaticamente.
                    </p>
                </div>

                <div className="rounded-2xl border bg-muted/20 p-4">
                    <label className="mb-2 block text-sm font-medium" htmlFor="hubdo-birth-date-input">
                        Data de nascimento
                    </label>
                    <Input
                        className="h-11 rounded-2xl bg-background"
                        disabled={isLoading}
                        id="hubdo-birth-date-input"
                        onChange={(event) => onBirthDateChange(event.target.value)}
                        placeholder="DD/MM/YYYY"
                        type="text"
                        value={birthDate}
                    />
                    <p className="mt-2 text-xs text-muted-foreground">
                        Campo opcional para complementar a validação quando necessário.
                    </p>
                </div>
            </div>

            <fieldset className="space-y-2">
                <legend className="text-sm font-medium">Modo de Consulta</legend>
                <div className="grid gap-3 md:grid-cols-2">
                    <label
                        className={cn(
                            'flex cursor-pointer gap-3 rounded-2xl border p-4 transition-colors',
                            mode === 'normal' ? 'border-primary/40 bg-primary/5' : 'bg-card hover:bg-muted/40',
                        )}
                    >
                        <input
                            checked={mode === 'normal'}
                            disabled={isLoading}
                            name="hubdo-query-mode"
                            onChange={() => onModeChange('normal')}
                            type="radio"
                            value="normal"
                        />
                        <span className="space-y-1 text-sm">
                            <span className="block font-medium">Normal</span>
                            <span className="block text-muted-foreground">5 créditos, indicado para consultas sem urgência imediata.</span>
                        </span>
                    </label>
                    <label
                        className={cn(
                            'flex cursor-pointer gap-3 rounded-2xl border p-4 transition-colors',
                            mode === 'turbo' ? 'border-primary/40 bg-primary/5' : 'bg-card hover:bg-muted/40',
                        )}
                    >
                        <input
                            checked={mode === 'turbo'}
                            disabled={isLoading}
                            name="hubdo-query-mode"
                            onChange={() => onModeChange('turbo')}
                            type="radio"
                            value="turbo"
                        />
                        <span className="space-y-1 text-sm">
                            <span className="block font-medium">Turbo</span>
                            <span className="block text-muted-foreground">25 créditos, resposta prioritária para fluxos operacionais urgentes.</span>
                        </span>
                    </label>
                </div>
            </fieldset>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
                <p className="font-medium">Estimativa de consumo</p>
                <p className="mt-1 text-amber-900">
                    Esta consulta deve consumir <strong>{estimatedCredits} créditos</strong>. O valor efetivo será salvo no histórico.
                </p>
            </div>

            <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                <Button className="h-11 rounded-2xl px-6" disabled={!canSearch || isLoading} type="submit">
                    <Search className="mr-2 h-4 w-4" />
                    {isLoading ? 'Buscando...' : 'Buscar CPF'}
                </Button>
                <Button
                    className="h-11 rounded-2xl px-6"
                    disabled={isLoading}
                    onClick={onReset}
                    type="button"
                    variant="outline"
                >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Limpar
                </Button>
            </div>
        </form>
    );
}