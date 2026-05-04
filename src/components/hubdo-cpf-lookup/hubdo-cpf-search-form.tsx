'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
            <div>
                <label className="mb-2 block text-sm font-medium" htmlFor="hubdo-cpf-input">
                    CPF <span className="text-red-500">*</span>
                </label>
                <Input
                    className="h-11 rounded-2xl"
                    disabled={isLoading}
                    id="hubdo-cpf-input"
                    onChange={(event) => onCpfChange(event.target.value)}
                    placeholder="123.456.789-01 ou 12345678901"
                    type="text"
                    value={cpf}
                />
            </div>

            <div>
                <label className="mb-2 block text-sm font-medium" htmlFor="hubdo-birth-date-input">
                    Data de Nascimento (opcional)
                </label>
                <Input
                    className="h-11 rounded-2xl"
                    disabled={isLoading}
                    id="hubdo-birth-date-input"
                    onChange={(event) => onBirthDateChange(event.target.value)}
                    placeholder="DD/MM/YYYY"
                    type="text"
                    value={birthDate}
                />
            </div>

            <fieldset className="space-y-2">
                <legend className="text-sm font-medium">Modo de Consulta</legend>
                <div className="flex flex-col gap-3 md:flex-row md:gap-6">
                    <label className="flex cursor-pointer items-center gap-2">
                        <input
                            checked={mode === 'normal'}
                            disabled={isLoading}
                            name="hubdo-query-mode"
                            onChange={() => onModeChange('normal')}
                            type="radio"
                            value="normal"
                        />
                        <span className="text-sm">Normal (5 créditos, até 10 min)</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-2">
                        <input
                            checked={mode === 'turbo'}
                            disabled={isLoading}
                            name="hubdo-query-mode"
                            onChange={() => onModeChange('turbo')}
                            type="radio"
                            value="turbo"
                        />
                        <span className="text-sm">Turbo (25 créditos, 30s)</span>
                    </label>
                </div>
            </fieldset>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                Custo estimado: <strong>{estimatedCredits} créditos</strong>
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