import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const userSettings = pgTable('user_settings', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').notNull().unique(),
    totalPages: integer('total_pages').notNull().default(6),
    resultsPerPage: integer('results_per_page').notNull().default(10),
    throttleDelayMs: integer('throttle_delay_ms').notNull().default(1000),
    pageResponseTimeoutMs: integer('page_response_timeout_ms').notNull().default(30000),
    pageNavigationTimeoutMs: integer('page_navigation_timeout_ms').notNull().default(60000),
    pageSelectorTimeoutMs: integer('page_selector_timeout_ms').notNull().default(15000),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
