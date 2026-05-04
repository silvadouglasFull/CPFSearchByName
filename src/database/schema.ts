import { integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

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
    resultRecords: jsonb('result_records').notNull(),
    resultCount: integer('result_count').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
