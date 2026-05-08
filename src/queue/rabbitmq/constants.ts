export const HUBDO_BULK_LOOKUP_EXCHANGE = 'hubdo.bulk.lookup.exchange';
export const HUBDO_BULK_LOOKUP_QUEUE = 'hubdo.bulk.lookup.queue';
export const HUBDO_BULK_LOOKUP_ROUTING_KEY = 'hubdo.bulk.lookup.item';

export const HUBDO_BULK_LOOKUP_FIND_MATCH_QUEUE = 'hubdo.bulk.lookup.find.match.queue';

export const HUBDO_BULK_LOOKUP_DLX_EXCHANGE = 'hubdo.bulk.lookup.dlx';
export const HUBDO_BULK_LOOKUP_DLQ = 'hubdo.bulk.lookup.dlq';
export const HUBDO_BULK_LOOKUP_DLQ_ROUTING_KEY = 'hubdo.bulk.lookup.item.dead';

export const CREDIFY_PHONE_LOOKUP_EXCHANGE = 'credify.phone.lookup.exchange';
export const CREDIFY_PHONE_LOOKUP_QUEUE = 'credify.phone.lookup.queue';
export const CREDIFY_PHONE_LOOKUP_ROUTING_KEY = 'credify.phone.lookup.item';

export const CREDIFY_PHONE_LOOKUP_DLX_EXCHANGE = 'credify.phone.lookup.dlx';
export const CREDIFY_PHONE_LOOKUP_DLQ = 'credify.phone.lookup.dlq';
export const CREDIFY_PHONE_LOOKUP_DLQ_ROUTING_KEY = 'credify.phone.lookup.item.dead';

export function getRabbitMqUrl(): string {
    return process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
}

export function getRabbitMqPrefetch(): number {
    const parsed = Number(process.env.RABBITMQ_PREFETCH ?? 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 10;
}

export function getBulkMaxRetries(): number {
    const parsed = Number(process.env.HUBDO_BULK_MAX_RETRIES ?? 3);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 3;
}

export function getBulkRetryDelayMs(): number {
    const parsed = Number(process.env.HUBDO_BULK_RETRY_DELAY_MS ?? 1000);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 1000;
}

export function getCredifyMaxRetries(): number {
    const parsed = Number(process.env.CREDIFYAPIS_MAX_RETRIES ?? 3);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 3;
}

export function getCredifyRetryDelayMs(): number {
    const parsed = Number(process.env.CREDIFYAPIS_RETRY_DELAY_MS ?? 1000);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 1000;
}
