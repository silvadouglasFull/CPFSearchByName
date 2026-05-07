import { encryptedCpf } from '@/database/custom-types/encrypted-cpf';
import { boolean, index, integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

export const appSettings = pgTable('app_settings', {
    id: uuid('id').defaultRandom().primaryKey(),
    singletonKey: text('singleton_key').notNull().unique().default('global'),
    resultsPerPage: integer('results_per_page').notNull().default(10),
    totalPages: integer('total_pages').notNull().default(6),
    pageResponseTimeoutMs: integer('page_response_timeout_ms').notNull().default(30000),
    pageNavigationTimeoutMs: integer('page_navigation_timeout_ms').notNull().default(60000),
    pageSelectorTimeoutMs: integer('page_selector_timeout_ms').notNull().default(15000),
    pageThrottleDelayMs: integer('page_throttle_delay_ms').notNull().default(1000),
    jsonOutputIndentSpaces: integer('json_output_indent_spaces').notNull().default(2),
    fileEncodingUtf8: text('file_encoding_utf8').notNull().default('utf-8'),
    cliFirstUserArgIndex: integer('cli_first_user_arg_index').notNull().default(2),
    firstPageNumber: integer('first_page_number').notNull().default(1),
    searchPageUrl: text('search_page_url').notNull().default('https://portaldatransparencia.gov.br/pessoa-fisica/busca/lista'),
    detailsPageUrl: text('details_page_url').notNull().default('https://portaldatransparencia.gov.br/busca/pessoa-fisica'),
    searchApiHostname: text('search_api_hostname').notNull().default('busca.portaldatransparencia.gov.br'),
    searchApiPathname: text('search_api_pathname').notNull().default('/busca/pessoa-fisica'),
    defaultPageSelector: text('default_page_selector').notNull().default('#paginacao li[data-lp="1"] a'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const filterCpfSearchHistory = pgTable('filter_cpf_search_history', {
    id: uuid('id').defaultRandom().primaryKey(),
    searchTerm: text('search_term').notNull(),
    resultRecords: jsonb('result_records').notNull(),
    resultCount: integer('result_count').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const generatorCpfHistory = pgTable('generator_cpf_history', {
    id: uuid('id').defaultRandom().primaryKey(),
    partialCpf: text('partial_cpf').notNull(),
    stateRegionDigit: text('state_region_digit'),
    resultCount: integer('result_count').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const generatorCpfHistoryRecords = pgTable(
    'generator_cpf_history_records',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        historyId: uuid('history_id')
            .notNull()
            .references(() => generatorCpfHistory.id, { onDelete: 'cascade' }),
        hubdoLookupId: uuid('hubdo_lookup_id').references(() => hubdoCpfLookups.id, { onDelete: 'set null' }),
        cpf: text('cpf').notNull(),
        formattedCpf: text('formatted_cpf').notNull(),
        baseNineDigits: text('base_nine_digits').notNull(),
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => ({
        historyIdIdx: index('gchr_hist_id_idx').on(table.historyId),
        hubdoLookupIdIdx: index('gchr_hubdo_lu_id_idx').on(table.hubdoLookupId),
    }),
);

export const getCpfsByNameSearchHistory = pgTable('get_cpfs_by_name_search_history', {
    id: uuid('id').defaultRandom().primaryKey(),
    searchName: text('search_name').notNull(),
    resultCount: integer('result_count').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const getCpfsByNameSearchRecords = pgTable('get_cpfs_by_name_search_records', {
    id: uuid('id').defaultRandom().primaryKey(),
    searchId: uuid('search_id')
        .notNull()
        .references(() => getCpfsByNameSearchHistory.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    cpf: text('cpf').notNull(),
    relation: text('relation').notNull(),
    detailsLink: text('details_link').notNull(),
    sourcePage: integer('source_page').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const hubdoCpfLookups = pgTable(
    'hubdo_cpf_lookups',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        cpf: text('cpf').notNull(),
        cpfEncrypted: encryptedCpf('cpf_encrypted'),
        cpfHash: text('cpf_hash'),
        birthDate: text('birth_date'),
        queryMode: text('query_mode').notNull(), // 'normal' | 'turbo'
        requestStatus: text('request_status').notNull(), // 'OK' | 'NOK'
        errorCode: text('error_code'),
        errorMessage: text('error_message'),
        responseName: text('response_name'),
        responseBirthDate: text('response_birth_date'),
        responseCadastralStatus: text('response_cadastral_status'),
        responseInscriptionDate: text('response_inscription_date'),
        responseCheckDigit: text('response_check_digit'),
        responseProof: text('response_proof'),
        responseProofDate: text('response_proof_date'),
        creditosConsumidos: integer('creditos_consumidos').notNull(),
        origem: text('origem').notNull(), // 'database' | 'receita_federal' | 'turbo'
        fullResponse: jsonb('full_response'),
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => ({
        cpfHashIdx: index('hcl_cpf_hash_idx').on(table.cpfHash),
    }),
);

export const hubdoBulkLookupJobs = pgTable(
    'hubdo_bulk_lookup_jobs',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        mode: text('mode').notNull(), // 'normal' | 'turbo'
        targetName: text('target_name').notNull(),
        targetNameNormalized: text('target_name_normalized').notNull(),
        status: text('status').notNull(), // 'queued' | 'processing' | 'completed' | 'failed' | 'found'
        totalItems: integer('total_items').notNull(),
        queuedItems: integer('queued_items').notNull().default(0),
        processingItems: integer('processing_items').notNull().default(0),
        successItems: integer('success_items').notNull().default(0),
        errorItems: integer('error_items').notNull().default(0),
        deadLetterItems: integer('dead_letter_items').notNull().default(0),
        skippedItems: integer('skipped_items').notNull().default(0),
        findMatchMode: boolean('find_match_mode').notNull().default(false),
        foundCpf: text('found_cpf'),
        foundName: text('found_name'),
        foundBirthDate: text('found_birth_date'),
        requestedBy: text('requested_by'),
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
        finishedAt: timestamp('finished_at', { withTimezone: true }),
    },
    (table) => ({
        statusIdx: index('hblj_status_idx').on(table.status),
        targetNameNormalizedIdx: index('hblj_tn_norm_idx').on(table.targetNameNormalized),
    }),
);

export const hubdoBulkLookupJobItems = pgTable(
    'hubdo_bulk_lookup_job_items',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        jobId: uuid('job_id')
            .notNull()
            .references(() => hubdoBulkLookupJobs.id, { onDelete: 'cascade' }),
        cpf: text('cpf').notNull(),
        status: text('status').notNull(), // 'queued' | 'processing' | 'success' | 'error' | 'dead_letter'
        attemptCount: integer('attempt_count').notNull().default(0),
        errorCode: text('error_code'),
        errorMessage: text('error_message'),
        creditosConsumidos: integer('creditos_consumidos').notNull().default(0),
        origin: text('origin'),
        hubdoLookupId: uuid('hubdo_lookup_id').references(() => hubdoCpfLookups.id, { onDelete: 'set null' }),
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
        finishedAt: timestamp('finished_at', { withTimezone: true }),
    },
    (table) => ({
        jobIdIdx: index('hblji_job_id_idx').on(table.jobId),
        statusIdx: index('hblji_status_idx').on(table.status),
        jobCpfUniqueIdx: uniqueIndex('hblji_job_cpf_uidx').on(table.jobId, table.cpf),
        hubdoLookupIdIdx: index('hblji_hubdo_lu_id_idx').on(table.hubdoLookupId),
    }),
);

export const hubdoBulkLookupNameMatches = pgTable(
    'hubdo_bulk_lookup_name_matches',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        jobId: uuid('job_id')
            .notNull()
            .references(() => hubdoBulkLookupJobs.id, { onDelete: 'cascade' }),
        cpf: text('cpf').notNull(),
        targetName: text('target_name').notNull(),
        targetNameNormalized: text('target_name_normalized').notNull(),
        foundName: text('found_name').notNull(),
        foundNameNormalized: text('found_name_normalized').notNull(),
        foundBirthDate: text('found_birth_date'),
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => ({
        jobIdIdx: index('hblnm_job_id_idx').on(table.jobId),
        targetNameNormalizedCpfUid: uniqueIndex('hblnm_tn_cpf_uidx').on(
            table.targetNameNormalized,
            table.cpf,
        ),
    }),
);

export const hubdoBulkLookupNameExclusions = pgTable(
    'hubdo_bulk_lookup_name_exclusions',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        jobId: uuid('job_id')
            .notNull()
            .references(() => hubdoBulkLookupJobs.id, { onDelete: 'cascade' }),
        cpf: text('cpf').notNull(),
        targetName: text('target_name').notNull(),
        targetNameNormalized: text('target_name_normalized').notNull(),
        lastFoundName: text('last_found_name').notNull(),
        lastFoundNameNormalized: text('last_found_name_normalized').notNull(),
        lastFoundBirthDate: text('last_found_birth_date'),
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => ({
        jobIdIdx: index('hblne_job_id_idx').on(table.jobId),
        targetNameNormalizedCpfUid: uniqueIndex('hblne_tn_cpf_uidx').on(
            table.targetNameNormalized,
            table.cpf,
        ),
    }),
);
