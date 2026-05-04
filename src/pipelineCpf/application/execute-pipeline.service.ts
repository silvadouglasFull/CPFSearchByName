import { StateRegionDigitResolver } from '@/pipelineCpf/application/state-region-digit.resolver';
import {
    EMPTY_PARTIAL_CPF_MESSAGE,
    EMPTY_SEARCH_NAME_MESSAGE,
    FOUND_RECORDS_PREFIX,
    FOUND_RECORDS_SUFFIX,
    JSON_OUTPUT_INDENT_SPACES,
    NO_CPF_MATCH_MESSAGE,
    NO_GENERATED_CPF_MESSAGE,
    PARTIAL_CPF_PROMPT,
    REGION_DIGIT_MIDDLE,
    REGION_DIGIT_PREFIX,
    SEARCH_NAME_PROMPT,
    STATE_CODE_PROMPT,
    STEP_1_MESSAGE,
    STEP_2_MESSAGE,
    STEP_3_MESSAGE,
} from '@/pipelineCpf/domain/constants';
import { PipelineDependencies, PromptClient } from '@/pipelineCpf/domain/types';
import { FileLogger } from '@/shared/logging/file-logger.service';

export class ExecutePipelineService {
    constructor(
        private readonly promptClient: PromptClient,
        private readonly dependencies: PipelineDependencies,
        private readonly stateRegionDigitResolver: StateRegionDigitResolver,
        private readonly logger = new FileLogger('pipeline-cpf'),
    ) { }

    async execute(): Promise<void> {
        const searchName = await this.promptClient.ask(SEARCH_NAME_PROMPT);

        if (!searchName) {
            throw new Error(EMPTY_SEARCH_NAME_MESSAGE);
        }

        this.logger.output('');
        this.logger.info(STEP_1_MESSAGE);
        await this.dependencies.collectPortalData(searchName);

        const partialCpf = await this.promptClient.ask(`\n${PARTIAL_CPF_PROMPT}`);

        if (!partialCpf) {
            throw new Error(EMPTY_PARTIAL_CPF_MESSAGE);
        }

        this.logger.output('');
        this.logger.info(STEP_2_MESSAGE);
        const foundRecords = this.dependencies.filterByPartialCpf(partialCpf);

        if (foundRecords.length === 0) {
            this.logger.info(NO_CPF_MATCH_MESSAGE);
            return;
        }

        this.logger.info(`${FOUND_RECORDS_PREFIX} ${foundRecords.length} ${FOUND_RECORDS_SUFFIX}`);
        this.logger.output(JSON.stringify(foundRecords, null, JSON_OUTPUT_INDENT_SPACES));

        const stateCode = await this.promptClient.ask(`\n${STATE_CODE_PROMPT}`);
        const regionDigit = this.stateRegionDigitResolver.resolveByState(stateCode);

        this.logger.info(`${REGION_DIGIT_PREFIX} ${stateCode.toUpperCase()} ${REGION_DIGIT_MIDDLE} ${regionDigit}.`);
        this.logger.output('');
        this.logger.info(STEP_3_MESSAGE);

        const generatedRecords = this.dependencies.generateCpfCandidates(partialCpf, regionDigit);

        if (generatedRecords.length === 0) {
            this.logger.info(NO_GENERATED_CPF_MESSAGE);
            return;
        }

        generatedRecords.forEach((record) => {
            this.logger.output(record.formattedCpf);
        });
        this.logger.info(`Total CPF candidates generated: ${generatedRecords.length}`);
    }
}
