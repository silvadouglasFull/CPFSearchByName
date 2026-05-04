import { GenerateCpfCandidatesService } from '@/generatorCpf/application/generate-cpf-candidates.service';
import { runFromCli } from '@/generatorCpf/cli/generator-cpf.cli';
import { generateCompleteCpf } from '@/generatorCpf/domain/cpf-check-digit.calculator';
import { formatCpf, normalizePartialCpf, normalizeRegionDigit } from '@/generatorCpf/domain/cpf-format.utils';
import { GeneratedCpfRecord } from '@/generatorCpf/domain/types';
import { JsonGeneratedCpfWriter } from '@/generatorCpf/infrastructure/json-generated-cpf.writer';

export function generateCpfCandidates(partialCpf: string, regionDigit?: string | null): GeneratedCpfRecord[] {
    const service = new GenerateCpfCandidatesService();
    return service.generate(partialCpf, regionDigit);
}

export function saveGeneratedCpfs(records: GeneratedCpfRecord[]): string {
    const writer = new JsonGeneratedCpfWriter();
    return writer.save(records);
}

export {
    formatCpf,
    generateCompleteCpf,
    normalizePartialCpf,
    normalizeRegionDigit,
    runFromCli
};

