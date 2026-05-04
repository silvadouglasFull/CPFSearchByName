import { GenerateCpfCandidatesService } from '@/generatorCpf/application/generate-cpf-candidates.service';
import {
    CLI_PARTIAL_CPF_ARG_INDEX,
    CLI_REGION_DIGIT_ARG_INDEX,
    CLI_USAGE_MESSAGE,
    CPF_FOUND_MESSAGE_PREFIX,
    GENERATION_ERROR_PREFIX,
    GENERATION_START_MESSAGE,
    OUTPUT_FILE_MESSAGE_PREFIX,
    SEPARATOR_LINE,
    TOTAL_FOUND_MESSAGE_PREFIX,
    UNKNOWN_ERROR_MESSAGE,
} from '@/generatorCpf/domain/constants';
import { JsonGeneratedCpfWriter } from '@/generatorCpf/infrastructure/json-generated-cpf.writer';
import { FileLogger } from '@/shared/logging/file-logger.service';

export class GeneratorCpfCliRunner {
    constructor(
        private readonly generatorService = new GenerateCpfCandidatesService(),
        private readonly writer = new JsonGeneratedCpfWriter(),
        private readonly logger = new FileLogger('generator-cpf'),
    ) { }

    run(): void {
        const partialCpf = process.argv[CLI_PARTIAL_CPF_ARG_INDEX];
        const regionDigit = process.argv[CLI_REGION_DIGIT_ARG_INDEX];

        if (!partialCpf) {
            this.logger.error(CLI_USAGE_MESSAGE);
            process.exit(1);
        }

        this.logger.info(GENERATION_START_MESSAGE);
        this.logger.info(SEPARATOR_LINE);

        try {
            const generatedRecords = this.generatorService.generate(partialCpf, regionDigit);
            const outputFilePath = this.writer.save(generatedRecords);

            generatedRecords.forEach((record) => {
                this.logger.output(`${CPF_FOUND_MESSAGE_PREFIX} ${record.formattedCpf}`);
            });

            this.logger.info(SEPARATOR_LINE);
            this.logger.info(`${TOTAL_FOUND_MESSAGE_PREFIX} ${generatedRecords.length}`);
            this.logger.info(`${OUTPUT_FILE_MESSAGE_PREFIX} ${outputFilePath}`);
        } catch (error) {
            const message = error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE;
            this.logger.error(`${GENERATION_ERROR_PREFIX} ${message}`);
            process.exit(1);
        }
    }
}

export function runFromCli(): void {
    new GeneratorCpfCliRunner().run();
}
